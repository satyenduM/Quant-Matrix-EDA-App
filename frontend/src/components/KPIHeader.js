import React, { useState, useEffect } from 'react';
import './KPIHeader.css';
import { formatCurrency, formatVolume } from '../utils/formatters';

const KPIHeader = ({ data, loading }) => {
  const [metricType, setMetricType] = useState('value'); // 'value' or 'volume'
  const [lastValidKpis, setLastValidKpis] = useState({
    totalSum: 0,
    average: 0,
    minimum: 0,
    maximum: 0
  });

  // Calculate KPIs from the data
  const calculateKPIs = () => {
    if (!data) {
      return lastValidKpis;
    }

    // Prefer backend-provided kpiStats computed over full filtered dataset
    const statsRoot = data.kpiStats || null;
    if (statsRoot) {
      const stats = metricType === 'value' ? statsRoot.value : statsRoot.volume;
      const totalSum = Number(stats?.sum ?? 0);
      const average = Number(stats?.average ?? 0);
      const minimum = Number(stats?.min ?? 0);
      const maximum = Number(stats?.max ?? 0);
      return { totalSum, average, minimum, maximum };
    }

    // Fallback to aggregations if kpiStats is not present
    const sourceData = metricType === 'value'
      ? (data.salesByBrandYear || [])
      : (data.volumeByBrandYear || []);
    const fieldName = metricType === 'value' ? 'SalesValue' : 'Volume';
    const values = sourceData.map(item => Number(item[fieldName]) || 0); // include zeros

    const totalSum = values.reduce((sum, val) => sum + val, 0);
    const average = values.length > 0 ? totalSum / values.length : 0;
    const minimum = values.length > 0 ? Math.min(...values) : 0;
    const maximum = values.length > 0 ? Math.max(...values) : 0;

    return { totalSum, average, minimum, maximum };
  };

  const kpis = calculateKPIs();

  // Update last valid KPIs when we have new data or metric type changes
  useEffect(() => {
    if (data && !loading) {
      setLastValidKpis(calculateKPIs());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loading, metricType]);

  if (loading && !data) {
    return (
      <div className="kpi-header">
        <div className="kpi-container">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="kpi-card">
              <div className="kpi-skeleton">
                <div className="kpi-skeleton-title"></div>
                <div className="kpi-skeleton-value"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatValue = (value) => {
    return metricType === 'value' ? formatCurrency(value) : formatVolume(value);
  };

  // Show exact value (no K/M abbreviations) for Minimum
  const formatExact = (value) => {
    const num = Number(value) || 0;
    if (metricType === 'value') {
      return `€${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const isInt = Number.isInteger(num);
    return num.toLocaleString(undefined, { minimumFractionDigits: isInt ? 0 : 2, maximumFractionDigits: isInt ? 0 : 2 });
  };

  return (
    <div className="kpi-header">
      <div className="kpi-header-controls">
        <div className="metric-toggle">
          <button 
            className={`toggle-btn ${metricType === 'value' ? 'active' : ''}`}
            onClick={() => setMetricType('value')}
          >
            Sales Value
          </button>
          <button 
            className={`toggle-btn ${metricType === 'volume' ? 'active' : ''}`}
            onClick={() => setMetricType('volume')}
          >
            Volume
          </button>
        </div>
      </div>
      
      <div className="kpi-container">
        <div className="kpi-card">
          <div className="kpi-title">Total Sum</div>
          <div className="kpi-value">{formatValue(kpis.totalSum)}</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-title">Average</div>
          <div className="kpi-value">{formatValue(kpis.average)}</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-title">Minimum</div>
          <div className="kpi-value">{formatExact(kpis.minimum)}</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-title">Maximum</div>
          <div className="kpi-value">{formatValue(kpis.maximum)}</div>
        </div>
      </div>
    </div>
  );
};

export default KPIHeader;
