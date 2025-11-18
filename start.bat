@echo off
REM Script to start all services on Windows

echo ========================================
echo   MediMind Pro - Starting Services
echo ========================================
echo.

REM Check if Mosquitto is installed
where mosquitto >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Mosquitto not found. Please install Mosquitto first.
    echo Download from: https://mosquitto.org/download/
    pause
    exit /b 1
)

echo [1/3] Starting MQTT Broker...
start "MQTT Broker" cmd /k "mosquitto -v"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Backend...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)
start "Backend Server" cmd /k "npm start"
cd ..

timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend...
cd web
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)
start "Frontend Server" cmd /k "npm start"
cd ..

echo.
echo ========================================
echo   Services Started!
echo ========================================
echo.
echo - MQTT Broker: running on port 1883
echo - Backend: http://localhost:3000
echo - Frontend: http://localhost:3000 (React default port)
echo.
echo Press any key to close this window...
pause >nul

