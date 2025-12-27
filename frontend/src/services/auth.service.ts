import apiClient from './api';
import type { BHR_PAYNUMBER } from '../types/database.types';
import type { LoginCredentials, AuthResponse } from '../types/auth.types';

// API response wrapper type (backend wraps responses)
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Call actual API (backend wraps response in { success, data, message })
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('authToken', response.data.data.token);
    }
    
    return response.data.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    localStorage.removeItem('authToken');
  },

  async getCurrentUser(): Promise<BHR_PAYNUMBER> {
    const response = await apiClient.get<ApiResponse<BHR_PAYNUMBER>>('/auth/me');
    return response.data.data;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },
};

