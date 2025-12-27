import apiClient from './api';
import type { BHR_PAYNUMBER } from '../types/database.types';
import type { LoginCredentials, AuthResponse } from '../types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Development mode: Allow login without backend for testing
    // Remove this when backend is ready
    const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || !import.meta.env.VITE_API_BASE_URL;
    
    if (DEV_MODE) {
      // Mock successful login for development
      const mockUser: BHR_PAYNUMBER = {
        USE_PAYNUMBER: credentials.payNumber,
        USE_PTJPKCODE: '000000',
        USE_SHORTNAME: 0,
        USE_USERLEVEL: 'U',
        USE_STATUSFLG: 'Y',
        USE_ENTRYOPER: 'SYSTEM',
        USE_ENTRYDATE: new Date().toISOString(),
      };
      
      const mockToken = 'dev-token-' + Date.now();
      localStorage.setItem('authToken', mockToken);
      
      return {
        token: mockToken,
        user: mockUser,
        accessModules: 'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      };
    }
    
    // Production: Call actual API
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  async logout(): Promise<void> {
    const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || !import.meta.env.VITE_API_BASE_URL;
    
    if (!DEV_MODE) {
      try {
        await apiClient.post('/auth/logout');
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    
    localStorage.removeItem('authToken');
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

