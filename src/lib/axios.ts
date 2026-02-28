import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { RefreshTokenResponse } from '@/types/auth';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
const MAX_RETRIES = 3;
let retryCount = 0;

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue: Array<{
  onSuccess: (token: string) => void;
  onFailed: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.onFailed(error);
    } else if (token) {
      prom.onSuccess(token);
    }
  });

  failedQueue = [];
};

// Response interceptor with automatic token refresh
apiClient.interceptors.response.use(
  (response) => {
    retryCount = 0; // Reset retry count on successful response
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((onSuccess, onFailed) => {
          failedQueue.push({
            onSuccess: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              onSuccess(apiClient(originalRequest));
            },
            onFailed: (err: AxiosError) => {
              onFailed(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        const { accessToken } = response.data;
        retryCount = 0;
        isRefreshing = false;

        processQueue(null, accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError as AxiosError, null);

        // Refresh failed - clear auth and redirect to login
        if (typeof window !== 'undefined') {
          // Clear any stored user data
          localStorage.removeItem('user');
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle 429 Too Many Requests - Rate limiting
    if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
      retryCount++;
      const delayMs = Math.pow(2, retryCount) * 1000; // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
