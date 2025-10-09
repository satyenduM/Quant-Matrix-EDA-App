import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('trends');

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchData();
  }, [selectedFilters]);

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/filters/');
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/data/', {
        filters: selectedFilters
      });
      setChartData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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
              Brand X Pack Type X PPC
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
        
        {loading ? (
          <div className="loading">Loading data...</div>
        ) : (
          <Dashboard data={chartData} />
        )}
      </div>
    </div>
  );
}

export default App;

