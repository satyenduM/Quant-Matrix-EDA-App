@echo off
echo Starting EDA Frontend Server...
echo.

cd frontend

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    npm install
)

REM Start server
echo.
echo Frontend server starting at http://localhost:3000
echo ================================================
echo.
npm start

pause

