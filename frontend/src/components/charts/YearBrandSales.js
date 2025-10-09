import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './ChartStyles.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const YearBrandSales = ({ data }) => {
  if (!data || !data.yearBrandSales) {
    return <div className="chart-placeholder">No data available</div>;
  }

  // Get unique brands and years
  const brands = [...new Set(data.yearBrandSales.map(d => d.Brand))];
  const years = [...new Set(data.yearBrandSales.map(d => d.Year))].sort();

  // Color palette for years
  const yearColors = {
    2021: '#42A5F5',
    2022: '#66BB6A',
    2023: '#FFA726',
  };

  // Prepare datasets for each year
  const datasets = years.map((year) => {
    const yearData = brands.map(brand => {
      const record = data.yearBrandSales.find(d => d.Brand === brand && d.Year === year);
      return record ? record.SalesValue : 0;
    });

    return {
      label: year.toString(),
      data: yearData,
      backgroundColor: yearColors[year] || '#9E9E9E',
      borderRadius: 4,
    };
  });

  const chartData = {
    labels: brands,
    datasets: datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Value',
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
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          display: true,
          drawBorder: false
        },
        ticks: {
          callback: function(value) {
            return (value / 1000000).toFixed(0) + 'M';
          }
        }
      }
    }
  };

  return (
    <div className="chart-wrapper">
      <Bar data={chartData} options={options} height={300} />
    </div>
  );
};

export default YearBrandSales;

