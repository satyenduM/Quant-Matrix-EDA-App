import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import Header from './components/Header';
import Filters from './components/Filters';
import Dashboard from './components/Dashboard';
import axios from 'axios';

function App() {
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    packTypes: [],
    ppgs: [],
    channels: [],
    years: []
  });

  const [selectedFilters, setSelectedFilters] = useState({
    brands: [],
    packTypes: [],
    ppgs: [],
    channels: [],
    years: []
  });

  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('brand');
  const debounceTimeoutRef = useRef(null);

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Debounced fetch data when filters change
  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout for debounced fetch
    debounceTimeoutRef.current = setTimeout(() => {
      fetchData();
    }, 150); // 150ms debounce
    
    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [selectedFilters]);

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/filters/');
      setFilterOptions(response.data);
    } catch (error) {
      try {
        const response = await axios.get('https://quant-matrix-eda-app-production.up.railway.app/api/filters/');
        setFilterOptions(response.data);
      } catch (railwayError) {
        console.error('Error fetching filter options from both localhost and Railway:', railwayError);
      }
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/data/', {
        filters: selectedFilters
      });
      setChartData(response.data);
    } catch (error) {
      try {
        const response = await axios.post('https://quant-matrix-eda-app-production.up.railway.app/api/data/', {
          filters: selectedFilters
        });
        setChartData(response.data);
      } catch (railwayError) {
        console.error('Error fetching data from both localhost and Railway:', railwayError);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedFilters]);

  const handleFilterChange = (filterType, values) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  const handleReset = () => {
    setSelectedFilters({
      brands: [],
      packTypes: [],
      ppgs: [],
      channels: [],
      years: []
    });
  };

  return (
    <div className="App">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="app-content">
        <div className="page-header">
          <h1>Consumer Surplus Factor (CSF)</h1>
          <div className="tabs">
            <button 
              className={activeTab === 'brand' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('brand')}
            >
              Brand
            </button>
            <button 
              className={activeTab === 'packType' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('packType')}
            >
              Pack Type
            </button>
            <button 
              className={activeTab === 'ppg' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('ppg')}
            >
              PPG
            </button>
            <button 
              className={activeTab === 'brand-x-pack' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('brand-x-pack')}
            >
              Brand X Pack Type X PPG
            </button>
            <button 
              className={activeTab === 'correlation' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('correlation')}
            >
              Correlation and Trends
            </button>
          </div>
        </div>
        
        <Filters 
          filterOptions={filterOptions}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />
        
        <Dashboard data={chartData} loading={loading} viewMode={activeTab} />
      </div>
    </div>
  );
}

export default App;

