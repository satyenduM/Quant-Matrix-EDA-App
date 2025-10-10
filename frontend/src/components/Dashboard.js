import React from 'react';
import './Dashboard.css';
import KPIHeader from './KPIHeader';
import SalesByYear from './charts/SalesByYear';
import VolumeByYear from './charts/VolumeByYear';
import YearBrandSales from './charts/YearBrandSales';
import MonthlyTrend from './charts/MonthlyTrend';
import MarketShare from './charts/MarketShare';

const Dashboard = ({ data, loading }) => {
  if (!loading && !data) {
    return (
      <div className="dashboard-empty">
        <p>No data available. Please adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <KPIHeader data={data} loading={loading} />
      
      <div className="dashboard-row">
        <div className="chart-container half">
          <SalesByYear data={data} loading={loading} />
        </div>
        <div className="chart-container half">
          <VolumeByYear data={data} loading={loading} />
        </div>
      </div>
      
      <div className="dashboard-row">
        <div className="chart-container half">
          <YearBrandSales data={data} loading={loading} />
        </div>
        <div className="chart-container half">
          <MonthlyTrend data={data} loading={loading} />
        </div>
      </div>
      
      <div className="dashboard-row">
        <div className="chart-container full">
          <MarketShare data={data} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

