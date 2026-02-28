import apiClient from './axios';
import { User, AuthResponse, LoginData, RegisterData, RefreshTokenResponse } from '@/types/auth';

export const authService = {
  // Register a new user
  async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      email: data.email,
      username: data.username,
      password: data.password,
      confirmPassword: data.confirmPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Registration failed');
    }

    return response.data.user;
  },

  // Login user
  async login(credentials: LoginData): Promise<User> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
      rememberMe: credentials.rememberMe || false,
    });

    if (!response.data.success) {
      throw new Error('Invalid email or password');
    }

    return response.data.user;
  },

  // Get current authenticated user
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<AuthResponse>('/auth/me');

    if (!response.data.success) {
      throw new Error('Failed to fetch user');
    }

    return response.data.user;
  },

  // Refresh access token
  async refreshToken(): Promise<string> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {});

    if (!response.data.success) {
      throw new Error('Token refresh failed');
    }

    return response.data.accessToken;
  },

  // Verify email
  async verifyEmail(token: string): Promise<User> {
    const response = await apiClient.post<AuthResponse>('/auth/verify-email', {
      token,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Email verification failed');
    }

    return response.data.user;
  },

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    const response = await apiClient.post('/auth/forgot-password', {
      email,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send reset link');
    }
  },

  // Reset password
  async resetPassword(token: string, password: string, confirmPassword: string): Promise<User> {
    const response = await apiClient.post<AuthResponse>('/auth/reset-password', {
      token,
      password,
      confirmPassword,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Password reset failed');
    }

    return response.data.user;
  },

  // Logout user
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout', {});
  },
};
