import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import './ChartStyles.css';

// Helpers (same style as SalesByYear)
const toMillions = (v) => v / 1_000_000;
const xFormat = (v) => `${toMillions(v) % 1 === 0 ? toMillions(v).toFixed(0) : toMillions(v).toFixed(1)} M`;
const xFormatCompact = (v) => `${toMillions(v) % 1 === 0 ? toMillions(v).toFixed(0) : toMillions(v).toFixed(1)}M`;

const sortBrands = (arr) => {
  return [...arr].sort((a, b) => {
    const na = /brand\s*(\d+)/i.exec(a);
    const nb = /brand\s*(\d+)/i.exec(b);
    if (na && nb) return parseInt(na[1], 10) - parseInt(nb[1], 10);
    return a.localeCompare(b);
  });
};

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
  // Stable fallback using a simple hash of the brand name
  const fallbackPalette = ['#1d4ed8', '#9333ea', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#84cc16', '#f472b6'];
  let h = 0;
  for (let i = 0; i < brand.length; i++) h = (h * 31 + brand.charCodeAt(i)) >>> 0;
  return fallbackPalette[h % fallbackPalette.length];
};

const makeRange = (row, dataKey, order) => {
  const idx = order.indexOf(dataKey);
  if (idx < 0) return null;
  const start = order.slice(0, idx).reduce((s, k) => s + (Number(row[k]) || 0), 0);
  const end = start + (Number(row[dataKey]) || 0);
  return { start, end };
};

const CustomTooltip = ({ active, payload, hoveredKey }) => {
  if (!active || !payload || !payload.length) return null;
  const target = (hoveredKey && payload.find(p => p.dataKey === hoveredKey)) || payload[payload.length - 1];
  const stackOrder = (payload || []).map(p => p.dataKey);
  const range = makeRange(target.payload, target.dataKey, stackOrder);
  return (
    <div className="chart-tooltip" style={{ background: '#111827', color: '#fff', padding: 8, borderRadius: 8 }}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{target.name || target.dataKey}</div>
      {range ? (
        <div style={{ fontSize: 16, fontWeight: 600 }}>{`${xFormatCompact(range.start)} - ${xFormatCompact(range.end)}`}</div>
      ) : (
        <div style={{ fontSize: 16, fontWeight: 600 }}>{xFormatCompact(target.value)}</div>
      )}
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

const VolumeByYear = ({ data }) => {
  const raw = data?.volumeByBrandYear ?? [];
  const [hoveredKey, setHoveredKey] = useState(null);

  const brands = useMemo(() => sortBrands([...new Set(raw.map(d => d.Brand))]), [raw]);
  const years = useMemo(() => [...new Set(raw.map(d => d.Year))].sort(), [raw]);

  const rows = useMemo(() => {
    if (years.length === 0 || brands.length === 0) return [];
    return years.map((year) => {
      const row = { year: String(year) };
      brands.forEach((brand) => {
        const rec = raw.find((d) => d.Brand === brand && d.Year === year);
        row[brand] = rec ? Number(rec.Volume) : 0;
      });
      return row;
    });
  }, [raw, years, brands]);

  const domainMax = useMemo(() => {
    const totals = rows.map((r) => brands.reduce((s, k) => s + (Number(r[k]) || 0), 0));
    const max = Math.max(0, ...totals);
    const step = 5_000_000;
    return Math.ceil(max / step) * step || step;
  }, [rows, brands]);

  const legendItems = useMemo(() => brands.map((b) => ({ label: b, color: brandColor(b) })), [brands]);

  if (rows.length === 0) {
    return <div className="chart-placeholder">No data available</div>;
  }

  return (
    <div className="chart-wrapper">
      <div style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 16 }}>Volume Contribution (KG)</div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 10, right: 24, bottom: 10, left: 60 }} barCategoryGap={18}>
            <CartesianGrid horizontal vertical={false} strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={xFormat} domain={[0, domainMax]} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="year" tickLine={false} axisLine={false} width={50} />
            <Tooltip
              content={(props) => (
                <CustomTooltip {...props} hoveredKey={hoveredKey} />
              )}
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            />

            {brands.map((b, i) => (
              <Bar
                key={b}
                dataKey={b}
                name={b}
                stackId="a"
                fill={brandColor(b)}
                barSize={26}
                radius={i === 0 ? [8, 0, 0, 8] : i === brands.length - 1 ? [0, 8, 8, 0] : 0}
                onMouseEnter={() => setHoveredKey(b)}
                onMouseMove={() => setHoveredKey(b)}
                onMouseLeave={() => setHoveredKey(null)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <CustomLegend items={legendItems} />
    </div>
  );
};

export default VolumeByYear;

