import React from 'react';
import './Dashboard.css';
import KPIHeader from './KPIHeader';
import SalesByYear from './charts/SalesByYear';
import VolumeByYear from './charts/VolumeByYear';
import YearBrandSales from './charts/YearBrandSales';
import MonthlyTrend from './charts/MonthlyTrend';
import MarketShare from './charts/MarketShare';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from 'recharts';
import { brandColor } from '../utils/colorUtils';

const Dashboard = ({ data, loading, viewMode }) => {
  const [kpiTip, setKpiTip] = React.useState({ show: false, x: 0, y: 0, row: '', col: '', value: null });
  if (!loading && !data) {
    return (
      <div className="dashboard-empty">
        <p>No data available. Please adjust your filters.</p>
      </div>
    );
  }

  const MsTrendTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const entries = payload
      .map(p => ({ name: p.name, value: Number(p.value) || 0 }))
      .sort((a, b) => b.value - a.value);
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-date">{label}</div>
        <div style={{ display: 'grid', gap: 4 }}>
          {entries.map(e => (
            <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '9999px', background: brandColor(e.name), display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: '#ddd' }}>{e.name}</span>
              <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{e.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (viewMode === 'correlation') {
    const kpis = ['SalesValue', 'Volume', 'ASP'];
    const corrMap = {};
    (data?.kpiCorrelation || []).forEach(e => { corrMap[`${e.row}|${e.col}`] = e.value; });
    const heatColor = (v) => {
      const t = Math.max(0, Math.min(1, (Number(v || 0) + 1) / 2));
      const neg = [252, 165, 165]; // #fca5a5 (red-300)
      const mid = [229, 231, 235]; // #e5e7eb (gray-200)
      const pos = [134, 239, 172]; // #86efac (green-300)
      const mix = (a, b, w) => [
        Math.round(a[0] + (b[0] - a[0]) * w),
        Math.round(a[1] + (b[1] - a[1]) * w),
        Math.round(a[2] + (b[2] - a[2]) * w),
      ];
      const [r, g, b] = t < 0.5 ? mix(neg, mid, t / 0.5) : mix(mid, pos, (t - 0.5) / 0.5);
      return `rgb(${r}, ${g}, ${b})`;
    };

    const mbs = data?.monthlyBrandSales || [];
    const months = Array.from(new Set(mbs.map(r => `${String(r.Year)}-${String(r.Month).padStart(2, '0')}`))).sort();
    const totalsByMonth = months.reduce((acc, ym) => { acc[ym] = 0; return acc; }, {});
    mbs.forEach(r => {
      const ym = `${String(r.Year)}-${String(r.Month).padStart(2, '0')}`;
      totalsByMonth[ym] = (totalsByMonth[ym] || 0) + (Number(r.SalesValue) || 0);
    });
    const brandTotals = {};
    mbs.forEach(r => { brandTotals[r.Brand] = (brandTotals[r.Brand] || 0) + (Number(r.SalesValue) || 0); });
    const topBrands = Object.entries(brandTotals).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([b])=>b);
    const msTrendRows = months.map(ym => {
      const row = { label: ym };
      topBrands.forEach(b => {
        const sales = mbs.filter(r => r.Brand === b && `${String(r.Year)}-${String(r.Month).padStart(2, '0')}` === ym).reduce((s, r) => s + (Number(r.SalesValue) || 0), 0);
        const total = totalsByMonth[ym] || 0;
        row[b] = total > 0 ? (sales / total) * 100 : 0;
      });
      return row;
    });

    return (
      <div className="dashboard">
        <KPIHeader data={data} loading={loading} />

        <div className="dashboard-row">
          <div className="chart-container half">
            <div className="chart-wrapper">
              <div style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 24 }}>KPI Correlation (Sales, Volume, ASP)</div>
              {(!data || !data.kpiCorrelation || data.kpiCorrelation.length === 0) ? (
                <div className="chart-placeholder">No correlation data available</div>
              ) : (
                <div style={{ position: 'relative', minHeight: 420 }}>
                  <div
                    style={{ display: 'grid', gridTemplateColumns: `140px repeat(${kpis.length}, 1fr)`, gap: 10 }}
                    onMouseLeave={() => setKpiTip(prev => ({ ...prev, show: false }))}
                  >
                    <div />
                    {kpis.map(h => (
                      <div key={`h-${h}`} style={{ textAlign: 'center', fontSize: 14, color: '#555' }}>{h}</div>
                    ))}
                    {kpis.map(r => (
                      <React.Fragment key={`r-${r}`}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#333', display: 'flex', alignItems: 'center', height: 72 }}>{r}</div>
                        {kpis.map(c => {
                          const v = corrMap[`${r}|${c}`];
                          const display = typeof v === 'number' ? v.toFixed(2) : '—';
                          const textColor = '#111';
                          return (
                            <div
                              key={`c-${r}-${c}`}
                              style={{ background: heatColor(v), height: 72, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontVariantNumeric: 'tabular-nums', color: textColor, fontWeight: 700, fontSize: 20, cursor: 'default', border: '1px solid #e5e7eb' }}
                              onMouseEnter={(e) => setKpiTip({ show: true, x: e.clientX, y: e.clientY, row: r, col: c, value: v })}
                              onMouseMove={(e) => setKpiTip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))}
                            >
                              {display}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 15, color: '#666' }}>-1</span>
                      <div style={{ flex: 1, height: 10, borderRadius: 9999, background: 'linear-gradient(90deg, #fca5a5 0%, #e5e7eb 50%, #86efac 100%)' }} />
                      <span style={{ fontSize: 15, color: '#666' }}>+1</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#666', lineHeight: 1.6 }}>
                    <div>How to read: Each cell is the Pearson correlation between the KPI in that row and the KPI in that column for the current filters.</div>
                    <div>Green = positive, red = negative; 0 means no linear relationship; ±1 means strongest relationship.</div>
                    <div>The matrix is symmetric and the diagonal is always 1.00.</div>
                  </div>
                  {kpiTip.show && (
                    <div
                      className="chart-tooltip"
                      style={{ position: 'fixed', left: kpiTip.x + 12, top: kpiTip.y + 12, background: '#111827', color: '#fff', padding: 8, borderRadius: 8, pointerEvents: 'none' }}
                    >
                      <div style={{ fontSize: 12, opacity: 0.8 }}>{kpiTip.row} ↔ {kpiTip.col}</div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{typeof kpiTip.value === 'number' ? kpiTip.value.toFixed(2) : '—'}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="chart-container half">
            <MonthlyTrend data={data} loading={loading} />
          </div>
        </div>

        <div className="dashboard-row">
          <div className="chart-container full">
            <div className="chart-wrapper">
              <div style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 16 }}>Market Share Over Time (Top Brands)</div>
              {msTrendRows.length === 0 ? (
                <div className="chart-placeholder">No data available</div>
              ) : (
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <LineChart data={msTrendRows} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                      <CartesianGrid stroke="#eaeaea" vertical horizontal={true} />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#666' }} tickLine={false} axisLine={{ stroke: '#eee' }} />
                      <YAxis tickFormatter={(v)=>`${Number(v||0).toFixed(0)}%`} tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <RTooltip isAnimationActive={false} content={(props) => <MsTrendTooltip {...props} />} />
                      {topBrands.map(b => (
                        <Line key={b} type="monotone" dataKey={b} stroke={brandColor(b)} strokeWidth={2} dot={false} isAnimationActive />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <KPIHeader data={data} loading={loading} />
      
      <div className="dashboard-row">
        <div className="chart-container half">
          <SalesByYear data={data} loading={loading} viewMode={viewMode} />
        </div>
        <div className="chart-container half">
          <VolumeByYear data={data} loading={loading} viewMode={viewMode} />
        </div>
      </div>
      
      <div className="dashboard-row">
        <div className="chart-container half">
          <YearBrandSales data={data} loading={loading} viewMode={viewMode} />
        </div>
        <div className="chart-container half">
          <MonthlyTrend data={data} loading={loading} />
        </div>
      </div>
      
      <div className="dashboard-row">
        <div className="chart-container full">
          <MarketShare data={data} loading={loading} viewMode={viewMode} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

