import os
import sys
import socket
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

def get_local_ip():
    """Finds the local IP address on the Wi-Fi / LAN."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def open_browser(url: str):
    time.sleep(1.2)
    try:
        webbrowser.open(url)
    except Exception:
        pass

def main():
    local_ip = get_local_ip()
    local_url = f"http://127.0.0.1:{PORT}"
    mobile_url = f"http://{local_ip}:{PORT}"

    print("=" * 65)
    print("  🧠 AEGIS — Personal AI Companion & Persistent Memory Engine")
    print("=" * 65)
    
    # 1. Initialize SQLite Database Schema
    print("-> Initializing persistent database and memory storage...")
    init_db()
    print("-> Database ready.")
    print("=" * 65)
    print(f"  💻 On Laptop / PC:  {local_url}")
    print(f"  📱 On Phone (Wi-Fi): {mobile_url}")
    print("=" * 65)
    print("-> Open the URL above on your phone or laptop to start chatting!")
    print("=" * 65)

    # Launch browser in background thread
    threading.Thread(target=open_browser, args=(local_url,), daemon=True).start()

    # Run FastAPI server on all interfaces (0.0.0.0)
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=PORT,
        reload=False,
        log_level="info"
    )

if __name__ == "__main__":
    main()
