@echo off
cd /d "%~dp0"
echo ==========================================
echo   Antigravity Remote Dev - Quick Launcher
echo ==========================================
echo.
echo [!] LUU Y: Neu Antigravity IDE dang mo, vui long tat han (Exit) IDE
echo     truoc khi tiep tuc de cong CDP 9000 duoc kich hoat.
echo.
pause

echo 1. Starting Antigravity IDE with CDP debug port 9000...
start "" "C:\Users\phuc0\AppData\Local\Programs\Antigravity IDE\Antigravity IDE.exe" --remote-debugging-port=9000

echo 2. Starting Remote Dev Web Server on port 3563...
start "AG Remote Server" cmd /k "node server.js"

echo.
echo All processes launched!
echo - In LAN:       http://192.168.20.34:3563
echo - Via Tailscale: http://100.89.182.5:3563
echo.
pause

