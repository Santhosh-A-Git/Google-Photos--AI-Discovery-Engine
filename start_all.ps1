# Start FastAPI Backend in background
Start-Process -FilePath ".venv\Scripts\python.exe" -ArgumentList "-m uvicorn api.main:app --host 127.0.0.1 --port 8000" -NoNewWindow

# Start Vite Frontend
cd dashboard
npm install
npm run dev
