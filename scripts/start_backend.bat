@echo off
echo ==============================================
echo   Starting PalMind Local Backend (FastAPI)
echo ==============================================
cd /d "%~dp0\..\backend"

if not exist ".venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate
)

uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
