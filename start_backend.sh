#!/bin/bash

echo "🚀 Starting EDA Backend Server..."
echo ""

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Run migrations
echo "🗄️  Running database migrations..."
python manage.py migrate

# Start server
echo ""
echo "✅ Backend server starting at http://localhost:8000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
python manage.py runserver

