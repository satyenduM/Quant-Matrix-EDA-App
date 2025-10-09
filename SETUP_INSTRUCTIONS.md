# Quick Setup Instructions

## Step-by-Step Guide to Run the EDA Dashboard

### Step 1: Backend Setup

Open a terminal and run the following commands:

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install required packages
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start the Django server
python manage.py runserver
```

**Expected Output:** 
```
Starting development server at http://127.0.0.1:8000/
```

✅ Keep this terminal running!

### Step 2: Frontend Setup

Open a **NEW** terminal and run the following commands:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view eda-frontend in the browser.

  Local:            http://localhost:3000
```

✅ Your browser should automatically open to `http://localhost:3000`

### Step 3: Using the Application

1. The dashboard will load with default data (all filters)
2. Use the dropdown filters to select specific:
   - Channels
   - Brands
   - Pack Types
   - PPG values
   - Years
3. Charts will automatically update when you change filters
4. Click the "Reset" button to clear all filters
5. In the Market Share chart, toggle between "Sales Value" and "Volume" views

### Verification Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] No errors in either terminal
- [ ] Dashboard displays charts correctly
- [ ] Filters are working and updating charts
- [ ] All 5 chart types are visible

### Common Issues & Solutions

#### Issue: "ModuleNotFoundError" in Backend
**Solution:** Make sure you've activated the virtual environment and installed requirements:
```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

#### Issue: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

#### Issue: CORS errors in browser console
**Solution:** 
- Ensure backend is running on port 8000
- Check that django-cors-headers is installed
- Restart both servers

#### Issue: Charts not displaying
**Solution:**
- Check browser console for errors
- Verify that `Technical Evaluation.csv` exists in the Task folder
- Check Network tab to see if API calls are successful

#### Issue: Port 3000 or 8000 already in use
**Solution:** 
- For backend: `python manage.py runserver 8001` (use different port)
- For frontend: Create a `.env` file in frontend with `PORT=3001`

### Testing the API Directly

You can test the backend API endpoints directly:

1. Health Check:
```bash
curl http://localhost:8000/api/health/
```

2. Get Filter Options:
```bash
curl http://localhost:8000/api/filters/
```

3. Get Data:
```bash
curl -X POST http://localhost:8000/api/data/ \
  -H "Content-Type: application/json" \
  -d '{"filters": {"brands": [], "packTypes": [], "ppgs": [], "channels": [], "years": []}}'
```

### Project Structure Overview

```
Task/
├── backend/           # Django backend
│   ├── venv/         # Virtual environment (created during setup)
│   ├── api/          # API endpoints
│   ├── eda_project/  # Django settings
│   └── manage.py     # Django management script
│
├── frontend/         # React frontend
│   ├── node_modules/ # Dependencies (created during setup)
│   ├── public/       # Static files
│   ├── src/          # React components
│   └── package.json  # Dependencies list
│
└── Technical Evaluation.csv  # Dataset
```

### Next Steps

Once everything is running:
1. Explore the different charts and their interactions
2. Try different filter combinations
3. Check the responsive design by resizing your browser
4. Open browser DevTools to see network requests and data flow

### Stopping the Application

1. In the frontend terminal: Press `Ctrl + C`
2. In the backend terminal: Press `Ctrl + C`
3. Deactivate the virtual environment: `deactivate`

### Need Help?

Check the main README.md file for:
- Detailed feature descriptions
- API documentation
- Customization options
- Troubleshooting guide

