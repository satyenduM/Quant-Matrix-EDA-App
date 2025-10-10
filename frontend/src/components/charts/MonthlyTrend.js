import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import './ChartStyles.css';
import ChartSkeleton from './ChartSkeleton';

function formatMillions(value) {
  if (value == null || isNaN(value)) return '';
  const millions = value / 1000000;
  // Show 1 decimal when needed, otherwise integer
  const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
  return `${formatted}M`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-date">{label}</div>
        <div className="chart-tooltip-value">{formatMillions(value)}</div>
      </div>
    );
  }
  return null;
};

const MonthlyTrend = ({ data, loading }) => {
  const [selectedMetric, setSelectedMetric] = useState('value');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const processedData = useMemo(() => {
    const monthly = (data && data.monthlyTrend) ? data.monthlyTrend : [];
    return monthly.map(item => {
      const date = new Date(item.date);
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return {
        label: `${month} ${year}`,
        value: item.SalesValue || 0,
        volume: item.Volume || 0
      };
    });
  }, [data]);

  const currentValues = processedData.map(d => selectedMetric === 'value' ? d.value : d.volume);
  const minValue = Math.min(...currentValues);
  const maxValue = Math.max(...currentValues);
  const range = Math.max(1, maxValue - minValue);
  const padding = range * 0.1;
  const yDomain = [
    Math.max(0, Math.floor((minValue - padding) / 1000000) * 1000000),
    Math.ceil((maxValue + padding) / 1000000) * 1000000
  ];

  // Horizontal scroll handling + indicator
  const scrollRef = useRef(null);
  const [thumbStyle, setThumbStyle] = useState({ width: '100px', left: 0 });

  useEffect(() => {
    function updateThumb() {
      const el = scrollRef.current;
      if (!el) return;
      const visible = el.clientWidth;
      const total = el.scrollWidth;
      const scrollLeft = el.scrollLeft;
      const trackWidth = 160; // px, matches CSS width

      if (total <= 0 || visible >= total) {
        setThumbStyle({ width: `${trackWidth}px`, left: 0 });
        return;
      }

      const thumbWidth = Math.max(24, (visible / total) * trackWidth);
      const maxLeft = trackWidth - thumbWidth;
      const left = Math.min(
        maxLeft,
        Math.max(0, (scrollLeft / (total - visible)) * maxLeft)
      );
      setThumbStyle({ width: `${thumbWidth}px`, left: `${left}px` });
    }

    updateThumb();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateThumb, { passive: true });
    window.addEventListener('resize', updateThumb);
    return () => {
      el.removeEventListener('scroll', updateThumb);
      window.removeEventListener('resize', updateThumb);
    };
  }, [processedData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (e) => {
      const target = e.target;
      if (!target.closest('.chart-dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  // Show skeleton while loading or when data is pending (after hooks)
  if (loading || (!data && processedData.length === 0)) {
    return <ChartSkeleton variant="line" height={320} />;
  }

  // Define a width that creates room to scroll if many months
  const pointWidthPx = 80; // width per month label
  const chartWidthPx = Math.max(processedData.length * pointWidthPx, 900);

  const metricOptions = [
    { value: 'value', label: 'Value' },
    { value: 'volume', label: 'Volume' }
  ];

  const handleMetricChange = (metric) => {
    setSelectedMetric(metric);
    setDropdownOpen(false);
  };

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <div className="chart-dropdown-container">
          <div 
            className="chart-dropdown" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Metric selector" 
            role="button" 
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setDropdownOpen(!dropdownOpen);
              }
            }}
          >
            <span>{metricOptions.find(m => m.value === selectedMetric)?.label}</span>
            <span className="chart-dropdown-caret">▼</span>
          </div>
          {dropdownOpen && (
            <div className="chart-dropdown-menu">
              {metricOptions.map(option => (
                <div
                  key={option.value}
                  className={`chart-dropdown-item ${selectedMetric === option.value ? 'active' : ''}`}
                  onClick={() => handleMetricChange(option.value)}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleMetricChange(option.value);
                    }
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {processedData.length === 0 ? (
        <div className="chart-placeholder">No data available</div>
      ) : (
        <>
          <div ref={scrollRef} className="chart-scroll">
            <div style={{ width: `${chartWidthPx}px`, height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={processedData} margin={{ top: 10, right: 10, bottom: 30, left: 0 }}>
                  <CartesianGrid stroke="#eaeaea" vertical horizontal={true} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#666' }}
                    interval={0}
                    angle={45}
                    textAnchor="start"
                    height={50}
                    tickLine={false}
                    axisLine={{ stroke: '#eee' }}
                  />
                  <YAxis
                    domain={yDomain}
                    tickFormatter={formatMillions}
                    tick={{ fontSize: 12, fill: '#666' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94e2b3', strokeWidth: 1, opacity: 0.4 }} isAnimationActive={false}/>
                  <Line
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 3, stroke: '#fff', strokeWidth: 2, fill: '#22c55e' }}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#22c55e' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-scrollbar">
            <div className="chart-scrollbar-track">
              <div className="chart-scrollbar-thumb" style={thumbStyle} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyTrend;

