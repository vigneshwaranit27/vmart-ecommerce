import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://vmart-backend-fyed.onrender.com/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vmartToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vmartToken');
      localStorage.removeItem('vmartUser');
      // Don't redirect here - let components handle it
    }
    return Promise.reject(error);
  }
);

export default api;
