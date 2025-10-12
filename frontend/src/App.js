import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import Filters from './components/Filters';
import Dashboard from './components/Dashboard';
import { edaApi } from './services/api';
import { useDebounce } from './hooks/useDebounce';
import { DEBOUNCE_DELAY } from './constants/animations';

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

  const fetchFilterOptions = async () => {
    try {
      const data = await edaApi.getFilterOptions();
      setFilterOptions(data);
    } catch (error) {
      // Error already logged in API client
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await edaApi.getFilteredData(selectedFilters);
      setChartData(data);
    } catch (error) {
      // Error already logged in API client
    } finally {
      setLoading(false);
    }
  }, [selectedFilters]);

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced fetch data when filters change
  useDebounce(fetchData, DEBOUNCE_DELAY, [selectedFilters]);

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

