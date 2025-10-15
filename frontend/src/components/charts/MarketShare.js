import React, { useMemo, useState, useEffect } from 'react';
import { usePreserveLastData } from '../../hooks/usePreserveLastData';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import './ChartStyles.css';
import ChartSkeleton from './ChartSkeleton';
import { brandColor } from '../../utils/colorUtils';
import { formatMillions } from '../../utils/formatters';
import { CHART_ANIMATION } from '../../constants/animations';


const CustomTooltip = ({ active, payload, label, viewType, total }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  const brand = p.name;
  const value = p.value || 0;
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  const valueStr = viewType === 'sales' ? formatMillions(value) : `${formatMillions(value)} KG`;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-date">{brand}</div>
      <div className="chart-tooltip-value">{valueStr} · {pct}%</div>
    </div>
  );
};

const CustomLegend = ({ items }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
    {items.map((it) => (
      <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 12, height: 12, borderRadius: '9999px', display: 'inline-block', background: it.color }} />
        <span style={{ color: '#666', fontSize: 14 }}>{it.label}</span>
      </div>
    ))}
  </div>
);

const MarketShare = ({ data, loading, viewMode }) => {
  const [viewType, setViewType] = useState('sales'); // 'sales' or 'volume'
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => { if (!e.target.closest('.chart-dropdown-container')) setDropdownOpen(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [dropdownOpen]);

  const view = viewMode || 'brand';
  const source = useMemo(() => {
    switch (view) {
      case 'packType':
        return data?.marketSharePackType ?? [];
      case 'ppg':
        return data?.marketSharePPG ?? [];
      case 'brand-x-pack':
        return data?.marketShareCombo ?? [];
      default:
        return data?.marketShareSales ?? [];
    }
  }, [view, data?.marketShareSales, data?.marketSharePackType, data?.marketSharePPG, data?.marketShareCombo]);
  const rows = useMemo(() => {
    const labelKey = view === 'brand' ? 'Brand' : view === 'packType' ? 'PackType' : view === 'ppg' ? 'PPG' : 'Combo';
    const items = source.map(d => ({ label: d[labelKey] ?? d.Combo ?? d.Brand ?? 'N/A', value: viewType === 'sales' ? Number(d.SalesValue) : Number(d.Volume) }));

    // For combo, limit to top N and group rest as 'Others' to avoid clutter
    if (view === 'brand-x-pack') {
      const sorted = [...items].sort((a, b) => b.value - a.value);
      const TOP_N = 12;
      const top = sorted.slice(0, TOP_N);
      const othersSum = sorted.slice(TOP_N).reduce((s, r) => s + (r.value || 0), 0);
      return othersSum > 0 ? [...top, { label: 'Others', value: othersSum }] : top;
    }

    // Otherwise, sort nicely: numeric brand order else alpha
    return items.sort((a, b) => {
      if (view === 'brand') {
        const na = /brand\s*(\d+)/i.exec(a.label);
        const nb = /brand\s*(\d+)/i.exec(b.label);
        if (na && nb) return parseInt(na[1], 10) - parseInt(nb[1], 10);
      }
      return a.label.localeCompare(b.label);
    });
  }, [source, view, viewType]);

  // Preserve last non-empty rows to avoid unmounting on loading
  const displayRows = usePreserveLastData(rows, loading);

  const total = useMemo(() => (displayRows || []).reduce((s, r) => s + (r.value || 0), 0), [displayRows]);
  const legendItems = useMemo(() => (displayRows || []).map(r => ({ label: r.label, color: brandColor(r.label) })), [displayRows]);

  // Track whether we've shown data at least once
  const [hasShownData, setHasShownData] = useState(false);
  useEffect(() => {
    if ((displayRows || []).length > 0) setHasShownData(true);
  }, [displayRows]);

  const initialLoading = loading && (displayRows.length === 0);
  if (initialLoading) {
    return <ChartSkeleton variant="donut" height={350} />;
  }
  if (!loading && displayRows.length === 0) {
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ flex: 1, height: 400 }}>
          <ResponsiveContainer>
            <PieChart>
              <Tooltip content={(props) => <CustomTooltip {...props} viewType={viewType} total={total} />} isAnimationActive={false} />
              <Pie
                data={displayRows}
                dataKey="value"
                nameKey="label"
                innerRadius={100}
                outerRadius={150}
                paddingAngle={2}
                isAnimationActive
                animationId={`${viewMode}-${viewType}`}
                animationDuration={CHART_ANIMATION.duration}
                animationEasing={CHART_ANIMATION.easing}
                onMouseEnter={(_, idx) => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {displayRows.map((entry, index) => (
                  <Cell
                    key={`slice-${entry.label}`}
                    fill={brandColor(entry.label)}
                    stroke={activeIndex === index ? '#000' : '#fff'}
                    strokeWidth={activeIndex === index ? 3 : 2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ flex: 0, minWidth: 150 }}>
          <CustomLegend items={legendItems} />
        </div>
      </div>

      {/* Avoid overlay during filter changes; only use for first load */}
      {loading && !hasShownData && (
        <div className="chart-overlay">
          <ChartSkeleton variant="donut" height={400} />
        </div>
      )}
    </div>
  );
};

export default MarketShare;

