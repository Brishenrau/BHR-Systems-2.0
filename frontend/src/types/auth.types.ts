import type { BHR_PAYNUMBER } from './database.types';

export interface LoginCredentials {
  payNumber: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: BHR_PAYNUMBER;
  accessModules: string; // From BHR_ACCESSMDL
}

export interface AuthState {
  user: BHR_PAYNUMBER | null;
  isAuthenticated: boolean;
  accessModules: string | null;
}

