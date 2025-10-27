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
import { formatMillions } from '../../utils/formatters';
import { CHART_ANIMATION } from '../../constants/animations';


const CustomTooltip = ({ active, payload, label, selectedMetric }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-date">{label}</div>
        {payload.map((entry, index) => {
          const value = entry.value;
          const text = selectedMetric === 'asp' ? `€${(value ?? 0).toFixed(2)}` : formatMillions(value);
          return (
            <div key={index} style={{ color: entry.color, marginTop: index > 0 ? '4px' : '0' }}>
              <strong>{entry.name}:</strong> {text}
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const MonthlyTrend = ({ data, loading }) => {
  const [selectedMetric, setSelectedMetric] = useState('value');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dimensionDropdownOpen, setDimensionDropdownOpen] = useState(false);
  const [dimension, setDimension] = useState('brand'); // 'brand' or 'channel'

  // Process data by brand or channel
  const processedData = useMemo(() => {
    const sourceData = dimension === 'brand' 
      ? (data?.monthlyBrandSales || [])
      : (data?.monthlyChannelSales || []);
    
    if (!sourceData.length) return [];
    
    // Get unique months
    const monthsSet = new Set();
    sourceData.forEach(item => {
      if (item.date) monthsSet.add(item.date);
    });
    const sortedMonths = Array.from(monthsSet).sort();
    
    // Get unique entities (brands or channels)
    const entityKey = dimension === 'brand' ? 'Brand' : 'Channel';
    const entities = Array.from(new Set(sourceData.map(item => item[entityKey]))).sort();
    
    // Build data structure: array of objects with label + one key per entity
    return sortedMonths.map(dateStr => {
      const date = new Date(dateStr);
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const label = `${month} ${year}`;
      
      const dataPoint = { label, date: dateStr };
      
      entities.forEach(entity => {
        const record = sourceData.find(r => r.date === dateStr && r[entityKey] === entity);
        const sales = Number(record?.SalesValue) || 0;
        const vol = Number(record?.Volume) || 0;
        const asp = vol > 0 ? sales / vol : 0;
        
        dataPoint[`${entity}_value`] = sales;
        dataPoint[`${entity}_volume`] = vol;
        dataPoint[`${entity}_asp`] = asp;
      });
      
      return dataPoint;
    });
  }, [data, dimension]);
  
  // Get list of entities for current dimension
  const entities = useMemo(() => {
    const sourceData = dimension === 'brand' 
      ? (data?.monthlyBrandSales || [])
      : (data?.monthlyChannelSales || []);
    const entityKey = dimension === 'brand' ? 'Brand' : 'Channel';
    return Array.from(new Set(sourceData.map(item => item[entityKey]))).sort();
  }, [data, dimension]);

  // Preserve last data to avoid unmounting/empties while loading
  const [lastData, setLastData] = useState([]);
  useEffect(() => {
    if (!loading && processedData.length > 0) setLastData(processedData);
  }, [loading, processedData]);

  const displayData = processedData.length > 0 ? processedData : lastData;

  // Stable animation id to animate line morph when metric changes or data updates
  const animId = useMemo(() => {
    return `${dimension}::${selectedMetric}::${(displayData || []).length}`;
  }, [displayData, selectedMetric, dimension]);

  // Dynamic Y-axis scaling based on current filtered data
  const currentValues = useMemo(() => {
    const values = [];
    (displayData || []).forEach(d => {
      entities.forEach(entity => {
        const key = `${entity}_${selectedMetric}`;
        if (d[key] !== undefined) values.push(d[key]);
      });
    });
    return values;
  }, [displayData, selectedMetric, entities]);
  
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
    if (!dropdownOpen && !dimensionDropdownOpen) return;

    const handleClickOutside = (e) => {
      const target = e.target;
      const dropdowns = target.closest('.chart-dropdown-container');
      if (!dropdowns) {
        setDropdownOpen(false);
        setDimensionDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen, dimensionDropdownOpen]);

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
  
  const dimensionOptions = [
    { value: 'brand', label: 'Brand' },
    { value: 'channel', label: 'Channel' }
  ];

  const handleMetricChange = (metric) => {
    setSelectedMetric(metric);
    setDropdownOpen(false);
  };
  
  const handleDimensionChange = (newDimension) => {
    setDimension(newDimension);
    setDimensionDropdownOpen(false);
  };
  
  // Color palette for lines
  const colorPalette = [
    '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
  ];

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="chart-dropdown-container">
            <div 
              className="chart-dropdown" 
              onClick={() => setDimensionDropdownOpen(!dimensionDropdownOpen)}
              aria-label="Dimension selector" 
              role="button" 
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setDimensionDropdownOpen(!dimensionDropdownOpen);
                }
              }}
            >
              <span>{dimensionOptions.find(d => d.value === dimension)?.label}</span>
              <span className="chart-dropdown-caret">▼</span>
            </div>
            {dimensionDropdownOpen && (
              <div className="chart-dropdown-menu">
                {dimensionOptions.map(option => (
                  <div
                    key={option.value}
                    className={`chart-dropdown-item ${dimension === option.value ? 'active' : ''}`}
                    onClick={() => handleDimensionChange(option.value)}
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleDimensionChange(option.value);
                      }
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
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
                  {entities.map((entity, index) => {
                    const color = colorPalette[index % colorPalette.length];
                    const dataKey = `${entity}_${selectedMetric}`;
                    return (
                      <Line
                        key={entity}
                        type="monotone"
                        dataKey={dataKey}
                        name={entity}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ r: 3, stroke: '#fff', strokeWidth: 2, fill: color }}
                        activeDot={{ r: 6, stroke: '#000', strokeWidth: 2, fill: color }}
                        isAnimationActive
                        isUpdateAnimationActive
                        animationId={animId}
                        animationDuration={CHART_ANIMATION.duration}
                        animationEasing={CHART_ANIMATION.easing}
                      />
                    );
                  })}
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
          <div className="chart-legend" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'center',
            paddingTop: '20px',
            paddingBottom: '10px'
          }}>
            {entities.map((entity, index) => {
              const color = colorPalette[index % colorPalette.length];
              return (
                <div key={entity} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#666'
                }}>
                  <div style={{
                    width: '24px',
                    height: '2px',
                    backgroundColor: color,
                    borderRadius: '1px'
                  }} />
                  <span>{entity}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyTrend;

