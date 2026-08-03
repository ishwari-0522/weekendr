import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (Automatic authentication token injection)
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (Centralized error formatting)
apiClient.interceptors.response.use(
  (response) => {
    // If response matches our consistent JSON envelope
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return {
      success: true,
      message: 'Success',
      data: response.data,
      errors: []
    };
  },
  (error) => {
    let message = 'An unexpected network error occurred. Please try again.';
    let errors = [];

    if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. The server took too long to respond.';
    } else if (error.response) {
      // Server returned error status code
      const responseData = error.response.data;
      if (responseData && responseData.message) {
        message = responseData.message;
      } else {
        message = `Server responded with status ${error.response.status}`;
      }
      errors = responseData.errors || [];
    } else if (error.request) {
      // Request made but no response received
      message = 'Failed to connect to the server. Please check your connection.';
    }

    return Promise.resolve({
      success: false,
      message,
      data: null,
      errors
    });
  }
);

export default apiClient;
