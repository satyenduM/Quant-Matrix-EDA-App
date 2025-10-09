# EDA Dashboard Application

An Exploratory Data Analysis (EDA) dashboard built with React (frontend) and Django (backend) for analyzing FMCG retail data.

## Features

### Interactive Filters
- Brand selection
- Pack Type selection
- PPG (Price Point Group) selection
- Channel selection
- Year selection
- Reset functionality

### Visualizations

1. **Sales Value by Year** - Horizontal stacked bar chart showing sales value distribution across years and brands
2. **Volume Contribution by Year** - Horizontal stacked bar chart showing volume (KG) distribution
3. **Year-wise Sales Value** - Vertical bar chart comparing sales across brands for different years
4. **Monthly Trend** - Line chart showing sales value trends over time
5. **Market Share** - Interactive donut chart displaying market share by sales value or volume

## Technology Stack

### Backend
- Django 4.2.7
- Django REST Framework
- Pandas for data processing
- CORS headers for cross-origin requests

### Frontend
- React 18.2
- Chart.js with react-chartjs-2 for visualizations
- Axios for API calls
- Modern CSS with responsive design

## Project Structure

```
Task/
├── backend/
│   ├── eda_project/          # Django project settings
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── api/                  # Django app for API endpoints
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── data_loader.py    # Data loading and caching
│   │   ├── models.py
│   │   ├── admin.py
│   │   └── tests.py
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js          # App header with logo
│   │   │   ├── Header.css
│   │   │   ├── Filters.js         # Filter controls
│   │   │   ├── Filters.css
│   │   │   ├── MultiSelect.js     # Multi-select dropdown
│   │   │   ├── MultiSelect.css
│   │   │   ├── Dashboard.js       # Main dashboard layout
│   │   │   ├── Dashboard.css
│   │   │   └── charts/
│   │   │       ├── SalesByYear.js
│   │   │       ├── VolumeByYear.js
│   │   │       ├── YearBrandSales.js
│   │   │       ├── MonthlyTrend.js
│   │   │       ├── MarketShare.js
│   │   │       └── ChartStyles.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── Technical Evaluation.csv  # Dataset
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- On macOS/Linux:
  ```bash
  source venv/bin/activate
  ```
- On Windows:
  ```bash
  venv\Scripts\activate
  ```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Start the Django development server:
```bash
python manage.py runserver
```

The backend will be running at `http://localhost:8000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will be running at `http://localhost:3000`

## Usage

1. Ensure both backend (port 8000) and frontend (port 3000) servers are running
2. Open your browser and navigate to `http://localhost:3000`
3. Use the filter dropdowns to select your desired data filters:
   - Select one or more options from each filter
   - Click "Reset" to clear all filters
4. Charts will automatically update based on your filter selections
5. Hover over chart elements to see detailed tooltips
6. In the Market Share chart, toggle between "Sales Value" and "Volume" views

## API Endpoints

### GET /api/health/
Health check endpoint to verify API is running.

**Response:**
```json
{
  "status": "ok",
  "message": "EDA API is running"
}
```

### GET /api/filters/
Get all available filter options.

**Response:**
```json
{
  "brands": ["Brand 1", "Brand 2", ...],
  "packTypes": ["Type 1", "Type 2", ...],
  "ppgs": ["Small Single", "Standard Single", ...],
  "channels": ["Convenience", "Modern Trade", ...],
  "years": [2021, 2022, 2023]
}
```

### POST /api/data/
Get filtered and aggregated data.

**Request Body:**
```json
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

**Response:**
```json
{
  "salesByYear": [...],
  "volumeByYear": [...],
  "salesByBrandYear": [...],
  "volumeByBrandYear": [...],
  "monthlyTrend": [...],
  "marketShareSales": [...],
  "yearBrandSales": [...]
}
```

## Data Format

The application expects a CSV file named `Technical Evaluation.csv` in the project root with the following columns:
- Market
- Channel
- Region
- Category
- SubCategory
- Brand
- Variant
- PackType
- PPG
- PackSize
- Year
- Month
- Week
- date (format: DD-MM-YYYY)
- SalesValue
- Volume
- VolumeUnits
- Additional columns (D1-D6, AV1-AV6, EV1-EV6)

## Design Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface matching the reference dashboard
- **Interactive Charts**: Hover effects, tooltips, and smooth animations
- **Color Coding**: Consistent color scheme across all charts for easy brand identification
- **Loading States**: Clear feedback when data is being fetched
- **Empty States**: Helpful messages when no data is available

## Customization

### Adding New Charts
1. Create a new component in `frontend/src/components/charts/`
2. Import and register required Chart.js components
3. Add the chart to the Dashboard component

### Modifying Colors
Edit the color arrays in individual chart components to change brand colors.

### Adding New Filters
1. Update `get_filter_options` in `backend/api/views.py`
2. Add new filter in `Filters.js` component
3. Update filter handling logic in `App.js`

## Performance Optimization

- Data is cached in memory on the backend for faster subsequent requests
- Frontend uses React hooks for efficient state management
- Charts are rendered with optimized Canvas rendering
- Responsive design reduces unnecessary re-renders

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure:
- Django CORS headers are properly configured in `settings.py`
- Backend is running on port 8000
- Frontend proxy is correctly set in `package.json`

### Data Loading Issues
If charts don't display:
- Check that `Technical Evaluation.csv` is in the correct location
- Verify the CSV format matches expected structure
- Check browser console for error messages
- Verify backend API responses in Network tab

### Chart Display Issues
If charts appear distorted:
- Clear browser cache
- Ensure Chart.js and react-chartjs-2 versions are compatible
- Check console for any JavaScript errors

## Future Enhancements

- Export functionality (CSV, PDF, PNG)
- Date range picker for custom time periods
- Drill-down capabilities for detailed analysis
- Comparison mode for side-by-side analysis
- User authentication and saved filter presets
- Real-time data updates
- Advanced analytics (predictions, trends, anomalies)

## License

This project is created for evaluation purposes.

## Contact

For questions or support, please refer to the project documentation.

