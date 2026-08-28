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
    """Initializes the database schema with full multi-user tenant isolation."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # 1. Global System Settings (API keys, provider configuration)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 2. Registered Users Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                nickname TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 3. Isolated User Profiles (Identity, Core Traits, Goals per user_id)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id TEXT NOT NULL,
                key TEXT NOT NULL,
                value TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, key)
            )
        """)

        # 4. Isolated User Persona Configurations
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_personas (
                user_id TEXT PRIMARY KEY,
                config TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 5. Persistent Semantic & Episodic Memories (per user_id)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT DEFAULT 'default',
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
        
        # 6. Chat Sessions (per user_id)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT DEFAULT 'default',
                title TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 7. Chat Messages
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

        # --- Automatic Schema Migrations for Existing Databases ---
        # Migration: Add user_id column to memories if missing
        cursor.execute("PRAGMA table_info(memories)")
        mem_columns = [col["name"] for col in cursor.fetchall()]
        if "user_id" not in mem_columns:
            cursor.execute("ALTER TABLE memories ADD COLUMN user_id TEXT DEFAULT 'default'")

        # Migration: Add user_id column to chat_sessions if missing
        cursor.execute("PRAGMA table_info(chat_sessions)")
        session_columns = [col["name"] for col in cursor.fetchall()]
        if "user_id" not in session_columns:
            cursor.execute("ALTER TABLE chat_sessions ADD COLUMN user_id TEXT DEFAULT 'default'")

        # Migration: Migrate legacy user_profile table data to user_profiles if needed
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_profile'")
        if cursor.fetchone():
            cursor.execute("SELECT key, value, category, updated_at FROM user_profile")
            legacy_rows = cursor.fetchall()
            for row in legacy_rows:
                cursor.execute("""
                    INSERT OR IGNORE INTO user_profiles (user_id, key, value, category, updated_at)
                    VALUES ('default', ?, ?, ?, ?)
                """, (row["key"], row["value"], row["category"], row["updated_at"]))

        # Initialize default user if table is empty
        cursor.execute("SELECT COUNT(*) as count FROM users")
        if cursor.fetchone()["count"] == 0:
            cursor.execute("""
                INSERT OR IGNORE INTO users (id, name, nickname, created_at, last_active_at)
                VALUES ('default', 'Bhavik', 'Bhavik', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """)

            # Seed default profile for default user
            cursor.execute("SELECT COUNT(*) as count FROM user_profiles WHERE user_id = 'default'")
            if cursor.fetchone()["count"] == 0:
                defaults = [
                    ('default', 'name', 'Bhavik', 'identity'),
                    ('default', 'preferred_nickname', 'Bhavik', 'identity'),
                    ('default', 'primary_goals', 'Building cutting-edge AI and software systems', 'goals'),
                    ('default', 'communication_preference', 'Direct, insightful, thoughtful, and authentic', 'preferences')
                ]
                cursor.executemany("""
                    INSERT OR REPLACE INTO user_profiles (user_id, key, value, category, updated_at)
                    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, defaults)

            # Seed default persona for default user
            cursor.execute("SELECT user_id FROM user_personas WHERE user_id = 'default'")
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO user_personas (user_id, config, updated_at)
                    VALUES ('default', ?, CURRENT_TIMESTAMP)
                """, (DEFAULT_PERSONA.model_dump_json(),))

        # Initialize default provider & model settings if not set
        cursor.execute("SELECT value FROM settings WHERE key = 'active_provider'")
        if not cursor.fetchone():
            cursor.execute("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('active_provider', 'groq', CURRENT_TIMESTAMP)")

        cursor.execute("SELECT value FROM settings WHERE key = 'active_model'")
        if not cursor.fetchone():
            cursor.execute("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('active_model', 'openai/gpt-oss-120b', CURRENT_TIMESTAMP)")
            
        conn.commit()

# --- Multi-User Management ---

def get_users_list() -> List[Dict[str, Any]]:
    """Returns a list of all registered user profiles."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, name, nickname, created_at, last_active_at
            FROM users
            ORDER BY last_active_at DESC
        """)
        rows = cursor.fetchall()
        return [dict(r) for r in rows]

def create_or_update_user(user_id: str, name: str, nickname: Optional[str] = None) -> Dict[str, Any]:
    """Creates a new user profile or updates the active timestamp and name."""
    nick = nickname.strip() if nickname and nickname.strip() else name.strip()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (id, name, nickname, created_at, last_active_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET 
                name = excluded.name, 
                nickname = excluded.nickname, 
                last_active_at = CURRENT_TIMESTAMP
        """, (user_id, name.strip(), nick))
        conn.commit()
        return {"id": user_id, "name": name.strip(), "nickname": nick}

def touch_user_activity(user_id: str):
    """Updates the last_active_at timestamp for the user."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = ?", (user_id,))
        conn.commit()

def delete_user(user_id: str) -> bool:
    """Deletes a user and cascades all their isolated data (memories, profile, sessions)."""
    if user_id == "default":
        # Keep default user ID shell
        pass
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_profiles WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM user_personas WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM memories WHERE user_id = ?", (user_id,))
        
        # Get sessions to delete messages
        cursor.execute("SELECT id FROM chat_sessions WHERE user_id = ?", (user_id,))
        sessions = [r["id"] for r in cursor.fetchall()]
        for s_id in sessions:
            cursor.execute("DELETE FROM chat_messages WHERE session_id = ?", (s_id,))
        cursor.execute("DELETE FROM chat_sessions WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        return True

# --- Memory CRUD Functions (Scoped per User) ---

def insert_memory(content: str, category: str = "fact", importance: float = 0.5, 
                  embedding: Optional[List[float]] = None, source_session_id: Optional[str] = None,
                  user_id: str = "default") -> int:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        emb_json = json.dumps(embedding) if embedding is not None else None
        cursor.execute("""
            INSERT INTO memories (user_id, content, category, importance, source_session_id, embedding, created_at, last_accessed_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """, (user_id, content.strip(), category, importance, source_session_id, emb_json))
        conn.commit()
        return cursor.lastrowid

def get_all_memories(user_id: str = "default", category: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = "SELECT id, user_id, content, category, importance, source_session_id, created_at, last_accessed_at, access_count FROM memories WHERE user_id = ?"
        params = [user_id]
        
        if category and category != "all":
            query += " AND category = ?"
            params.append(category)
        if search:
            query += " AND content LIKE ?"
            params.append(f"%{search}%")
            
        query += " ORDER BY created_at DESC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_memories_with_embeddings(user_id: str = "default") -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, user_id, content, category, importance, embedding, created_at, access_count 
            FROM memories 
            WHERE user_id = ?
        """, (user_id,))
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

def update_memory(memory_id: int, content: str, category: str, importance: float, 
                  embedding: Optional[List[float]] = None, user_id: str = "default") -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if embedding is not None:
            cursor.execute("""
                UPDATE memories 
                SET content = ?, category = ?, importance = ?, embedding = ?
                WHERE id = ? AND user_id = ?
            """, (content.strip(), category, importance, json.dumps(embedding), memory_id, user_id))
        else:
            cursor.execute("""
                UPDATE memories 
                SET content = ?, category = ?, importance = ?
                WHERE id = ? AND user_id = ?
            """, (content.strip(), category, importance, memory_id, user_id))
        conn.commit()
        return cursor.rowcount > 0

def delete_memory(memory_id: int, user_id: str = "default") -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM memories WHERE id = ? AND user_id = ?", (memory_id, user_id))
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

# --- User Profile & Persona Config (Scoped per User) ---

def get_profile(user_id: str = "default") -> Dict[str, Any]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT key, value, category, updated_at FROM user_profiles WHERE user_id = ?", (user_id,))
        rows = cursor.fetchall()
        return {r["key"]: {"value": r["value"], "category": r["category"], "updated_at": r["updated_at"]} for r in rows}

def set_profile_field(key: str, value: str, category: str = "general", user_id: str = "default"):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_profiles (user_id, key, value, category, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, key) DO UPDATE SET value=excluded.value, category=excluded.category, updated_at=CURRENT_TIMESTAMP
        """, (user_id, key, value, category))
        conn.commit()

def delete_profile_field(key: str, user_id: str = "default") -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_profiles WHERE user_id = ? AND key = ?", (user_id, key))
        conn.commit()
        return cursor.rowcount > 0

def get_persona_config(user_id: str = "default") -> Dict[str, Any]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT config FROM user_personas WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if row:
            try:
                return json.loads(row["config"])
            except Exception:
                pass
        
        # Fallback to default persona with user's name if known
        default_dict = DEFAULT_PERSONA.model_dump()
        cursor.execute("SELECT nickname FROM users WHERE id = ?", (user_id,))
        u_row = cursor.fetchone()
        if u_row:
            default_dict["user_name"] = u_row["nickname"]
        return default_dict

def save_persona_config(config_dict: Dict[str, Any], user_id: str = "default"):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_personas (user_id, config, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET config=excluded.config, updated_at=CURRENT_TIMESTAMP
        """, (user_id, json.dumps(config_dict)))
        conn.commit()

# --- Chat Sessions & Messages (Scoped per User) ---

def create_session(session_id: str, title: str = "New Conversation", user_id: str = "default"):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR IGNORE INTO chat_sessions (id, user_id, title, created_at, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """, (session_id, user_id, title))
        conn.commit()

def get_sessions(user_id: str = "default") -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.id, s.user_id, s.title, s.created_at, s.updated_at, COUNT(m.id) as message_count
            FROM chat_sessions s
            LEFT JOIN chat_messages m ON s.id = m.session_id
            WHERE s.user_id = ?
            GROUP BY s.id
            ORDER BY s.updated_at DESC
        """, (user_id,))
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
        cursor.execute("UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (session_id,))
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

def delete_session(session_id: str, user_id: str = "default") -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM chat_messages WHERE session_id = ?", (session_id,))
        cursor.execute("DELETE FROM chat_sessions WHERE id = ? AND user_id = ?", (session_id, user_id))
        conn.commit()
        return cursor.rowcount > 0

# --- Settings & LLM Keys (Global/Shared) ---

def get_setting(key: str, default: Optional[str] = None) -> Optional[str]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
        row = cursor.fetchone()
        return row["value"] if row else default

def set_setting(key: str, value: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO settings (key, value, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP
        """, (key, value))
        conn.commit()
