import React, { useState, useEffect } from 'react';
import './KPIHeader.css';
import { formatCurrency, formatVolume, formatPercentage } from '../utils/formatters';

const KPIHeader = ({ data, loading }) => {
  const [lastValidKpis, setLastValidKpis] = useState({
    totalSalesValue: 0,
    totalVolume: 0,
    asp: 0,
    yoyGrowth: 0
  });

  // Calculate KPIs from the data
  const calculateKPIs = () => {
    if (!data) {
      return lastValidKpis;
    }

    // Get all sales data
    const salesData = data.salesByBrandYear || [];
    const volumeData = data.volumeByBrandYear || [];
    
    // Calculate total sales value
    const totalSalesValue = salesData.reduce((sum, item) => sum + (item.SalesValue || 0), 0);
    
    // Calculate total volume
    const totalVolume = volumeData.reduce((sum, item) => sum + (item.Volume || 0), 0);
    
    // Calculate ASP (Average Selling Price)
    const asp = totalVolume > 0 ? totalSalesValue / totalVolume : 0;
    
    // Calculate YoY growth - compare current year with previous year
    const salesByYear = data.salesByYear || [];
    const years = [...new Set(salesByYear.map(item => item.Year))].sort((a, b) => b - a);
    
    let yoyGrowth = 0;
    if (years.length >= 2) {
      const currentYear = years[0];
      const previousYear = years[1];
      
      const currentYearSales = salesByYear.find(item => item.Year === currentYear)?.SalesValue || 0;
      const previousYearSales = salesByYear.find(item => item.Year === previousYear)?.SalesValue || 0;
      
      if (previousYearSales > 0) {
        yoyGrowth = ((currentYearSales - previousYearSales) / previousYearSales) * 100;
      }
    }

    return {
      totalSalesValue,
      totalVolume,
      asp,
      yoyGrowth
    };
  };

  const kpis = calculateKPIs();

  // Update last valid KPIs when we have new data
  useEffect(() => {
    if (data && !loading) {
      setLastValidKpis(calculateKPIs());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loading]);

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

  return (
    <div className="kpi-header">
      <div className="kpi-container">
        <div className="kpi-card">
          <div className="kpi-title">Total Sales Value</div>
          <div className="kpi-value">{formatCurrency(kpis.totalSalesValue)}</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-title">Total Volume</div>
          <div className="kpi-value">{formatVolume(kpis.totalVolume)}</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-title">ASP</div>
          <div className="kpi-value">€{kpis.asp.toFixed(2)}</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-title">YoY Growth</div>
          <div className={`kpi-value ${kpis.yoyGrowth >= 0 ? 'positive' : 'negative'}`}>
            {formatPercentage(kpis.yoyGrowth)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPIHeader;
