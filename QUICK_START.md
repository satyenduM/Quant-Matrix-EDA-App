# 🚀 Quick Start Guide

## Fastest Way to Run the Application

### Option 1: Using Startup Scripts (Recommended)

#### On macOS/Linux:

**Terminal 1 - Backend:**
```bash
cd /Users/satyendu/Desktop/Task
./start_backend.sh
```

**Terminal 2 - Frontend:**
```bash
cd /Users/satyendu/Desktop/Task
./start_frontend.sh
```

#### On Windows:

**Terminal 1 - Backend:**
```cmd
cd C:\path\to\Task
start_backend.bat
```

**Terminal 2 - Frontend:**
```cmd
cd C:\path\to\Task
start_frontend.bat
```

### Option 2: Manual Setup

See `SETUP_INSTRUCTIONS.md` for detailed step-by-step instructions.

---

## What You'll See

1. **Backend Terminal**: Django server running on http://localhost:8000
2. **Frontend Terminal**: React app running on http://localhost:3000
3. **Browser**: Automatically opens to http://localhost:3000 with the dashboard

---

## First Time Setup Only

The startup scripts will automatically:
- ✅ Create virtual environment (backend)
- ✅ Install Python dependencies (backend)
- ✅ Run database migrations (backend)
- ✅ Install Node.js dependencies (frontend)

This takes 1-2 minutes on first run. Subsequent starts are much faster!

---

## Using the Dashboard

1. **Filters** - Select brands, pack types, PPG, channels, or years
2. **Charts** - View 5 different chart types:
   - Sales Value by Year (horizontal stacked bar)
   - Volume Contribution by Year (horizontal stacked bar)
   - Year-wise Sales Value (vertical bar)
   - Monthly Trend (line chart)
   - Market Share (donut chart with toggle)
3. **Reset** - Clear all filters to see all data

---

## Stopping the Application

Press `Ctrl + C` in both terminals to stop the servers.

---

## Need Help?

- **Full Documentation**: See `README.md`
- **Detailed Setup**: See `SETUP_INSTRUCTIONS.md`
- **Troubleshooting**: Check the Common Issues section in `SETUP_INSTRUCTIONS.md`

---

## System Requirements

- **Python**: 3.8 or higher
- **Node.js**: 14 or higher
- **RAM**: 2GB minimum
- **Disk Space**: 500MB for dependencies

---

## Screenshots Reference

The application is designed to match the provided Consumer Surplus Factor (CSF) dashboard with:
- Modern, clean UI
- Interactive filters
- Responsive charts
- Professional color scheme
- Tooltips and hover effects

Enjoy exploring your data! 📊

