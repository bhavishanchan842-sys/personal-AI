import os
import sys
import subprocess

current_dir = os.path.dirname(os.path.abspath(__file__))
nestmatch_dir = os.path.join(current_dir, "nestmatch")
run_script = os.path.join(nestmatch_dir, "run.py")

if not os.path.exists(run_script):
    print(f"Error: {run_script} not found!")
    sys.exit(1)

subprocess.run([sys.executable, run_script], cwd=nestmatch_dir)
