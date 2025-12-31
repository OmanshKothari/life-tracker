import axios, { AxiosError, AxiosInstance } from 'axios';

// API Response types
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.data?.error) {
      // Return our API error format
      const apiError = error.response.data.error;
      return Promise.reject(new Error(apiError.message));
    }

    // Network or other errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out'));
    }

    if (!error.response) {
      return Promise.reject(new Error('Network error - please check your connection'));
    }

    return Promise.reject(error);
  }
);

export default api;
