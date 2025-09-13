@echo off
echo Starting TelMed Application...

echo.
echo Starting Server...
start "TelMed Server" cmd /k "cd server && npm run dev"

echo.
echo Waiting 5 seconds for server to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Client...
start "TelMed Client" cmd /k "cd client && npm run dev"

echo.
echo Both server and client are starting...
echo Server will be available at: http://localhost:4000
echo Client will be available at: http://localhost:5173
echo.
echo Press any key to exit this window...
pause > nul
