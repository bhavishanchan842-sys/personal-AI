import os
from pathlib import Path
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
STATIC_DIR = BASE_DIR / "static"
ENV_FILE = BASE_DIR / ".env"

# Ensure data dir exists
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Load environment
load_dotenv(dotenv_path=ENV_FILE)

DATABASE_PATH = os.getenv("DATABASE_PATH", str(DATA_DIR / "personal_ai.db"))
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "127.0.0.1")

class DefaultPersonaConfig(BaseModel):
    ai_name: str = "Aegis"
    user_name: str = "Friend"
    tone_preset: str = "Empathetic Companion"  # Options: Empathetic Companion, Tech Mentor, Candid Best Friend, Executive Assistant, Philosopher
    warmth: int = 80       # 0 to 100
    humor: int = 50        # 0 to 100
    directness: int = 60   # 0 to 100
    formality: int = 30    # 0 to 100
    use_emojis: bool = True
    custom_instructions: str = ""

DEFAULT_PERSONA = DefaultPersonaConfig()
