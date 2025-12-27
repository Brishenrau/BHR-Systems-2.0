import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import type { LoginCredentials } from '../types/auth.types';
import type { ApiError } from '../types/api.types';

export const useAuth = () => {
  const navigate = useNavigate();
  const { setAuth, logout: logoutStore } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      setAuth(response.user, response.accessModules);
      navigate('/');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      logoutStore();
      navigate('/login');
    }
  };

  return {
    login,
    logout,
    loading,
    error,
  };
};

