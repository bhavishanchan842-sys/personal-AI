import os
import sys
import webbrowser
import threading
import time
import uvicorn
from pathlib import Path

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from backend.config import PORT, HOST, ENV_FILE
from backend.database import init_db

def open_browser(url: str):
    time.sleep(1.2)
    try:
        webbrowser.open(url)
    except Exception:
        pass

def main():
    print("=" * 65)
    print("  🧠 AEGIS — Personal AI Companion & Persistent Memory Engine")
    print("=" * 65)
    
    # 1. Initialize SQLite Database Schema
    print("-> Initializing persistent database and memory storage...")
    init_db()
    print("-> Database ready.")

    url = f"http://{HOST}:{PORT}"
    print(f"-> Starting web server at: {url}")
    print("-> Open your browser to begin chatting and managing memories.")
    print("=" * 65)

    # Launch browser in background thread
    threading.Thread(target=open_browser, args=(url,), daemon=True).start()

    # Run FastAPI server
    uvicorn.run(
        "backend.main:app",
        host=HOST,
        port=PORT,
        reload=False,
        log_level="info"
    )

if __name__ == "__main__":
    main()
