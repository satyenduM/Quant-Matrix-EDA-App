import React from 'react';
import './KPIHeader.css';
import useTweenedNumber from './charts/animations/useTweenedNumber';

const KPIHeader = ({ data, loading }) => {
  // Calculate KPIs from the data
  const calculateKPIs = () => {
    if (!data || loading) {
      return {
        totalSalesValue: 0,
        totalVolume: 0,
        asp: 0,
        yoyGrowth: 0
      };
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

  const formatCurrency = (value) => {
    if (value >= 1e9) {
      return `€${(value / 1e9).toFixed(1)}B`;
    } else if (value >= 1e6) {
      return `€${(value / 1e6).toFixed(1)}M`;
    } else if (value >= 1e3) {
      return `€${(value / 1e3).toFixed(1)}K`;
    }
    return `€${value.toFixed(0)}`;
  };

  const formatVolume = (value) => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(1)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(1)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const kpis = calculateKPIs();
  
  // Animate KPI values
  const animatedSalesValue = useTweenedNumber(kpis.totalSalesValue, 300, 'easeOutCubic');
  const animatedVolume = useTweenedNumber(kpis.totalVolume, 300, 'easeOutCubic');
  const animatedASP = useTweenedNumber(kpis.asp, 300, 'easeOutCubic');
  const animatedYoY = useTweenedNumber(kpis.yoyGrowth, 300, 'easeOutCubic');

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
          <div className="kpi-value">{formatCurrency(animatedSalesValue)}</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-title">Total Volume</div>
          <div className="kpi-value">{formatVolume(animatedVolume)}</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-title">ASP</div>
          <div className="kpi-value">€{animatedASP.toFixed(2)}</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-title">YoY Growth</div>
          <div className={`kpi-value ${kpis.yoyGrowth >= 0 ? 'positive' : 'negative'}`}>
            {formatPercentage(animatedYoY)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPIHeader;
