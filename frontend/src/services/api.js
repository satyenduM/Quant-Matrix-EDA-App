import axios from 'axios';

/**
 * API Client with automatic fallback handling
 * Tries primary URL first, then falls back to secondary URL
 */

const PRIMARY_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const FALLBACK_API_URL = process.env.REACT_APP_API_URL_FALLBACK || 'https://quant-matrix-eda-app-production.up.railway.app';

class ApiClient {
  constructor() {
    this.primaryUrl = PRIMARY_API_URL;
    this.fallbackUrl = FALLBACK_API_URL;
  }

  /**
   * Make API request with automatic fallback
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {string} endpoint - API endpoint path
   * @param {object} data - Request data (for POST, PUT, etc.)
   * @returns {Promise} Response data
   */
  async request(method, endpoint, data = null) {
    const config = {
      method,
      url: `${this.primaryUrl}${endpoint}`,
      ...(data && { data })
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (primaryError) {
      // Log error only in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Primary API (${this.primaryUrl}) failed, trying fallback...`);
      }

      // Try fallback URL
      try {
        config.url = `${this.fallbackUrl}${endpoint}`;
        const response = await axios(config);
        return response.data;
      } catch (fallbackError) {
        // Log error only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Both primary and fallback APIs failed:', {
            primary: primaryError.message,
            fallback: fallbackError.message
          });
        }
        throw fallbackError;
      }
    }
  }

  /**
   * GET request
   */
  async get(endpoint) {
    return this.request('GET', endpoint);
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Specific API endpoints
export const edaApi = {
  getFilterOptions: () => apiClient.get('/api/filters/'),
  getFilteredData: (filters) => apiClient.post('/api/data/', { filters }),
  healthCheck: () => apiClient.get('/api/health/')
};
