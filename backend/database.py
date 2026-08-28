import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.config import DATABASE_PATH, DEFAULT_PERSONA

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    """Initializes the database schema if tables do not exist."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # 1. System & Persona Settings
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 2. Structured User Profile (Identity, Core Traits, Goals)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_profile (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 3. Persistent Semantic & Episodic Memories
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                category TEXT DEFAULT 'fact',
                importance REAL DEFAULT 0.5,
                source_session_id TEXT,
                embedding TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                access_count INTEGER DEFAULT 0
            )
        """)
        
        # 4. Chat Sessions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 5. Chat Messages
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                memory_triggers TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
            )
        """)
        
        # Initialize default persona if empty
        cursor.execute("SELECT value FROM settings WHERE key = 'persona'")
        if not cursor.fetchone():
            cursor.execute(
                "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
                ('persona', DEFAULT_PERSONA.model_dump_json())
            )
            
        # Initialize default user profile if empty
        cursor.execute("SELECT COUNT(*) as count FROM user_profile")
        if cursor.fetchone()['count'] == 0:
            defaults = [
                ('name', 'Bhavik', 'identity'),
                ('preferred_nickname', 'Bhavik', 'identity'),
                ('primary_goals', 'Building cutting-edge AI and software systems', 'goals'),
                ('communication_preference', 'Direct, insightful, thoughtful, and authentic', 'preferences')
            ]
            cursor.executemany(
                "INSERT OR REPLACE INTO user_profile (key, value, category, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
                defaults
            )
            
        conn.commit()

# --- Memory CRUD Functions ---

def insert_memory(content: str, category: str = "fact", importance: float = 0.5, 
                  embedding: Optional[List[float]] = None, source_session_id: Optional[str] = None) -> int:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        emb_json = json.dumps(embedding) if embedding is not None else None
        cursor.execute("""
            INSERT INTO memories (content, category, importance, source_session_id, embedding, created_at, last_accessed_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """, (content.strip(), category, importance, source_session_id, emb_json))
        conn.commit()
        return cursor.lastrowid

def get_all_memories(category: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = "SELECT id, content, category, importance, source_session_id, created_at, last_accessed_at, access_count FROM memories"
        params = []
        conditions = []
        
        if category and category != "all":
            conditions.append("category = ?")
            params.append(category)
        if search:
            conditions.append("content LIKE ?")
            params.append(f"%{search}%")
            
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY created_at DESC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_memories_with_embeddings() -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, content, category, importance, embedding, created_at, access_count FROM memories")
        rows = cursor.fetchall()
        results = []
        for r in rows:
            d = dict(r)
            if d.get("embedding"):
                try:
                    d["embedding"] = json.loads(d["embedding"])
                except Exception:
                    d["embedding"] = None
            results.append(d)
        return results

def update_memory(memory_id: int, content: str, category: str, importance: float, embedding: Optional[List[float]] = None) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if embedding is not None:
            cursor.execute("""
                UPDATE memories 
                SET content = ?, category = ?, importance = ?, embedding = ?
                WHERE id = ?
            """, (content.strip(), category, importance, json.dumps(embedding), memory_id))
        else:
            cursor.execute("""
                UPDATE memories 
                SET content = ?, category = ?, importance = ?
                WHERE id = ?
            """, (content.strip(), category, importance, memory_id))
        conn.commit()
        return cursor.rowcount > 0

def delete_memory(memory_id: int) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM memories WHERE id = ?", (memory_id,))
        conn.commit()
        return cursor.rowcount > 0

def record_memory_access(memory_ids: List[int]):
    if not memory_ids:
        return
    with get_db_connection() as conn:
        cursor = conn.cursor()
        placeholders = ",".join("?" for _ in memory_ids)
        cursor.execute(f"""
            UPDATE memories 
            SET access_count = access_count + 1, last_accessed_at = CURRENT_TIMESTAMP
            WHERE id IN ({placeholders})
        """, memory_ids)
        conn.commit()

# --- User Profile & Persona Config ---

def get_profile() -> Dict[str, Any]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT key, value, category, updated_at FROM user_profile")
        rows = cursor.fetchall()
        return {r["key"]: {"value": r["value"], "category": r["category"], "updated_at": r["updated_at"]} for r in rows}

def set_profile_field(key: str, value: str, category: str = "general"):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_profile (key, value, category, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET value=excluded.value, category=excluded.category, updated_at=CURRENT_TIMESTAMP
        """, (key, value, category))
        conn.commit()

def delete_profile_field(key: str) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_profile WHERE key = ?", (key,))
        conn.commit()
        return cursor.rowcount > 0

def get_persona_config() -> Dict[str, Any]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM settings WHERE key = 'persona'")
        row = cursor.fetchone()
        if row:
            try:
                return json.loads(row["value"])
            except Exception:
                pass
        return DEFAULT_PERSONA.model_dump()

def save_persona_config(config_dict: Dict[str, Any]):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO settings (key, value, updated_at)
            VALUES ('persona', ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP
        """, (json.dumps(config_dict),))
        conn.commit()

# --- Chat Sessions & Messages ---

def create_session(session_id: str, title: str = "New Conversation"):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR IGNORE INTO chat_sessions (id, title, created_at, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """, (session_id, title))
        conn.commit()

def get_sessions() -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.id, s.title, s.created_at, s.updated_at, COUNT(m.id) as message_count
            FROM chat_sessions s
            LEFT JOIN chat_messages m ON s.id = m.session_id
            GROUP BY s.id
            ORDER BY s.updated_at DESC
        """)
        rows = cursor.fetchall()
        return [dict(r) for r in rows]

def get_session_messages(session_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, session_id, role, content, memory_triggers, created_at
            FROM chat_messages
            WHERE session_id = ?
            ORDER BY id ASC
            LIMIT ?
        """, (session_id, limit))
        rows = cursor.fetchall()
        results = []
        for r in rows:
            d = dict(r)
            if d.get("memory_triggers"):
                try:
                    d["memory_triggers"] = json.loads(d["memory_triggers"])
                except Exception:
                    d["memory_triggers"] = []
            results.append(d)
        return results

def add_message(session_id: str, role: str, content: str, memory_triggers: Optional[List[int]] = None) -> int:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        # Update session timestamp
        cursor.execute("UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (session_id,))
        # Insert message
        triggers_json = json.dumps(memory_triggers) if memory_triggers else None
        cursor.execute("""
            INSERT INTO chat_messages (session_id, role, content, memory_triggers, created_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (session_id, role, content, triggers_json))
        conn.commit()
        return cursor.lastrowid

def update_session_title(session_id: str, title: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE chat_sessions SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (title, session_id))
        conn.commit()

def delete_session(session_id: str) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM chat_sessions WHERE id = ?", (session_id,))
        conn.commit()
        return cursor.rowcount > 0
