import { useState, useEffect } from 'react';

/**
 * Custom hook to preserve last valid data while loading
 * Prevents chart flickering during data updates
 * @param {any} data - Current data
 * @param {boolean} loading - Loading state
 * @returns {any} Current data if available, otherwise last valid data
 */
export const usePreserveLastData = (data, loading) => {
  const [lastData, setLastData] = useState(data);

  useEffect(() => {
    if (!loading && data != null && (Array.isArray(data) ? data.length > 0 : true)) {
      setLastData(data);
    }
  }, [loading, data]);

  return data != null && (Array.isArray(data) ? data.length > 0 : true) ? data : lastData;
};
