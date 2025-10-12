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
import { yearColor } from '../../utils/colorUtils';
import { formatMillions } from '../../utils/formatters';
import { sortBrands } from '../../utils/sortUtils';
import { CHART_ANIMATION } from '../../constants/animations';


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

const YearBrandSales = ({ data, loading, viewMode }) => {
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

  const view = viewMode || 'brand';
  const source = useMemo(() => {
    if (selectedMetric === 'value') {
      switch (view) {
        case 'packType':
          return data?.yearPackTypeSales ?? [];
        case 'ppg':
          return data?.yearPPGSales ?? [];
        case 'brand-x-pack':
          return data?.yearComboSales ?? [];
        default:
          return data?.yearBrandSales ?? [];
      }
    } else {
      switch (view) {
        case 'packType':
          return data?.volumeByPackTypeYear ?? [];
        case 'ppg':
          return data?.volumeByPPGYear ?? [];
        case 'brand-x-pack':
          return data?.volumeByComboYear ?? [];
        default:
          return data?.volumeByBrandYear ?? [];
      }
    }
  }, [selectedMetric, view, data?.yearBrandSales, data?.yearPackTypeSales, data?.yearPPGSales, data?.yearComboSales, data?.volumeByBrandYear, data?.volumeByPackTypeYear, data?.volumeByPPGYear, data?.volumeByComboYear]);

  // Brands and years (unconditional hooks)
  const dimKey = view === 'brand' ? 'Brand' : view === 'packType' ? 'PackType' : view === 'ppg' ? 'PPG' : 'Combo';
  const brands = useMemo(() => {
    const labels = [...new Set(source.map(d => (d[dimKey] ?? [d.Brand, d.PackType, d.PPG].filter(Boolean).join(' · '))))];
    return view === 'brand' ? sortBrands(labels) : labels.sort();
  }, [source, view, dimKey]);
  const years = useMemo(() => [...new Set(source.map(d => d.Year))].sort(), [source]);

  useEffect(() => {
    if (!loading && years.length > 0) setLastYears(years);
  }, [loading, years]);

  // Rows for recharts
  const rows = useMemo(() => {
    if (brands.length === 0 || years.length === 0) return [];
    return brands.map((label) => {
      const row = { label };
      years.forEach((y) => {
        const rec = source.find(r => (r[dimKey] ?? [r.Brand, r.PackType, r.PPG].filter(Boolean).join(' · ')) === label && r.Year === y);
        row[y] = rec ? Number(selectedMetric === 'value' ? rec.SalesValue : rec.Volume) : 0;
      });
      return row;
    });
  }, [brands, years, source, selectedMetric, dimKey]);

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
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#666' }} tickLine={false} axisLine={{ stroke: '#eee' }} />
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
                animationDuration={CHART_ANIMATION.duration}
                animationEasing={CHART_ANIMATION.easing}
                shape={(props) => {
                  const isActive = hoveredKey === String(y) && hoveredBrand === props?.payload?.label;
                  return (
                    <Rectangle
                      {...props}
                      stroke={isActive ? '#000' : 'none'}
                      strokeWidth={isActive ? 2 : 0}
                    />
                  );
                }}
                onMouseEnter={(data) => { setHoveredKey(String(y)); setHoveredBrand(data?.payload?.label ?? null); }}
                onMouseMove={(data) => { setHoveredKey(String(y)); setHoveredBrand(data?.payload?.label ?? null); }}
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

