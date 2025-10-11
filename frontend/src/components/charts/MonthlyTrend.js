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
import useTweenedNumber from './animations/useTweenedNumber';
import ChartSkeleton from './ChartSkeleton';

function formatMillions(value) {
  if (value == null || isNaN(value)) return '';
  const millions = value / 1000000;
  // Show 1 decimal when needed, otherwise integer
  const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
  return `${formatted}M`;
}

// Animation constants for smooth transitions
const ANIM = { duration: 200, easing: 'ease-out' };

const CustomTooltip = ({ active, payload, label, selectedMetric }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const text = selectedMetric === 'asp' ? `€${(value ?? 0).toFixed(2)}` : formatMillions(value);
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-date">{label}</div>
        <div className="chart-tooltip-value">{text}</div>
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
      const sales = Number(item.SalesValue) || 0;
      const vol = Number(item.Volume) || 0;
      const asp = vol > 0 ? sales / vol : 0;
      return {
        label: `${month} ${year}`,
        value: sales,
        volume: vol,
        asp: asp
      };
    });
  }, [data]);

  // Preserve last data to avoid unmounting/empties while loading
  const [lastData, setLastData] = useState([]);
  useEffect(() => {
    if (!loading && processedData.length > 0) setLastData(processedData);
  }, [loading, processedData]);

  const displayData = processedData.length > 0 ? processedData : lastData;

  // Stable animation id to animate line morph when metric changes or data updates
  const animId = useMemo(() => {
    const vals = (displayData || []).map(d => (selectedMetric === 'value' ? d.value : d.volume)).join(',');
    return `${selectedMetric}::${vals}`;
  }, [displayData, selectedMetric]);

  // Dynamic Y-axis scaling based on current filtered data
  const currentValues = (displayData || []).map(d => selectedMetric === 'value' ? d.value : selectedMetric === 'volume' ? d.volume : d.asp);
  const computedMax = useMemo(() => {
    const maxValue = Math.max(0, ...currentValues);
    const paddedMax = maxValue * 1.1;
    const step = selectedMetric === 'asp'
      ? (paddedMax <= 10 ? 1 : paddedMax <= 50 ? 5 : paddedMax <= 100 ? 10 : 50)
      : 1_000_000;
    return Math.ceil((paddedMax || step) / step) * step;
  }, [currentValues, selectedMetric]);

  const animatedMax = useTweenedNumber(computedMax, 400, 'easeOutCubic');
  const yDomain = [0, Math.max(0, Math.round(animatedMax))];

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
  const [hasShownData, setHasShownData] = useState(false);
  useEffect(() => {
    if ((displayData || []).length > 0) setHasShownData(true);
  }, [displayData]);

  if (loading && displayData.length === 0) {
    return <ChartSkeleton variant="line" height={320} />;
  }

  // Define a width that creates room to scroll if many months
  const pointWidthPx = 80; // width per month label
  const chartWidthPx = Math.max((displayData || []).length * pointWidthPx, 900);

  const metricOptions = [
    { value: 'value', label: 'Value' },
    { value: 'volume', label: 'Volume' },
    { value: 'asp', label: 'ASP' }
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
      {(displayData || []).length === 0 ? (
        <div className="chart-placeholder">No data available</div>
      ) : (
        <>
          <div ref={scrollRef} className="chart-scroll">
            <div style={{ width: `${chartWidthPx}px`, height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={displayData} margin={{ top: 10, right: 10, bottom: 30, left: 0 }}>
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
                    tickFormatter={selectedMetric === 'asp' ? (v) => `€${Number(v || 0).toFixed(0)}` : formatMillions}
                    tick={{ fontSize: 12, fill: '#666' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={(props) => <CustomTooltip {...props} selectedMetric={selectedMetric} />} cursor={{ stroke: '#94e2b3', strokeWidth: 1, opacity: 0.4 }} isAnimationActive={false}/>
                  <Line
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 3, stroke: '#fff', strokeWidth: 2, fill: '#22c55e' }}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#22c55e' }}
                    isAnimationActive
                    isUpdateAnimationActive
                    animationId={animId}
                    animationDuration={ANIM.duration}
                    animationEasing={ANIM.easing}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {loading && !hasShownData && (
            <div className="chart-overlay">
              <ChartSkeleton variant="line" height={320} />
            </div>
          )}
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

