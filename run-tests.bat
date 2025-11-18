@echo off
REM Script to run all tests for MediMind Pro

echo ========================================
echo   MediMind Pro - Test Suite
echo ========================================
echo.

echo [1/2] Running Backend Tests...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)
call npm test
if %ERRORLEVEL% NEQ 0 (
    echo Backend tests failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [2/2] Running Frontend Tests...
cd web
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)
call npm test -- --watchAll=false --coverage
if %ERRORLEVEL% NEQ 0 (
    echo Frontend tests failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo   All tests passed!
echo ========================================
pause

