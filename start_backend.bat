@echo off
echo Starting EDA Backend Server...
echo.

cd backend

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo Installing dependencies...
pip install -q -r requirements.txt

REM Run migrations
echo Running database migrations...
python manage.py migrate

REM Start server
echo.
echo Backend server starting at http://localhost:8000
echo ================================================
echo.
python manage.py runserver

pause

