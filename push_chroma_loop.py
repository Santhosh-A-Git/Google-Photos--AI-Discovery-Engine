import time
import subprocess
import sys

def main():
    print("Starting continuous ChromaDB push loop...")
    while True:
        print("\n--- Pushing latest data to ChromaDB ---")
        subprocess.run([sys.executable, "push_chroma.py"])
        print("Sleeping for 5 minutes before next push...")
        time.sleep(300)

if __name__ == "__main__":
    main()
