# EDA Dashboard Application

**🚀 Deployed:** [https://quant-matrix-eda-app.vercel.app](https://quant-matrix-eda-app.vercel.app)

An Exploratory Data Analysis (EDA) dashboard built with React (frontend) and Django 
(backend) for analyzing FMCG retail data.


## 🏗️ Tech Stack

### Backend
- **Django 4.2.7** - Web framework with REST API
- **Django REST Framework 3.14.0** - API serialization and views
- **Pandas 2.1.3** - Data processing and aggregation

### Frontend
- **React 18.2** - UI framework with hooks
- **Recharts 3.2.1** - Interactive visualizations
- **Axios** - HTTP client for API communication

## 🎯 Key Features

- **Interactive Filtering**: Multi-select dropdowns for Brand, Pack Type, PPG, Channel, and Year
- **Chart Types**: Sales by Year, Volume by Year, Year-wise Sales, Monthly Trend, Market Share
- **Real-time Updates**: Charts automatically refresh when filters change

## 🧠 Thought Process & Architecture

1. **Data Caching Strategy**
   - CSV loaded once into memory using singleton pattern
   - Pandas DataFrame operations for efficient filtering and aggregation
   - Suitable for datasets up to ~100MB

2. **API Design**
   - RESTful endpoints with clear separation of concerns
   - `/api/filters/` for filter options
   - `/api/data/` for aggregated chart data

3. **Frontend State Management**
   - React hooks for local state management
   - Centralized filter state with useEffect for side effects
   - Component-level chart rendering for optimal performance

4. **Chart Library Choice**
   - Recharts for declarative chart components
   - Built-in React integration with responsive containers
   - Consistent color scheme across all visualizations

## 📊 Data Flow

```
CSV File → Django DataLoader → API Endpoints → React State → Chart Components
```

1. **Data Loading**: CSV parsed once using Pandas, cached in memory
2. **Filter Processing**: Backend applies filters and aggregates data for each chart type
3. **API Response**: Structured JSON with different data aggregations
4. **Frontend Rendering**: React components receive data and render charts

## 📝 API Endpoints

- `GET /api/health/` - Health check endpoint
- `GET /api/filters/` - Available filter options (brands, packTypes, ppgs, channels, years)
- `POST /api/data/` - Filtered and aggregated data for all chart types

## 🚀 Quick Start

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (new terminal)
cd frontend
npm install
npm start
```
## 🔧 Project Structure

```
├── backend/
│   ├── api/                    # Django REST API
│   │   ├── views.py           # API endpoints
│   │   ├── data_loader.py     # Data caching & processing
│   │   ├── urls.py            # URL routing
│   │   ├── models.py          # Database models
│   │   ├── admin.py           # Admin interface
│   │   └── tests.py           # Unit tests
│   ├── eda_project/           # Django settings
│   │   ├── settings.py        # Django configuration
│   │   ├── urls.py            # Main URL routing
│   │   ├── wsgi.py            # WSGI config
│   │   └── Technical Evaluation.csv  # Dataset
│   ├── manage.py              # Django CLI
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/        # Chart components
│   │   │   │   ├── SalesByYear.js
│   │   │   │   ├── VolumeByYear.js
│   │   │   │   ├── YearBrandSales.js
│   │   │   │   ├── MonthlyTrend.js
│   │   │   │   ├── MarketShare.js
│   │   │   │   ├── ChartSkeleton.js
│   │   │   │   └── animations/
│   │   │   ├── Filters.js     # Filter controls
│   │   │   ├── Dashboard.js   # Layout container
│   │   │   ├── Header.js      # Navigation header
│   │   │   ├── MultiSelect.js # Dropdown component
│   │   │   └── KPIHeader.js   # KPI display
│   │   ├── App.js            # Main application
│   │   ├── App.css           # App styles
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Global styles
│   ├── public/               # Static files
│   └── package.json          # Node dependencies
└── README.md                 # Documentation
```