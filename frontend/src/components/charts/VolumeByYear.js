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
import { brandColor } from '../../utils/colorUtils';
import { formatMillions, formatMillionsWithSpace } from '../../utils/formatters';
import { sortBrands } from '../../utils/sortUtils';
import { CHART_ANIMATION, AXIS_ANIMATION_DURATION } from '../../constants/animations';



const CustomTooltip = ({ active, payload, hoveredKey }) => {
  if (!active || !payload || !payload.length) return null;
  const target = (hoveredKey && payload.find(p => p.dataKey === hoveredKey)) || payload[payload.length - 1];
  return (
    <div className="chart-tooltip" style={{ background: '#111827', color: '#fff', padding: 8, borderRadius: 8 }}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{target.name || target.dataKey}</div>
      <div style={{ fontSize: 16, fontWeight: 600 }}>{formatMillions(target.value)}</div>
    </div>
  );
};

const CustomLegend = ({ items }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginTop: 16, flexWrap: 'wrap' }}>
    {items.map(({ color, label }) => (
      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-block', height: 12, width: 12, borderRadius: '9999px', background: color }} />
        <span style={{ color: '#666', fontSize: 13 }}>{label}</span>
      </div>
    ))}
  </div>
);

const VolumeByYear = ({ data, loading, viewMode }) => {
  const view = viewMode || 'brand';
  const raw = useMemo(() => {
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
  }, [view, data?.volumeByBrandYear, data?.volumeByPackTypeYear, data?.volumeByPPGYear, data?.volumeByComboYear]);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [hoveredBrand, setHoveredBrand] = useState(null);

  // Preserve last computed structures to avoid refresh/unmount
  const [lastBrands, setLastBrands] = useState([]);
  const [lastYears, setLastYears] = useState([]);
  const [lastRows, setLastRows] = useState([]);

  const dimKey = view === 'brand' ? 'Brand' : view === 'packType' ? 'PackType' : view === 'ppg' ? 'PPG' : 'Combo';
  const brands = useMemo(() => {
    const labels = [...new Set(raw.map(d => (d[dimKey] ?? [d.Brand, d.PackType, d.PPG].filter(Boolean).join(' · '))))];
    return view === 'brand' ? sortBrands(labels) : labels.sort();
  }, [raw, view, dimKey]);
  const years = useMemo(() => [...new Set(raw.map(d => d.Year))].sort(), [raw]);

  useEffect(() => {
    if (!loading && brands.length > 0) setLastBrands(brands);
  }, [loading, brands]);
  useEffect(() => {
    if (!loading && years.length > 0) setLastYears(years);
  }, [loading, years]);

  const rows = useMemo(() => {
    if (years.length === 0 || brands.length === 0) return [];
    return years.map((year) => {
      const row = { year: String(year) };
      brands.forEach((label) => {
        const rec = raw.find((d) => String(d.Year) === String(year) && ((d[dimKey] ?? [d.Brand, d.PackType, d.PPG].filter(Boolean).join(' · ')) === label));
        row[label] = rec ? Number(rec.Volume) : 0;
      });
      return row;
    });
  }, [raw, years, brands, dimKey]);

  useEffect(() => {
    if (!loading && rows.length > 0) setLastRows(rows);
  }, [loading, rows]);

  const displayBrands = brands.length > 0 ? brands : lastBrands;
  const displayYears = years.length > 0 ? years : lastYears;
  const displayRows = rows.length > 0 ? rows : lastRows;

  // Dynamic axis scaling based on current filtered data
  const computedMax = useMemo(() => {
    const totals = (displayRows || []).map((r) => (displayBrands || []).reduce((s, k) => s + (Number(r[k]) || 0), 0));
    const max = Math.max(0, ...totals);
    const paddedMax = max * 1.1;
    const step = 5_000_000;
    return Math.ceil(paddedMax / step) * step || step;
  }, [displayRows, displayBrands]);

  // Animate axis max for smooth auto-scaling
  const animatedMax = useTweenedNumber(computedMax, AXIS_ANIMATION_DURATION, 'easeOutCubic');
  const legendItems = useMemo(() => (displayBrands || []).map((b) => ({ label: b, color: brandColor(b) })), [displayBrands]);

  // Animation key tied to data snapshot
  const animId = useMemo(() => {
    const totals = (displayRows || []).map(r => (displayBrands || []).reduce((s, k) => s + (Number(r[k]) || 0), 0)).join('-');
    return `${(displayBrands || []).join('|')}::${(displayYears || []).join('|')}::${computedMax}::${totals}`;
  }, [displayBrands, displayYears, computedMax, displayRows]);

  // Force BarChart to re-evaluate stack order when brand order changes
  const brandOrderKey = useMemo(() => (displayBrands || []).join('|'), [displayBrands]);

  // Track whether we've shown data at least once; avoid overlay after initial
  const [hasShownData, setHasShownData] = useState(false);
  useEffect(() => {
    if ((displayRows || []).length > 0) setHasShownData(true);
  }, [displayRows]);
  const initialLoading = loading && displayRows.length === 0;
  if (initialLoading) {
    return <ChartSkeleton variant="bars-h" height={300} />;
  }
  if (!loading && displayRows.length === 0) return <div className="chart-placeholder">No data available</div>;
  return (
    <div className="chart-wrapper">
      <div style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 16 }}>Volume Contribution (KG)</div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart key={brandOrderKey} data={displayRows} layout="vertical" margin={{ top: 10, right: 24, bottom: 10, left: 6 }} barCategoryGap={18}>
            {/* Keep only horizontal dotted grid lines (subtle) */}
            <CartesianGrid horizontal={true} vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />

            {/* X and Y axes with solid light grey lines */}
            <XAxis
              type="number"
              tickFormatter={formatMillionsWithSpace}
              domain={[0, Math.max(0, Math.round(animatedMax))]}
              tickLine={false}
              axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
            />
            <YAxis
              type="category"
              dataKey="year"
              tickLine={false}
              axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
              tickMargin={2}
            />
            <Tooltip
              content={(props) => (
                <CustomTooltip {...props} hoveredKey={hoveredKey} />
              )}
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              isAnimationActive={false}
            />

            {(displayBrands || []).map((b, i) => (
              <Bar
                key={b}
                dataKey={b}
                name={b}
                stackId="a"
                fill={brandColor(b)}
                barSize={26}
                isAnimationActive
                isUpdateAnimationActive
                animationId={animId}
                animationDuration={CHART_ANIMATION.duration}
                animationEasing={CHART_ANIMATION.easing}
                radius={i === 0 ? [8, 0, 0, 8] : i === (displayBrands.length - 1) ? [0, 8, 8, 0] : 0}
                shape={(props) => {
                  const isActive = hoveredKey === b && hoveredBrand === props?.payload?.year;
                  return (
                    <Rectangle
                      {...props}
                      stroke={isActive ? '#000' : 'none'}
                      strokeWidth={isActive ? 2 : 0}
                    />
                  );
                }}
                onMouseEnter={(data) => { setHoveredKey(b); setHoveredBrand(data?.payload?.year ?? null); }}
                onMouseMove={(data) => { setHoveredKey(b); setHoveredBrand(data?.payload?.year ?? null); }}
                onMouseLeave={() => { setHoveredKey(null); setHoveredBrand(null); }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {loading && !hasShownData && (
        <div className="chart-overlay">
          <ChartSkeleton variant="bars-h" height={300} />
        </div>
      )}
      <CustomLegend items={legendItems} />
    </div>
  );
};

export default VolumeByYear;
