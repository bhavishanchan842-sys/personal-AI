import os
import json
import asyncio
import uuid
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, Depends
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.config import STATIC_DIR, BASE_DIR
from backend import database
from backend.memory_engine import retrieve_relevant_memories, add_or_update_memory
from backend.persona_engine import assemble_system_prompt
from backend.llm_client import (
    stream_chat_completion, 
    extract_and_store_memories, 
    get_active_provider_and_model,
    get_api_key
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema & migrations on startup
    database.init_db()
    yield

app = FastAPI(title="Personal AI Companion & Memory Engine", lifespan=lifespan)

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
if not STATIC_DIR.exists():
    STATIC_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Helper: Extract Tenant User ID
def get_user_id(request: Request) -> str:
    user_id = request.headers.get("X-User-Id") or request.query_params.get("user_id")
    if user_id and user_id.strip():
        uid = user_id.strip()
        database.touch_user_activity(uid)
        return uid
    return "default"

# --- Request/Response Models ---

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(..., min_length=1)
    temperature: Optional[float] = 0.7

class MemoryCreateRequest(BaseModel):
    content: str = Field(..., min_length=2)
    category: str = "fact"
    importance: float = Field(0.5, ge=0.0, le=1.0)

class MemoryUpdateRequest(BaseModel):
    content: str
    category: str
    importance: float

class ProfileUpdateRequest(BaseModel):
    key: str
    value: str
    category: str = "general"

class PersonaUpdateRequest(BaseModel):
    ai_name: str
    user_name: str
    tone_preset: str
    warmth: int
    humor: int
    directness: int
    formality: int
    use_emojis: bool
    custom_instructions: Optional[str] = ""

class SettingsUpdateRequest(BaseModel):
    active_provider: str
    active_model: str
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    ollama_base_url: Optional[str] = None

class OnboardingRequest(BaseModel):
    user_id: Optional[str] = None
    name: str = Field(..., min_length=1)
    preferred_nickname: Optional[str] = None
    occupation: Optional[str] = None
    primary_goals: Optional[str] = None
    communication_preference: Optional[str] = None
    tone_preset: Optional[str] = "Empathetic Companion"

# --- UI Route ---

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return HTMLResponse("<h1>Personal AI System Backend is Running.</h1><p>Static UI loading...</p>")

# --- User Management Endpoints ---

@app.get("/api/users")
async def list_users():
    """List all registered isolated user profiles."""
    users = database.get_users_list()
    return {"users": users}

@app.delete("/api/users/{target_user_id}")
async def remove_user(target_user_id: str):
    database.delete_user(target_user_id)
    return {"success": True}

# --- Chat & Streaming Endpoints ---

@app.post("/api/chat")
async def chat_endpoint(payload: ChatRequest, request: Request, background_tasks: BackgroundTasks):
    user_id = get_user_id(request)
    session_id = payload.session_id or str(uuid.uuid4())
    user_msg = payload.message.strip()

    # 1. Ensure chat session exists for this user
    database.create_session(session_id, title=user_msg[:35] + ("..." if len(user_msg) > 35 else ""), user_id=user_id)

    # 2. Retrieve memories relevant to this specific user
    retrieved_memories = retrieve_relevant_memories(user_msg, top_k=5, user_id=user_id)
    memory_ids = [m["id"] for m in retrieved_memories]

    # 3. Load user-specific profile and persona configuration
    profile = database.get_profile(user_id=user_id)
    persona = database.get_persona_config(user_id=user_id)

    # 4. Synthesize context-aware system prompt
    system_prompt = assemble_system_prompt(
        persona_config=persona,
        user_profile=profile,
        retrieved_memories=retrieved_memories
    )

    # 5. Fetch recent conversation messages for this session
    history_rows = database.get_session_messages(session_id, limit=12)
    formatted_history = []
    for r in history_rows:
        formatted_history.append({"role": r["role"], "content": r["content"]})
    formatted_history.append({"role": "user", "content": user_msg})

    # 6. Save user message to database
    database.add_message(session_id=session_id, role="user", content=user_msg)

    # 7. Generator for Streaming SSE response
    async def sse_generator():
        # Metadata event
        meta_event = {
            "type": "meta",
            "session_id": session_id,
            "memory_triggers": retrieved_memories
        }
        yield f"data: {json.dumps(meta_event)}\n\n"

        full_assistant_response = []
        try:
            async for token in stream_chat_completion(
                messages=formatted_history,
                system_prompt=system_prompt,
                temperature=payload.temperature or 0.7
            ):
                full_assistant_response.append(token)
                yield f"data: {json.dumps({'type': 'token', 'token': token})}\n\n"
        except Exception as e:
            err_msg = f"\n*[Stream error: {str(e)}]*"
            full_assistant_response.append(err_msg)
            yield f"data: {json.dumps({'type': 'token', 'token': err_msg})}\n\n"

        assistant_text = "".join(full_assistant_response)

        # Save assistant message to database
        database.add_message(
            session_id=session_id,
            role="assistant",
            content=assistant_text,
            memory_triggers=memory_ids
        )

        # Send completion event
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

        # Trigger background memory extraction for this isolated user
        asyncio.create_task(
            extract_and_store_memories(
                user_message=user_msg,
                assistant_response=assistant_text,
                session_id=session_id,
                user_id=user_id
            )
        )

    return StreamingResponse(sse_generator(), media_type="text/event-stream")

# --- Memory Management Endpoints (Scoped per User) ---

@app.get("/api/memories")
async def list_memories(request: Request, category: Optional[str] = None, search: Optional[str] = None):
    user_id = get_user_id(request)
    memories = database.get_all_memories(user_id=user_id, category=category, search=search)
    return {"memories": memories, "count": len(memories), "user_id": user_id}

@app.post("/api/memories")
async def create_memory(payload: MemoryCreateRequest, request: Request):
    user_id = get_user_id(request)
    mem_id, action = add_or_update_memory(
        content=payload.content,
        category=payload.category,
        importance=payload.importance,
        user_id=user_id
    )
    return {"id": mem_id, "action": action, "success": True}

@app.put("/api/memories/{memory_id}")
async def edit_memory(memory_id: int, payload: MemoryUpdateRequest, request: Request):
    user_id = get_user_id(request)
    success = database.update_memory(
        memory_id=memory_id,
        content=payload.content,
        category=payload.category,
        importance=payload.importance,
        user_id=user_id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Memory not found")
    return {"success": True}

@app.delete("/api/memories/{memory_id}")
async def remove_memory(memory_id: int, request: Request):
    user_id = get_user_id(request)
    success = database.delete_memory(memory_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory not found")
    return {"success": True}

@app.post("/api/memories/test-retrieval")
async def test_retrieval(query: str, request: Request, top_k: int = 5):
    user_id = get_user_id(request)
    results = retrieve_relevant_memories(query, top_k=top_k, user_id=user_id)
    return {"query": query, "retrieved": results, "count": len(results)}

# --- Profile & Persona Endpoints (Scoped per User) ---

@app.get("/api/profile")
async def get_user_profile(request: Request):
    user_id = get_user_id(request)
    return {"profile": database.get_profile(user_id=user_id), "user_id": user_id}

@app.post("/api/profile")
async def update_user_profile(payload: ProfileUpdateRequest, request: Request):
    user_id = get_user_id(request)
    database.set_profile_field(payload.key, payload.value, payload.category, user_id=user_id)
    return {"success": True, "profile": database.get_profile(user_id=user_id)}

@app.delete("/api/profile/{key}")
async def delete_user_profile_field(key: str, request: Request):
    user_id = get_user_id(request)
    success = database.delete_profile_field(key, user_id=user_id)
    return {"success": success}

@app.get("/api/persona")
async def get_persona(request: Request):
    user_id = get_user_id(request)
    return {"persona": database.get_persona_config(user_id=user_id), "user_id": user_id}

@app.post("/api/persona")
async def update_persona(payload: PersonaUpdateRequest, request: Request):
    user_id = get_user_id(request)
    database.save_persona_config(payload.model_dump(), user_id=user_id)
    return {"success": True, "persona": database.get_persona_config(user_id=user_id)}

@app.post("/api/onboarding")
async def onboarding_endpoint(payload: OnboardingRequest, request: Request):
    # Determine user_id
    user_id = (payload.user_id or request.headers.get("X-User-Id") or f"usr_{uuid.uuid4().hex[:10]}").strip()
    name = payload.name.strip()
    nickname = (payload.preferred_nickname or name).strip()
    
    # 1. Register/update user record
    database.create_or_update_user(user_id=user_id, name=name, nickname=nickname)

    # 2. Update core profile fields for this user
    database.set_profile_field("name", name, "identity", user_id=user_id)
    database.set_profile_field("preferred_nickname", nickname, "identity", user_id=user_id)
    if payload.occupation and payload.occupation.strip():
        database.set_profile_field("occupation", payload.occupation.strip(), "work", user_id=user_id)
    if payload.primary_goals and payload.primary_goals.strip():
        database.set_profile_field("primary_goals", payload.primary_goals.strip(), "goals", user_id=user_id)
    if payload.communication_preference and payload.communication_preference.strip():
        database.set_profile_field("communication_preference", payload.communication_preference.strip(), "preferences", user_id=user_id)

    # 3. Update persona config with user name and preset for this user
    persona = database.get_persona_config(user_id=user_id)
    persona["user_name"] = nickname
    if payload.tone_preset:
        persona["tone_preset"] = payload.tone_preset
    database.save_persona_config(persona, user_id=user_id)

    # 4. Seed initial memory facts into vault for this user
    if payload.occupation and payload.occupation.strip():
        add_or_update_memory(f"User works as: {payload.occupation.strip()}", category="work", importance=0.85, user_id=user_id)
    if payload.primary_goals and payload.primary_goals.strip():
        add_or_update_memory(f"User's primary goal is: {payload.primary_goals.strip()}", category="goal", importance=0.9, user_id=user_id)
    if payload.communication_preference and payload.communication_preference.strip():
        add_or_update_memory(f"User prefers communication that is: {payload.communication_preference.strip()}", category="preference", importance=0.8, user_id=user_id)

    return {
        "success": True,
        "user_id": user_id,
        "user_name": nickname,
        "profile": database.get_profile(user_id=user_id),
        "persona": database.get_persona_config(user_id=user_id)
    }

# --- Sessions & History (Scoped per User) ---

@app.get("/api/sessions")
async def list_sessions(request: Request):
    user_id = get_user_id(request)
    return {"sessions": database.get_sessions(user_id=user_id)}

@app.get("/api/sessions/{session_id}/messages")
async def get_session_history(session_id: str):
    messages = database.get_session_messages(session_id)
    return {"session_id": session_id, "messages": messages}

@app.delete("/api/sessions/{session_id}")
async def delete_chat_session(session_id: str, request: Request):
    user_id = get_user_id(request)
    success = database.delete_session(session_id, user_id=user_id)
    return {"success": success}

@app.put("/api/sessions/{session_id}/title")
async def update_session_title(session_id: str, title: str):
    database.update_session_title(session_id, title)
    return {"success": True}

# --- Settings & Configuration (Shared System Settings) ---

@app.get("/api/settings")
async def get_settings():
    provider, model = get_active_provider_and_model()
    gemini_key = get_api_key("gemini")
    openai_key = get_api_key("openai")
    groq_key = get_api_key("groq")
    
    def mask_key(k):
        if not k:
            return ""
        return k[:4] + "..." + k[-4:] if len(k) > 8 else "****"

    return {
        "active_provider": provider,
        "active_model": model,
        "gemini_api_key_set": bool(gemini_key),
        "gemini_api_key_masked": mask_key(gemini_key),
        "openai_api_key_set": bool(openai_key),
        "openai_api_key_masked": mask_key(openai_key),
        "groq_api_key_set": bool(groq_key),
        "groq_api_key_masked": mask_key(groq_key),
    }

@app.post("/api/settings")
async def save_settings(payload: SettingsUpdateRequest):
    with database.get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('active_provider', ?, CURRENT_TIMESTAMP)", (payload.active_provider,))
        cursor.execute("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('active_model', ?, CURRENT_TIMESTAMP)", (payload.active_model,))
        if payload.gemini_api_key is not None and payload.gemini_api_key.strip():
            cursor.execute("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('gemini_api_key', ?, CURRENT_TIMESTAMP)", (payload.gemini_api_key.strip(),))
        if payload.openai_api_key is not None and payload.openai_api_key.strip():
            cursor.execute("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('openai_api_key', ?, CURRENT_TIMESTAMP)", (payload.openai_api_key.strip(),))
        if payload.groq_api_key is not None and payload.groq_api_key.strip():
            cursor.execute("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('groq_api_key', ?, CURRENT_TIMESTAMP)", (payload.groq_api_key.strip(),))
        conn.commit()
    return {"success": True}

# --- Backup & Restore (Scoped per User) ---

@app.get("/api/export")
async def export_data(request: Request):
    user_id = get_user_id(request)
    memories = database.get_all_memories(user_id=user_id)
    profile = database.get_profile(user_id=user_id)
    persona = database.get_persona_config(user_id=user_id)
    sessions = database.get_sessions(user_id=user_id)
    
    all_chats = {}
    for s in sessions:
        all_chats[s["id"]] = {
            "session": s,
            "messages": database.get_session_messages(s["id"])
        }

    export_obj = {
        "version": "2.0",
        "user_id": user_id,
        "exported_at": str(asyncio.get_event_loop().time()),
        "user_profile": profile,
        "persona": persona,
        "memories": memories,
        "chats": all_chats
    }
    return JSONResponse(content=export_obj)

@app.post("/api/import")
async def import_data(request: Request):
    user_id = get_user_id(request)
    data = await request.json()
    # Import profile
    for k, v in data.get("user_profile", {}).items():
        val = v.get("value") if isinstance(v, dict) else str(v)
        cat = v.get("category", "general") if isinstance(v, dict) else "general"
        database.set_profile_field(k, val, cat, user_id=user_id)

    # Import persona
    if "persona" in data:
        database.save_persona_config(data["persona"], user_id=user_id)

    # Import memories
    for m in data.get("memories", []):
        add_or_update_memory(
            content=m.get("content", ""),
            category=m.get("category", "fact"),
            importance=m.get("importance", 0.5),
            user_id=user_id
        )

    return {"success": True, "imported_memories_count": len(data.get("memories", []))}
