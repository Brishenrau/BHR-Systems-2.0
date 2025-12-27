import apiClient from './api';
import type { BHR_PAYNUMBER } from '../types/database.types';
import type { LoginCredentials, AuthResponse } from '../types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('authToken');
    }
  },

  async getCurrentUser(): Promise<BHR_PAYNUMBER> {
    const response = await apiClient.get<BHR_PAYNUMBER>('/auth/me');
    return response.data;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },
};

