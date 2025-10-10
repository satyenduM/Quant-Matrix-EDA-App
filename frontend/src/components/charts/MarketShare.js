import React, { useMemo, useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import './ChartStyles.css';
import ChartSkeleton from './ChartSkeleton';

// Helpers consistent with other charts
const toMillions = (v) => v / 1_000_000;
const formatMillionsNoSpace = (v) => `${toMillions(v) % 1 === 0 ? toMillions(v).toFixed(0) : toMillions(v).toFixed(1)}M`;

// Stable brand colors used across charts
const brandColor = (brand) => {
  const map = {
    'Brand 1': '#fbbf24', // amber
    'Brand 2': '#3b82f6', // blue
    'Brand 3': '#22c55e', // green 500
    'Brand 4': '#c6f6d5', // green 200
    'Brand 5': '#16a34a', // green 600
    'Brand 6': '#86efac', // green 300
  };
  if (map[brand]) return map[brand];
  const fallback = ['#1d4ed8', '#9333ea', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#84cc16', '#f472b6'];
  let h = 0; for (let i = 0; i < brand.length; i++) h = (h * 31 + brand.charCodeAt(i)) >>> 0;
  return fallback[h % fallback.length];
};

const CustomTooltip = ({ active, payload, label, viewType, total }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  const brand = p.name;
  const value = p.value || 0;
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  const valueStr = viewType === 'sales' ? formatMillionsNoSpace(value) : `${formatMillionsNoSpace(value)} KG`;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-date">{brand}</div>
      <div className="chart-tooltip-value">{valueStr} · {pct}%</div>
    </div>
  );
};

const CustomLegend = ({ items }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
    {items.map((it) => (
      <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: '9999px', display: 'inline-block', background: it.color }} />
        <span style={{ color: '#666', fontSize: 13 }}>{it.label}</span>
      </div>
    ))}
  </div>
);

const MarketShare = ({ data, loading }) => {
  const [viewType, setViewType] = useState('sales'); // 'sales' or 'volume'
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => { if (!e.target.closest('.chart-dropdown-container')) setDropdownOpen(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [dropdownOpen]);

  const source = data?.marketShareSales ?? [];
  const rows = useMemo(() => {
    return source.map(d => ({ label: d.Brand, value: viewType === 'sales' ? Number(d.SalesValue) : Number(d.Volume) }));
  }, [source, viewType]);

  const total = useMemo(() => rows.reduce((s, r) => s + (r.value || 0), 0), [rows]);
  const legendItems = useMemo(() => rows.map(r => ({ label: r.label, color: brandColor(r.label) })), [rows]);

  if (loading || (!data && rows.length === 0)) {
    return <ChartSkeleton variant="donut" height={350} />;
  }
  if (rows.length === 0) {
    return <div className="chart-placeholder">No data available</div>;
  }

  const metricOptions = [
    { value: 'sales', label: 'Sales Value' },
    { value: 'volume', label: 'Volume' }
  ];

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
            <span>{metricOptions.find(m => m.value === viewType)?.label}</span>
            <span className="chart-dropdown-caret">▼</span>
          </div>
          {dropdownOpen && (
            <div className="chart-dropdown-menu">
              {metricOptions.map(option => (
                <div
                  key={option.value}
                  className={`chart-dropdown-item ${viewType === option.value ? 'active' : ''}`}
                  onClick={() => { setViewType(option.value); setDropdownOpen(false); }}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setViewType(option.value);
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

      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <PieChart>
            <Tooltip content={(props) => <CustomTooltip {...props} viewType={viewType} total={total} />} isAnimationActive={false} />
            <Pie
              data={rows}
              dataKey="value"
              nameKey="label"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={2}
              onMouseEnter={(_, idx) => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {rows.map((entry, index) => (
                <Cell
                  key={`slice-${entry.label}`}
                  fill={brandColor(entry.label)}
                  stroke="#fff"
                  strokeWidth={activeIndex === index ? 3 : 2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <CustomLegend items={legendItems} />
    </div>
  );
};

export default MarketShare;

