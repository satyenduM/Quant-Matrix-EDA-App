# 🏗️ System Architecture

## Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                            │
│                     http://localhost:3000                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    REACT FRONTEND                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  App.js (Main Container)                                    │ │
│  │  ├── State Management (filters, chartData, loading)        │ │
│  │  ├── API Communication (axios)                             │ │
│  │  └── Component Orchestration                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│  ┌──────────────────────────┼─────────────────────────────────┐ │
│  │                          │                                  │ │
│  ▼                          ▼                          ▼       │ │
│  Header            Filters Component          Dashboard        │ │
│  - Logo            - MultiSelect x5            - Chart Grid    │ │
│  - Navigation      - Reset Button              - 5 Charts      │ │
│  - User Menu       - Filter State              - Responsive    │ │
│                                                                 │ │
│                    Charts (Chart.js Components)                │ │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │ SalesByYear  │ VolumeByYear │ YearBrand    │ MonthlyTrend │ │
│  │ (H-Bar)      │ (H-Bar)      │ (V-Bar)      │ (Line)       │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            MarketShare (Donut Chart)                      │  │
│  │            - Toggle: Sales / Volume                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ CORS Enabled
                             │ JSON/REST
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    DJANGO BACKEND                                │
│                  http://localhost:8000                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    URL Routing                              │ │
│  │  /api/health/    →  health_check()                         │ │
│  │  /api/filters/   →  get_filter_options()                   │ │
│  │  /api/data/      →  get_filtered_data()                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    API Views (views.py)                     │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  get_filter_options():                                │  │ │
│  │  │  - Extract unique brands, pack types, PPG, etc.      │  │ │
│  │  │  - Return as JSON                                     │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  get_filtered_data(filters):                          │  │ │
│  │  │  - Apply filters to dataset                           │  │ │
│  │  │  - Aggregate data for each chart type                 │  │ │
│  │  │  - Return 7 different aggregations                    │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │               Data Loader (data_loader.py)                  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  DataLoader (Singleton)                               │  │ │
│  │  │  - Load CSV once on first request                     │  │ │
│  │  │  - Cache in memory                                    │  │ │
│  │  │  - Pandas DataFrame operations                        │  │ │
│  │  │  - Type conversions & date parsing                    │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│                             ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           Technical Evaluation.csv (1.9 MB)                 │ │
│  │  Columns: Market, Channel, Brand, PackType, PPG,           │ │
│  │           Year, Month, date, SalesValue, Volume, ...        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Flow

### 1. Initial Load Sequence

```
User Opens Browser
    │
    ├─→ React App Loads (index.js)
    │       │
    │       ├─→ App.js Mounts
    │       │       │
    │       │       ├─→ useEffect: fetchFilterOptions()
    │       │       │       │
    │       │       │       └─→ GET /api/filters/
    │       │       │               │
    │       │       │               └─→ Backend: get_filter_options()
    │       │       │                       │
    │       │       │                       └─→ DataLoader.get_data()
    │       │       │                               │
    │       │       │                               └─→ Load CSV (First Time Only)
    │       │       │                                       │
    │       │       │               ◄───────────────────────┘
    │       │       │               Return: {brands, packTypes, ppgs, ...}
    │       │       │
    │       │       └─→ useEffect: fetchData()
    │       │               │
    │       │               └─→ POST /api/data/ (empty filters)
    │       │                       │
    │       │                       └─→ Backend: get_filtered_data()
    │       │                               │
    │       │                               ├─→ Apply filters (none = all data)
    │       │                               ├─→ Aggregate for salesByYear
    │       │                               ├─→ Aggregate for volumeByYear
    │       │                               ├─→ Aggregate for salesByBrandYear
    │       │                               ├─→ Aggregate for volumeByBrandYear
    │       │                               ├─→ Aggregate for monthlyTrend
    │       │                               ├─→ Aggregate for marketShareSales
    │       │                               └─→ Aggregate for yearBrandSales
    │       │                                       │
    │       │               ◄───────────────────────┘
    │       │               Return: {all aggregations}
    │       │
    │       └─→ Render Complete Dashboard
    │               │
    │               ├─→ Header
    │               ├─→ Filters (populated with options)
    │               └─→ Dashboard
    │                       │
    │                       ├─→ SalesByYear Chart
    │                       ├─→ VolumeByYear Chart
    │                       ├─→ YearBrandSales Chart
    │                       ├─→ MonthlyTrend Chart
    │                       └─→ MarketShare Chart
    │
    └─→ Display to User
```

### 2. Filter Change Sequence

```
User Selects Filter (e.g., Brand 1)
    │
    ├─→ MultiSelect onChange
    │       │
    │       └─→ handleFilterChange('brands', ['Brand 1'])
    │               │
    │               └─→ setSelectedFilters({...prev, brands: ['Brand 1']})
    │                       │
    │                       └─→ useEffect (dependency: selectedFilters)
    │                               │
    │                               └─→ fetchData()
    │                                       │
    │                                       └─→ POST /api/data/
    │                                           Body: {filters: {brands: ['Brand 1'], ...}}
    │                                               │
    │                                               └─→ Backend processes
    │                                                   (filter + aggregate)
    │                                                       │
    │                               ◄───────────────────────┘
    │                               setChartData(response.data)
    │                                       │
    │                                       └─→ All charts re-render
    │                                           with new data
    │
    └─→ Updated visualization displayed
```

### 3. Reset Flow

```
User Clicks Reset
    │
    ├─→ handleReset()
    │       │
    │       └─→ setSelectedFilters({all empty arrays})
    │               │
    │               └─→ useEffect triggers
    │                       │
    │                       └─→ fetchData() with empty filters
    │                               │
    │                               └─→ Backend returns all data
    │                                       │
    │                                       └─→ Charts show complete dataset
```

---

## Data Aggregation Details

### Backend Processing (get_filtered_data)

```python
Input: {
    filters: {
        brands: ['Brand 1'],
        packTypes: [],
        ppgs: ['Small Single'],
        channels: [],
        years: [2021, 2022]
    }
}

Processing Steps:
    1. Load cached DataFrame
    2. Apply filters:
       df = df[df['Brand'].isin(['Brand 1'])]
       df = df[df['PPG'].isin(['Small Single'])]
       df = df[df['Year'].isin([2021, 2022])]
    
    3. Aggregate for each chart:
       
       salesByYear:
         GROUP BY Year → SUM(SalesValue)
       
       volumeByYear:
         GROUP BY Year → SUM(Volume)
       
       salesByBrandYear:
         GROUP BY Year, Brand → SUM(SalesValue)
       
       volumeByBrandYear:
         GROUP BY Year, Brand → SUM(Volume)
       
       monthlyTrend:
         GROUP BY Year, Month → SUM(SalesValue), FIRST(date)
       
       marketShareSales:
         GROUP BY Brand → SUM(SalesValue), SUM(Volume)
       
       yearBrandSales:
         GROUP BY Brand, Year → SUM(SalesValue)

Output: {
    salesByYear: [{Year: 2021, SalesValue: 1234567}, ...],
    volumeByYear: [{Year: 2021, Volume: 98765}, ...],
    salesByBrandYear: [{Year: 2021, Brand: 'Brand 1', SalesValue: 567890}, ...],
    ...
}
```

---

## State Management

### React State Structure

```javascript
// App.js State
{
  // Filter Options (from backend)
  filterOptions: {
    brands: ['Brand 1', 'Brand 2', 'Brand 3', 'Brand 4'],
    packTypes: ['Flavoured'],
    ppgs: ['Small Single', 'Standard Single'],
    channels: ['Convenience', 'Modern Trade'],
    years: [2021, 2022, 2023]
  },
  
  // User Selected Filters
  selectedFilters: {
    brands: [],      // Empty = All
    packTypes: [],
    ppgs: [],
    channels: [],
    years: []
  },
  
  // Chart Data (from backend)
  chartData: {
    salesByYear: [...],
    volumeByYear: [...],
    salesByBrandYear: [...],
    volumeByBrandYear: [...],
    monthlyTrend: [...],
    marketShareSales: [...],
    yearBrandSales: [...]
  },
  
  // UI State
  loading: false,
  activeTab: 'trends'
}
```

---

## Technology Integration

### Frontend Stack Integration

```
React (UI Framework)
    │
    ├─→ Components (Modular UI)
    │       │
    │       ├─→ Functional Components
    │       ├─→ React Hooks (useState, useEffect, useRef)
    │       └─→ Event Handlers
    │
    ├─→ Chart.js (Visualization)
    │       │
    │       ├─→ react-chartjs-2 (React wrapper)
    │       ├─→ Bar, Line, Doughnut components
    │       ├─→ Responsive canvas rendering
    │       └─→ Interactive tooltips
    │
    ├─→ Axios (HTTP Client)
    │       │
    │       ├─→ GET requests (filters)
    │       ├─→ POST requests (data)
    │       └─→ Promise-based async
    │
    └─→ CSS (Styling)
            │
            ├─→ Flexbox layouts
            ├─→ Grid systems
            ├─→ Media queries (responsive)
            └─→ CSS transitions/animations
```

### Backend Stack Integration

```
Django (Web Framework)
    │
    ├─→ Django REST Framework
    │       │
    │       ├─→ @api_view decorators
    │       ├─→ Response/Request objects
    │       └─→ JSON serialization
    │
    ├─→ django-cors-headers
    │       │
    │       └─→ Cross-origin resource sharing
    │
    ├─→ Pandas (Data Processing)
    │       │
    │       ├─→ DataFrame operations
    │       ├─→ GroupBy aggregations
    │       ├─→ Filtering/sorting
    │       └─→ Type conversions
    │
    └─→ Settings & Configuration
            │
            ├─→ CORS settings
            ├─→ Static files
            └─→ Database (SQLite for dev)
```

---

## Performance Considerations

### Backend Optimization

1. **Data Caching**
   ```python
   # Singleton pattern for DataLoader
   class DataLoader:
       _instance = None
       _data = None  # Cached DataFrame
   ```
   - CSV loaded once on first request
   - Subsequent requests use cached data
   - Memory efficient for datasets < 100MB

2. **Pandas Efficiency**
   - Vectorized operations
   - Efficient groupby aggregations
   - Type optimization (Int64 vs float)

### Frontend Optimization

1. **React Optimization**
   - Hooks prevent unnecessary re-renders
   - Component-level state isolation
   - Conditional rendering

2. **Chart Rendering**
   - Canvas-based rendering (GPU accelerated)
   - Responsive sizing
   - Tooltip caching

---

## Security Architecture

### CORS Configuration

```
Frontend (localhost:3000)
    │
    │ CORS Request
    │ Origin: http://localhost:3000
    │
    ├─→ Django Backend (localhost:8000)
    │       │
    │       └─→ CORS Headers Middleware
    │               │
    │               ├─→ Check ALLOWED_ORIGINS
    │               ├─→ Add Access-Control-Allow-Origin
    │               └─→ Add Access-Control-Allow-Methods
    │
    └─→ Response with CORS headers
```

### Production Security Checklist

- [ ] Set DEBUG = False
- [ ] Configure ALLOWED_HOSTS
- [ ] Use environment variables for secrets
- [ ] Implement authentication
- [ ] Add rate limiting
- [ ] Enable HTTPS
- [ ] Sanitize inputs
- [ ] Configure proper CORS origins

---

## Scalability Path

### Current Architecture
```
Single Server
├── Django (port 8000)
└── React Dev Server (port 3000)
```

### Production Architecture
```
                    ┌─────────────┐
                    │  CDN        │
                    │  (Assets)   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Nginx      │
                    │  (Reverse   │
                    │   Proxy)    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │  React App  │          │  Django     │
       │  (Static)   │          │  + Gunicorn │
       └─────────────┘          └──────┬──────┘
                                       │
                                ┌──────▼──────┐
                                │  PostgreSQL │
                                │  (Database) │
                                └─────────────┘
                                       │
                                ┌──────▼──────┐
                                │  Redis      │
                                │  (Cache)    │
                                └─────────────┘
```

---

**Architecture Version**: 1.0.0  
**Last Updated**: October 2025

