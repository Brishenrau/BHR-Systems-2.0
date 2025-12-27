export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  payNumber: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: any;
  accessModules: string;
}

export interface JwtPayload {
  payNumber: string;
  userLevel: string;
  iat?: number;
  exp?: number;
}

