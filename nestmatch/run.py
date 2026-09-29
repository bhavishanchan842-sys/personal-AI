import os
import sys
import subprocess
import time
import socket
import urllib.request
import webbrowser

# Ensure UTF-8 output encoding on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

BACKEND_PORT = 8001
FRONTEND_PORT = 5173

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def kill_process_on_port(port: int):
    try:
        cmd = f'cmd /c "for /f \\"tokens=5\\" %a in (\'netstat -aon ^| findstr :{port} ^| findstr LISTENING\') do taskkill /f /pid %a"'
        subprocess.run(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

def main():
    print("=" * 65)
    print("  [NestMate India] Rooms, PGs & Roommate Compatibility Platform")
    print("=" * 65)

    # 1. Clean up any stale sockets if needed
    if is_port_in_use(BACKEND_PORT):
        print(f"[*] Port {BACKEND_PORT} in use, freeing port...")
        kill_process_on_port(BACKEND_PORT)
        time.sleep(1)

    # 2. Start FastAPI Backend on Port 8001
    print(f"\n[1/2] Starting FastAPI Backend on http://127.0.0.1:{BACKEND_PORT} ...")
    backend_cmd = [
        sys.executable, "-m", "uvicorn", "main:app",
        "--host", "127.0.0.1",
        "--port", str(BACKEND_PORT),
        "--reload"
    ]
    backend_process = subprocess.Popen(
        backend_cmd,
        cwd=BACKEND_DIR,
        shell=False
    )

    # Wait for backend to be ready
    backend_ready = False
    for attempt in range(20):
        time.sleep(0.5)
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{BACKEND_PORT}/api/auth/demo-users", timeout=1) as resp:
                if resp.status == 200:
                    backend_ready = True
                    break
        except Exception:
            pass

    if backend_ready:
        print(f"  [+] Backend is LIVE & healthy on http://127.0.0.1:{BACKEND_PORT}")
    else:
        print(f"  [*] Backend warming up...")

    # 3. Start Vite Frontend
    print(f"\n[2/2] Starting Vite Frontend on http://localhost:{FRONTEND_PORT} ...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_process = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=FRONTEND_DIR,
        shell=True
    )

    # Wait for frontend to be ready
    time.sleep(2)
    print("\n" + "=" * 65)
    print("  [SUCCESS] NestMate India is running!")
    print(f"  --> Web Dashboard : http://localhost:{FRONTEND_PORT}")
    print(f"  --> API Docs      : http://127.0.0.1:{BACKEND_PORT}/docs")
    print("=" * 65)
    print("  Press Ctrl+C to stop both servers.\n")

    try:
        webbrowser.open(f"http://localhost:{FRONTEND_PORT}")
        while True:
            if backend_process.poll() is not None:
                print("[!] Backend server stopped unexpectedly.")
                break
            if frontend_process.poll() is not None:
                print("[!] Frontend server stopped unexpectedly.")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping NestMatch servers...")
    finally:
        try:
            backend_process.terminate()
        except Exception:
            pass
        try:
            frontend_process.terminate()
        except Exception:
            pass
        print("Servers stopped cleanly.")

if __name__ == "__main__":
    main()
