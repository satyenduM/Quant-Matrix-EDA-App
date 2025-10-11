import React, { useMemo, useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Rectangle
} from 'recharts';
import './ChartStyles.css';
import useTweenedNumber from './animations/useTweenedNumber';
import ChartSkeleton from './ChartSkeleton';

// Helpers
function formatMillions(value) {
  if (value == null || isNaN(value)) return '';
  const millions = value / 1000000;
  const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
  return `${formatted}M`;
}

const sortBrands = (arr) => {
  return [...arr].sort((a, b) => {
    const na = /brand\s*(\d+)/i.exec(a);
    const nb = /brand\s*(\d+)/i.exec(b);
    if (na && nb) return parseInt(na[1], 10) - parseInt(nb[1], 10);
    return a.localeCompare(b);
  });
};

const yearColor = (year, index) => {
  const map = {
    2021: '#3b82f6', // blue
    2022: '#22c55e', // green
    2023: '#fbbf24', // amber
    2024: '#a7f3d0', // light green
  };
  if (map[year]) return map[year];
  const palette = ['#3b82f6', '#22c55e', '#fbbf24', '#a7f3d0', '#9333ea', '#06b6d4'];
  return palette[index % palette.length];
};

// Animation constants (short, ease-out)
const ANIM = { duration: 200, easing: 'ease-out' };

const CustomTooltip = ({ active, payload, label, hoveredKey }) => {
  if (!active || !payload || !payload.length) return null;
  const target = (hoveredKey && payload.find(p => String(p.dataKey) === String(hoveredKey))) || payload[payload.length - 1];
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-date">{target.name || target.dataKey}</div>
      <div className="chart-tooltip-value">{formatMillions(target.value)}</div>
    </div>
  );
};

const CustomLegend = ({ years }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
    {years.map((y, i) => (
      <div key={y} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '9999px', background: yearColor(y, i) }} />
        <span style={{ color: '#666', fontSize: 13 }}>{y}</span>
      </div>
    ))}
  </div>
);

const YearBrandSales = ({ data, loading }) => {
  // Dropdown state (Value/Volume)
  const [selectedMetric, setSelectedMetric] = useState('value');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [hoveredBrand, setHoveredBrand] = useState(null);

  // Preserve last computed structures to avoid refresh/unmount
  const [lastYears, setLastYears] = useState([]);
  const [lastRows, setLastRows] = useState([]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const onDocClick = (e) => {
      if (!e.target.closest('.chart-dropdown-container')) setDropdownOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [dropdownOpen]);

  const source = useMemo(() => 
    selectedMetric === 'value' ? (data?.yearBrandSales ?? []) : (data?.volumeByBrandYear ?? []),
    [selectedMetric, data?.yearBrandSales, data?.volumeByBrandYear]
  );

  // Brands and years (unconditional hooks)
  const brands = useMemo(() => sortBrands([...new Set(source.map(d => d.Brand))]), [source]);
  const years = useMemo(() => [...new Set(source.map(d => d.Year))].sort(), [source]);

  useEffect(() => {
    if (!loading && years.length > 0) setLastYears(years);
  }, [loading, years]);

  // Rows for recharts
  const rows = useMemo(() => {
    if (brands.length === 0 || years.length === 0) return [];
    return brands.map((brand) => {
      const row = { brand };
      years.forEach((y) => {
        const rec = source.find(r => r.Brand === brand && r.Year === y);
        row[y] = rec ? Number(selectedMetric === 'value' ? rec.SalesValue : rec.Volume) : 0;
      });
      return row;
    });
  }, [brands, years, source, selectedMetric]);

  useEffect(() => {
    if (!loading && rows.length > 0) setLastRows(rows);
  }, [loading, rows]);

  const displayYears = years.length > 0 ? years : lastYears;
  const displayRows = rows.length > 0 ? rows : lastRows;

  // Dynamic Y-axis scaling based on current filtered data
  const computedMax = useMemo(() => {
    const allValues = (displayRows || []).flatMap(r => (displayYears || []).map(y => Number(r[y]) || 0));
    const max = Math.max(0, ...allValues);
    
    // Add 10% padding above the maximum value for better visualization
    const paddedMax = max * 1.1;
    
    // Round to nearest 10M for clean tick marks
    const step = 10_000_000;
    return Math.ceil(paddedMax / step) * step || step;
  }, [displayRows, displayYears]);

  const animatedMax = useTweenedNumber(computedMax, 150, 'easeOutCubic');
  const yDomain = [0, Math.max(0, Math.round(animatedMax))];

  // Stable animation id to smoothly transition between metrics and data changes
  const animId = useMemo(() => {
    const sigRows = (displayRows || []).map(r => (displayYears || []).map(y => r[y]).join(',')).join('|');
    return `${selectedMetric}::${(displayYears || []).join('|')}::${sigRows}`;
  }, [displayRows, displayYears, selectedMetric]);

  const metricOptions = [
    { value: 'value', label: 'Value' },
    { value: 'volume', label: 'Volume' }
  ];

  const initialLoading = loading && displayRows.length === 0;
  if (initialLoading) {
    return <ChartSkeleton variant="bars-v" height={320} />;
  }
  if (!loading && displayRows.length === 0) return <div className="chart-placeholder">No data available</div>;

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <div className="chart-dropdown-container">
          <div
            className="chart-dropdown"
            onClick={() => setDropdownOpen(!dropdownOpen)}
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
                  onClick={() => { setSelectedMetric(option.value); setDropdownOpen(false); }}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedMetric(option.value);
                      setDropdownOpen(false);
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

      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={displayRows} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid stroke="#eaeaea" vertical horizontal={true} />
            <XAxis dataKey="brand" tick={{ fontSize: 12, fill: '#666' }} tickLine={false} axisLine={{ stroke: '#eee' }} />
            <YAxis tickFormatter={formatMillions} tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} domain={yDomain} />
            <Tooltip content={(props) => <CustomTooltip {...props} hoveredKey={hoveredKey} />} cursor={false} isAnimationActive={false}/>

            {(displayYears || []).map((y, i) => (
              <Bar
                key={y}
                dataKey={String(y)}
                name={String(y)}
                fill={yearColor(y, i)}
                barSize={26}
                radius={[4, 4, 0, 0]}
                isAnimationActive
                isUpdateAnimationActive
                animationId={animId}
                animationDuration={ANIM.duration}
                animationEasing={ANIM.easing}
                shape={(props) => {
                  const isActive = hoveredKey === String(y) && hoveredBrand === props?.payload?.brand;
                  return (
                    <Rectangle
                      {...props}
                      stroke={isActive ? '#fff' : 'none'}
                      strokeWidth={isActive ? 2 : 0}
                    />
                  );
                }}
                onMouseEnter={(data) => { setHoveredKey(String(y)); setHoveredBrand(data?.payload?.brand ?? null); }}
                onMouseMove={(data) => { setHoveredKey(String(y)); setHoveredBrand(data?.payload?.brand ?? null); }}
                onMouseLeave={() => { setHoveredKey(null); setHoveredBrand(null); }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Avoid overlay during filter changes; only for first load */}
      {loading && (displayRows || []).length === 0 && (
        <div className="chart-overlay">
          <ChartSkeleton variant="bars-v" height={320} />
        </div>
      )}

      <CustomLegend years={displayYears} />
    </div>
  );
};

export default YearBrandSales;

