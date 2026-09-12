@echo off
echo ==========================================
echo  Hikka Secret Lake Villa - Full Stack Dev
echo ==========================================
echo.
echo Starting Backend API (port 5000)...
start "Hikka Secret - Backend" cmd /k "cd /d d:\hotel\backend && npx tsx src/server.ts"

timeout /t 2 /nobreak > nul

echo Starting Frontend (port 8443)...
start "Hikka Secret - Frontend" cmd /k "cd /d d:\hotel\frontend && npm run dev"

echo.
echo ==========================================
echo  Services Started!
echo  Frontend:  http://localhost:8443
echo  Backend:   http://localhost:5000
echo  API Docs:  http://localhost:5000/api/health
echo ==========================================
echo.
echo Admin Login: adminhikka / hikka#123
echo Promo Codes: HSVHONEY, HSV7NIGHT, HSVVILLA
echo.
