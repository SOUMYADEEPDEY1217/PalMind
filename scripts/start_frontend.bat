@echo off
echo ==============================================
echo   Starting PalMind Frontend (Vite + React)
echo ==============================================
cd /d "%~dp0\..\frontend"

if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies...
    npm install
)

npm run dev
pause
