import { create } from 'zustand';
import type { BHR_PAYNUMBER } from '../types/database.types';

interface AuthState {
  user: BHR_PAYNUMBER | null;
  isAuthenticated: boolean;
  accessModules: string | null;
  setUser: (user: BHR_PAYNUMBER) => void;
  setAccessModules: (modules: string) => void;
  setAuth: (user: BHR_PAYNUMBER, accessModules: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  accessModules: null,
  setUser: (user) => set({ user, isAuthenticated: true }),
  setAccessModules: (accessModules) => set({ accessModules }),
  setAuth: (user, accessModules) => set({ user, isAuthenticated: true, accessModules }),
  logout: () => set({ user: null, isAuthenticated: false, accessModules: null }),
}));

