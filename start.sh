#!/usr/bin/env bash
set -e

echo "=============================================="
echo "  Launching PalMind Full-Stack Application"
echo "=============================================="

# Ensure directories exist
mkdir -p backend/data backend/uploads

# 1. Start Backend in background
echo "[1/2] Starting Backend FastAPI on port 8000..."
cd backend
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
else
    source .venv/bin/activate
fi
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# 2. Start Frontend
echo "[2/2] Starting Frontend Vite on port 5173..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo "PalMind running:"
echo "• Frontend: http://localhost:5173"
echo "• Backend:  http://localhost:8000"
echo "• API Docs: http://localhost:8000/docs"
echo "Press Ctrl+C to terminate both servers."

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
