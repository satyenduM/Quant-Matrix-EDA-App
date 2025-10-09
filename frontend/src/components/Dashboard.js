import React from 'react';
import './Dashboard.css';
import SalesByYear from './charts/SalesByYear';
import VolumeByYear from './charts/VolumeByYear';
import YearBrandSales from './charts/YearBrandSales';
import MonthlyTrend from './charts/MonthlyTrend';
import MarketShare from './charts/MarketShare';

const Dashboard = ({ data }) => {
  if (!data) {
    return (
      <div className="dashboard-empty">
        <p>No data available. Please adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-row">
        <div className="chart-container half">
          <SalesByYear data={data} />
        </div>
        <div className="chart-container half">
          <VolumeByYear data={data} />
        </div>
      </div>
      
      <div className="dashboard-row">
        <div className="chart-container half">
          <YearBrandSales data={data} />
        </div>
        <div className="chart-container half">
          <MonthlyTrend data={data} />
        </div>
      </div>
      
      <div className="dashboard-row">
        <div className="chart-container full">
          <MarketShare data={data} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

