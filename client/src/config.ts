// Frontend configuration (client/src/config.ts)
const config = {
    // Use Vite's environment variables (set in .env files)
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    
    // API endpoints
    endpoints: {
      hotels: '/hotels',
      destinations: '/destinations',
      prices: '/hotel-price'
    },
  
    // Default request options
    defaultOptions: {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' // For cookies if using authentication
    }
  };
  
  export default config;