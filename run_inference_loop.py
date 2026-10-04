import subprocess
import time
import sys
import os

def main():
    # Ensure we use the current python executable (the venv one if activated)
    python_exe = sys.executable
    
    while True:
        print("\n=== Running reset_skipped.py ===")
        # Reset any crashed states
        subprocess.run([python_exe, "reset_skipped.py"], check=False)
        
        print("\n=== Starting run_inference.py ===")
        # Run inference
        result = subprocess.run([python_exe, "run_inference.py"])
        
        if result.returncode == 0:
            print("\n=== Inference completed successfully! ===")
            break
        else:
            print("\n=== Crash detected (likely rate limit). Sleeping for 60 seconds to cool down... ===")
            time.sleep(60)

if __name__ == "__main__":
    main()
