import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Standard approach: fetch token dynamicly on every request
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized (Token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      localStorage.removeItem('token');
      // If we are not already on the login page, redirect
      if (!window.location.pathname.includes('/login')) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden (Admin only)
    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    }
    
    // Handle 422 Validation Errors
    if (error.response?.status === 422) {
      const detail = error.response.data?.detail || 'Validation error';
      toast.error(typeof detail === 'string' ? detail : 'Invalid form data');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
