import apiClient from './api';
import type { StatementResponse } from '../types/database.types';

// API response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const statementService = {
  /**
   * Get statement by account number
   */
  async getStatementByAccount(nomBakaun: number): Promise<StatementResponse> {
    const response = await apiClient.get<ApiResponse<StatementResponse>>(
      `/statements/${nomBakaun}`
    );
    return response.data.data;
  },
};

