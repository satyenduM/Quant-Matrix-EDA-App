import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './ChartStyles.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MonthlyTrend = ({ data }) => {
  if (!data || !data.monthlyTrend) {
    return <div className="chart-placeholder">No data available</div>;
  }

  // Format the data
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const labels = data.monthlyTrend.map(d => {
    const date = new Date(d.date);
    return `${monthNames[date.getMonth()]}-${date.getFullYear().toString().substr(2)}`;
  });

  const values = data.monthlyTrend.map(d => d.SalesValue);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Sales Value',
        data: values,
        borderColor: '#66BB6A',
        backgroundColor: 'rgba(102, 187, 106, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#66BB6A',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
        mode: 'index',
        intersect: false,
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
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10
          }
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
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="chart-wrapper">
      <Line data={chartData} options={options} height={300} />
    </div>
  );
};

export default MonthlyTrend;

