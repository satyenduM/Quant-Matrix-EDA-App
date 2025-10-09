import React, { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import './ChartStyles.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const MarketShare = ({ data }) => {
  const [viewType, setViewType] = useState('sales'); // 'sales' or 'volume'

  if (!data || !data.marketShareSales) {
    return <div className="chart-placeholder">No data available</div>;
  }

  // Color palette
  const colors = [
    '#FFA726', // Orange
    '#42A5F5', // Blue
    '#66BB6A', // Green
    '#9CCC65', // Light Green
    '#AB47BC', // Purple
    '#EC407A', // Pink
  ];

  const brands = data.marketShareSales.map(d => d.Brand);
  const salesValues = data.marketShareSales.map(d => d.SalesValue);
  const volumeValues = data.marketShareSales.map(d => d.Volume);

  const dataValues = viewType === 'sales' ? salesValues : volumeValues;
  const total = dataValues.reduce((sum, val) => sum + val, 0);

  const chartData = {
    labels: brands,
    datasets: [
      {
        data: dataValues,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      title: {
        display: true,
        text: `Market Share by ${viewType === 'sales' ? 'Sales Value' : 'Volume'}`,
        align: 'start',
        font: {
          size: 14,
          weight: '600'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            
            let formattedValue;
            if (viewType === 'sales') {
              formattedValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value);
            } else {
              formattedValue = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value) + ' KG';
            }
            
            return `${label}: ${formattedValue} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="chart-wrapper">
      <div className="chart-controls">
        <button 
          className={viewType === 'sales' ? 'active' : ''}
          onClick={() => setViewType('sales')}
        >
          Sales Value
        </button>
        <button 
          className={viewType === 'volume' ? 'active' : ''}
          onClick={() => setViewType('volume')}
        >
          Volume
        </button>
      </div>
      <div style={{ height: '350px', display: 'flex', justifyContent: 'center' }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MarketShare;

