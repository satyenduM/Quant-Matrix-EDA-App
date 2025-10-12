/**
 * Formatting utilities for consistent number and value display
 */

// Convert value to millions
export const toMillions = (value) => value / 1_000_000;

// Format value as millions with M suffix (e.g., "5.2M")
export const formatMillions = (value) => {
  if (value == null || isNaN(value)) return '';
  const millions = toMillions(value);
  const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
  return `${formatted}M`;
};

// Format value as millions with space before M (e.g., "5.2 M")
export const formatMillionsWithSpace = (value) => {
  if (value == null || isNaN(value)) return '';
  const millions = toMillions(value);
  const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
  return `${formatted} M`;
};

// Format currency values
export const formatCurrency = (value) => {
  if (value >= 1e9) {
    return `€${(value / 1e9).toFixed(1)}B`;
  } else if (value >= 1e6) {
    return `€${(value / 1e6).toFixed(1)}M`;
  } else if (value >= 1e3) {
    return `€${(value / 1e3).toFixed(1)}K`;
  }
  return `€${value.toFixed(0)}`;
};

// Format volume values
export const formatVolume = (value) => {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

// Format percentage values with sign
export const formatPercentage = (value) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};
