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

const SalesByYear = ({ data }) => {
  if (!data || !data.salesByBrandYear) {
    return <div className="chart-placeholder">No data available</div>;
  }

  // Get unique years and brands
  const years = [...new Set(data.salesByBrandYear.map(d => d.Year))].sort();
  const brands = [...new Set(data.salesByBrandYear.map(d => d.Brand))];

  // Color palette
  const colors = [
    '#FFA726', // Orange - Brand 1
    '#42A5F5', // Blue - Brand 2
    '#66BB6A', // Green - Brand 3
    '#9CCC65', // Light Green - Brand 4
    '#AB47BC', // Purple
    '#EC407A', // Pink
  ];

  // Prepare datasets for each brand
  const datasets = brands.map((brand, index) => {
    const brandData = years.map(year => {
      const record = data.salesByBrandYear.find(d => d.Brand === brand && d.Year === year);
      return record ? record.SalesValue : 0;
    });

    return {
      label: brand,
      data: brandData,
      backgroundColor: colors[index % colors.length],
      borderRadius: 4,
    };
  });

  const chartData = {
    labels: years,
    datasets: datasets
  };

  const options = {
    indexAxis: 'y',
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
        text: 'Sales Value (EURO)',
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
            if (context.parsed.x !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(context.parsed.x);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: true,
          drawBorder: false
        },
        ticks: {
          callback: function(value) {
            return (value / 1000000).toFixed(0) + ' M';
          }
        }
      },
      y: {
        stacked: true,
        grid: {
          display: false
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

export default SalesByYear;

