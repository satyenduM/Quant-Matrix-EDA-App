/**
 * Stable color mapping for brands and years across all charts
 */

// Brand color mapping with consistent colors across the application
export const brandColor = (brand) => {
  const brandColorMap = {
    'Brand 1': '#fbbf24', // amber
    'Brand 2': '#3b82f6', // blue
    'Brand 3': '#22c55e', // green 500
    'Brand 4': '#FFA500', // orange
    'Brand 5': '#1ABC9C', // teal
    'Brand 6': '#9B59B6', // purple
  };
  
  if (brandColorMap[brand]) return brandColorMap[brand];
  
  // Hash-based fallback to keep colors stable for unknown brands
  const fallbackPalette = [
    '#1d4ed8', '#9333ea', '#ef4444', '#f59e0b', 
    '#10b981', '#06b6d4', '#84cc16', '#f472b6'
  ];
  
  let hash = 0;
  for (let i = 0; i < brand.length; i++) {
    hash = (hash * 31 + brand.charCodeAt(i)) >>> 0;
  }
  
  return fallbackPalette[hash % fallbackPalette.length];
};

// Year color mapping for consistent year-based visualizations
export const yearColor = (year, index) => {
  const yearColorMap = {
    2021: '#3b82f6', // blue
    2022: '#22c55e', // green
    2023: '#fbbf24', // amber
    2024: '#a7f3d0', // light green
  };
  
  if (yearColorMap[year]) return yearColorMap[year];
  
  const palette = ['#3b82f6', '#22c55e', '#fbbf24', '#a7f3d0', '#9333ea', '#06b6d4'];
  return palette[index % palette.length];
};
