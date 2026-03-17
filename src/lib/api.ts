import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // PHP server URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to append the pseudo-token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('srcb_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Just for standard structure
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
