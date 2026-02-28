export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isEmailVerified: boolean;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  message?: string;
  accessToken?: string;
}

export interface ErrorResponse {
  error: string;
  errors?: Record<string, string[]>;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
}
