// API Configuration
// For local development, update BASE_URL to your backend server's local IP
// For production, this should point to your deployed backend

const BASE_URL = __DEV__
  ? 'http://192.168.1.100:5000' // Local development IP
  : 'https://api.upskale.com'; // Production backend URL

export { BASE_URL };
