import { apiClient } from './apiClient';

/**
 * Example content sync service. 
 * In a real app, this would fetch holiday overrides or good day data from a server.
 */
export const contentSync = {
  async fetchHolidays() {
    return apiClient.request(
      'fetch_holidays',
      async (signal) => {
        // Stub implementation: 
        // In a real app, you would:
        // const response = await fetch('https://api.yourdomain.com/holidays.json', { signal });
        // return response.json();
        
        // Simulating a network request
        await new Promise(resolve => setTimeout(() => resolve(null), 1500));
        return {
          "2027": {
            "tet": "2027-02-06",
            "hung_vuong": "2027-04-16"
          }
        };
      },
      {
        retries: 2,
        timeoutMs: 5000,
      }
    );
  }
};
