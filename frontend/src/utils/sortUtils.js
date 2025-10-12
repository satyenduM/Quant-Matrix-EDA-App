/**
 * Sorting utilities for consistent data ordering
 */

// Sort brands: numeric order for "Brand N" pattern, alphabetical otherwise
export const sortBrands = (brands) => {
  return [...brands].sort((a, b) => {
    const numA = /brand\s*(\d+)/i.exec(a);
    const numB = /brand\s*(\d+)/i.exec(b);
    
    if (numA && numB) {
      return parseInt(numA[1], 10) - parseInt(numB[1], 10);
    }
    
    return a.localeCompare(b);
  });
};
