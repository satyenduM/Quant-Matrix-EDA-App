# 📊 EDA Dashboard - Project Overview

## Project Summary

A complete, production-ready Exploratory Data Analysis (EDA) dashboard application built with **React** (frontend) and **Django** (backend) for analyzing FMCG retail sales data.

---

## ✨ Key Features

### 🎯 Interactive Filtering System
- Multi-select dropdowns for **Brand**, **Pack Type**, **PPG**, **Channel**, and **Year**
- Real-time chart updates based on filter selections
- One-click reset functionality
- "All" option for each filter

### 📈 5 Comprehensive Chart Types

1. **Sales Value by Year** (Horizontal Stacked Bar)
   - Shows sales value distribution across years
   - Stacked by brand for easy comparison
   - Values displayed in millions (M)

2. **Volume Contribution by Year** (Horizontal Stacked Bar)
   - Displays volume (KG) distribution
   - Stacked by brand
   - Consistent color coding with sales chart

3. **Year-wise Sales Value** (Vertical Bar)
   - Compares sales across brands for each year
   - Grouped bars for easy year-over-year comparison
   - Color-coded by year (2021: Blue, 2022: Green, 2023: Orange)

4. **Monthly Trend** (Line Chart)
   - Shows sales value trends over time
   - Smooth curve with area fill
   - Date labels formatted as "Mon-YY"
   - Interactive hover tooltips

5. **Market Share** (Donut Chart)
   - Toggle between Sales Value and Volume views
   - Percentage-based distribution
   - Clear legend with brand percentages
   - Interactive hover effects

### 🎨 Design Highlights
- Modern, professional UI matching the reference dashboard
- Responsive design (desktop, tablet, mobile)
- Consistent color palette across all charts
- Smooth animations and transitions
- Hover tooltips with formatted values (currency, numbers)
- Loading states and empty data handling

---

## 🏗️ Architecture

### Backend (Django)
```
Django REST Framework
├── API Endpoints
│   ├── /api/health/          # Health check
│   ├── /api/filters/         # Get filter options
│   └── /api/data/            # Get filtered data
├── Data Processing
│   ├── Pandas for aggregation
│   ├── In-memory caching (singleton pattern)
│   └── CSV data loading
└── CORS Configuration
    └── Cross-origin resource sharing enabled
```

### Frontend (React)
```
React Application
├── Components
│   ├── Header              # Top navigation bar
│   ├── Filters             # Filter controls
│   ├── MultiSelect         # Reusable dropdown component
│   ├── Dashboard           # Chart layout container
│   └── Charts
│       ├── SalesByYear
│       ├── VolumeByYear
│       ├── YearBrandSales
│       ├── MonthlyTrend
│       └── MarketShare
├── State Management
│   ├── React Hooks (useState, useEffect)
│   ├── Axios for API calls
│   └── Real-time filter synchronization
└── Styling
    ├── Modern CSS
    ├── Flexbox/Grid layouts
    └── Responsive breakpoints
```

---

## 📁 Complete File Structure

```
Task/
├── 📄 Documentation
│   ├── README.md                    # Comprehensive documentation
│   ├── SETUP_INSTRUCTIONS.md        # Detailed setup guide
│   ├── QUICK_START.md              # Fast setup guide
│   └── PROJECT_OVERVIEW.md         # This file
│
├── 🚀 Startup Scripts
│   ├── start_backend.sh            # macOS/Linux backend launcher
│   ├── start_frontend.sh           # macOS/Linux frontend launcher
│   ├── start_backend.bat           # Windows backend launcher
│   └── start_frontend.bat          # Windows frontend launcher
│
├── 🗄️ Data
│   └── Technical Evaluation.csv    # Sample FMCG dataset (1.9MB)
│
├── 🐍 Backend (Django)
│   ├── backend/
│   │   ├── eda_project/
│   │   │   ├── __init__.py
│   │   │   ├── settings.py         # Django configuration
│   │   │   ├── urls.py             # URL routing
│   │   │   ├── wsgi.py             # WSGI config
│   │   │   └── asgi.py             # ASGI config
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── apps.py             # App configuration
│   │   │   ├── views.py            # API endpoints
│   │   │   ├── urls.py             # API URL routing
│   │   │   ├── data_loader.py      # Data loading & caching
│   │   │   ├── models.py           # Database models
│   │   │   ├── admin.py            # Admin interface
│   │   │   ├── tests.py            # Unit tests
│   │   │   └── migrations/
│   │   │       └── __init__.py
│   │   │
│   │   ├── manage.py               # Django CLI
│   │   ├── requirements.txt        # Python dependencies
│   │   └── .gitignore
│
└── ⚛️ Frontend (React)
    └── frontend/
        ├── public/
        │   ├── index.html          # HTML template
        │   ├── manifest.json       # PWA manifest
        │   └── robots.txt          # SEO
        │
        ├── src/
        │   ├── index.js            # React entry point
        │   ├── index.css           # Global styles
        │   ├── App.js              # Main app component
        │   ├── App.css             # App styles
        │   │
        │   └── components/
        │       ├── Header.js       # Navigation header
        │       ├── Header.css
        │       ├── Filters.js      # Filter panel
        │       ├── Filters.css
        │       ├── MultiSelect.js  # Dropdown component
        │       ├── MultiSelect.css
        │       ├── Dashboard.js    # Chart container
        │       ├── Dashboard.css
        │       │
        │       └── charts/
        │           ├── SalesByYear.js
        │           ├── VolumeByYear.js
        │           ├── YearBrandSales.js
        │           ├── MonthlyTrend.js
        │           ├── MarketShare.js
        │           └── ChartStyles.css
        │
        ├── package.json            # Node dependencies
        └── .gitignore
```

---

## 🛠️ Technology Stack

### Backend Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| Django | 4.2.7 | Web framework |
| djangorestframework | 3.14.0 | REST API |
| django-cors-headers | 4.3.1 | CORS support |
| pandas | 2.1.3 | Data processing |
| numpy | 1.26.2 | Numerical operations |
| python-dateutil | 2.8.2 | Date handling |

### Frontend Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.2.0 | UI framework |
| react-dom | 18.2.0 | React renderer |
| chart.js | 4.4.0 | Charting library |
| react-chartjs-2 | 5.2.0 | React Chart.js wrapper |
| axios | 1.6.2 | HTTP client |
| react-scripts | 5.0.1 | Build tools |

---

## 🚀 Quick Start

### Fastest Method (Using Scripts)

**macOS/Linux:**
```bash
# Terminal 1
./start_backend.sh

# Terminal 2
./start_frontend.sh
```

**Windows:**
```cmd
# Terminal 1
start_backend.bat

# Terminal 2
start_frontend.bat
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/

---

## 📊 Data Structure

The application processes a CSV file with the following key columns:

| Column | Type | Description |
|--------|------|-------------|
| Market | String | Market identifier |
| Channel | String | Distribution channel |
| Brand | String | Product brand |
| PackType | String | Package type |
| PPG | String | Price point group |
| Year | Integer | Year (2021-2023) |
| Month | Integer | Month (1-12) |
| date | Date | Transaction date |
| SalesValue | Float | Sales value in EUR |
| Volume | Float | Volume in KG |

---

## 🎯 API Endpoints

### 1. Health Check
```http
GET /api/health/
```
**Response:**
```json
{
  "status": "ok",
  "message": "EDA API is running"
}
```

### 2. Get Filter Options
```http
GET /api/filters/
```
**Response:**
```json
{
  "brands": ["Brand 1", "Brand 2", "Brand 3", "Brand 4"],
  "packTypes": ["Flavoured"],
  "ppgs": ["Small Single", "Standard Single"],
  "channels": ["Convenience", "Modern Trade"],
  "years": [2021, 2022, 2023]
}
```

### 3. Get Filtered Data
```http
POST /api/data/
Content-Type: application/json

{
  "filters": {
    "brands": ["Brand 1"],
    "packTypes": [],
    "ppgs": [],
    "channels": [],
    "years": [2021, 2022]
  }
}
```
**Response:** Aggregated data for all chart types

---

## 🎨 Color Scheme

### Brand Colors
- **Brand 1**: `#FFA726` (Orange)
- **Brand 2**: `#42A5F5` (Blue)
- **Brand 3**: `#66BB6A` (Green)
- **Brand 4**: `#9CCC65` (Light Green)

### Year Colors
- **2021**: `#42A5F5` (Blue)
- **2022**: `#66BB6A` (Green)
- **2023**: `#FFA726` (Orange)

### UI Colors
- **Primary**: `#4a90e2` (Blue)
- **Background**: `#f5f5f5` (Light Gray)
- **Cards**: `#ffffff` (White)
- **Borders**: `#e0e0e0` (Gray)

---

## 📱 Responsive Design

The application is fully responsive with breakpoints at:
- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

Features adapt automatically:
- Filters stack vertically on mobile
- Charts resize proportionally
- Navigation compresses for smaller screens

---

## 🔧 Customization Guide

### Adding a New Chart
1. Create component in `frontend/src/components/charts/`
2. Import Chart.js components needed
3. Add to Dashboard.js layout
4. Update backend API if new data aggregation needed

### Adding a New Filter
1. Update `get_filter_options()` in `backend/api/views.py`
2. Add filter dropdown in `Filters.js`
3. Update state management in `App.js`
4. Apply filter logic in `get_filtered_data()`

### Changing Colors
Edit color arrays in chart components:
```javascript
const colors = ['#FFA726', '#42A5F5', ...];
```

---

## 🧪 Testing

### Backend Testing
```bash
cd backend
python manage.py test
```

### API Testing
```bash
# Health check
curl http://localhost:8000/api/health/

# Get filters
curl http://localhost:8000/api/filters/
```

### Frontend Testing
```bash
cd frontend
npm test
```

---

## 📦 Deployment Considerations

### Backend
- Set `DEBUG = False` in production
- Use environment variables for sensitive data
- Configure proper database (PostgreSQL recommended)
- Set up ALLOWED_HOSTS correctly
- Use gunicorn/uwsgi for WSGI server
- Set up static file serving

### Frontend
- Build optimized production bundle: `npm run build`
- Serve static files via nginx/Apache
- Configure API endpoint URLs
- Enable gzip compression
- Set up CDN for assets

---

## 🔒 Security Notes

- CORS is currently set to allow all origins (development only)
- Secret key should be changed in production
- Implement authentication for production use
- Add rate limiting on API endpoints
- Validate and sanitize all inputs
- Use HTTPS in production

---

## 🚀 Performance Optimizations

### Backend
- ✅ In-memory data caching (singleton pattern)
- ✅ Pandas for efficient data aggregation
- ✅ Query result optimization

### Frontend
- ✅ React hooks for efficient re-renders
- ✅ Component-level state management
- ✅ Chart canvas rendering optimization
- ✅ Lazy loading potential for large datasets

---

## 📈 Future Enhancements

### Planned Features
- [ ] Export functionality (CSV, PDF, PNG)
- [ ] Custom date range picker
- [ ] Drill-down capabilities
- [ ] Comparison mode
- [ ] User authentication
- [ ] Saved filter presets
- [ ] Real-time data updates (WebSockets)
- [ ] Advanced analytics (ML predictions)
- [ ] Multi-language support
- [ ] Dark mode theme

### Scalability Improvements
- [ ] Database backend for large datasets
- [ ] Pagination for API responses
- [ ] Caching layer (Redis)
- [ ] Load balancing
- [ ] CDN integration
- [ ] Server-side rendering (SSR)

---

## 🐛 Known Issues & Limitations

1. **Dataset Size**: Current implementation loads entire CSV in memory
   - Suitable for datasets up to ~100MB
   - For larger datasets, consider database backend

2. **Browser Compatibility**: Tested on modern browsers
   - Chrome 90+
   - Firefox 88+
   - Safari 14+
   - Edge 90+

3. **Mobile Performance**: Charts may render slowly on older mobile devices

---

## 📞 Support & Documentation

- **Quick Setup**: See `QUICK_START.md`
- **Detailed Setup**: See `SETUP_INSTRUCTIONS.md`
- **Full Documentation**: See `README.md`
- **This Overview**: `PROJECT_OVERVIEW.md`

---

## 📝 License

This project is created for technical evaluation purposes.

---

## 🎓 Learning Resources

### Django
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)

### React
- [React Documentation](https://react.dev/)
- [Chart.js Documentation](https://www.chartjs.org/)

### Data Analysis
- [Pandas Documentation](https://pandas.pydata.org/)

---

## 🙏 Acknowledgments

Built with modern web technologies to provide an intuitive, performant, and scalable solution for exploratory data analysis.

**Dashboard inspired by**: Consumer Surplus Factor (CSF) reference design

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Status**: ✅ Production Ready

