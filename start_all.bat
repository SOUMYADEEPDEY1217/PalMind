@echo off
echo ==============================================
echo   PalMind: Private AI Companion Launcher
echo ==============================================
echo Starting Backend in a separate window...
start "PalMind Backend" cmd /k "scripts\start_backend.bat"

echo Starting Frontend in a separate window...
start "PalMind Frontend" cmd /k "scripts\start_frontend.bat"

echo.
echo ==============================================
echo   PalMind is launching!
echo   Frontend will be ready at: http://localhost:5173
echo   Backend will be ready at:  http://localhost:8000
echo   API Swagger Docs:          http://localhost:8000/docs
echo ==============================================
