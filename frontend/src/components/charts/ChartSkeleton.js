import React from 'react';

const ChartSkeleton = ({ variant = 'bars-h', height = 300 }) => {
  const commonStyle = {
    width: '100%',
    height: `${height}px`,
  };

  if (variant === 'bars-h') {
    const rows = [0.72, 0.86, 0.62, 0.78];
    return (
      <div className="chart-skeleton" style={commonStyle}>
        <div className="skeleton-grid" />
        <div className="skeleton-bars-h">
          {rows.map((w, i) => (
            <div key={i} className="skeleton-bar-h skeleton-shimmer" style={{ width: `${Math.round(w * 100)}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'bars-v') {
    const cols = [0.45, 0.7, 0.32, 0.56];
    return (
      <div className="chart-skeleton" style={commonStyle}>
        <div className="skeleton-grid" />
        <div className="skeleton-bars-v">
          {cols.map((h, i) => (
            <div key={i} className="skeleton-bar-v skeleton-shimmer" style={{ height: `${Math.round(h * 100)}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'donut') {
    return (
      <div className="chart-skeleton" style={commonStyle}>
        <div className="skeleton-donut-wrap">
          <div className="skeleton-donut skeleton-shimmer" />
        </div>
      </div>
    );
  }

  // line
  return (
    <div className="chart-skeleton" style={commonStyle}>
      <div className="skeleton-grid" />
      <div className="skeleton-line skeleton-shimmer" />
    </div>
  );
};

export default ChartSkeleton;
