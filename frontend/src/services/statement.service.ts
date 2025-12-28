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
   * @param nomBakaun - Account number
   * @param includeOlderRecords - If true, include records older than 5 years (default: false)
   */
  async getStatementByAccount(nomBakaun: number, includeOlderRecords: boolean = false): Promise<StatementResponse> {
    const params = new URLSearchParams();
    if (includeOlderRecords) {
      params.append('includeOlderRecords', 'true');
    }
    const queryString = params.toString();
    const url = `/statements/${nomBakaun}${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<ApiResponse<StatementResponse>>(url);
    return response.data.data;
  },

  /**
   * Search for account numbers by address or owner name
   */
  async searchAccounts(searchParams: {
    address?: string;
    ownerName?: string;
  }): Promise<number[]> {
    const params = new URLSearchParams();
    if (searchParams.address) params.append('address', searchParams.address);
    if (searchParams.ownerName) params.append('ownerName', searchParams.ownerName);
    
    const response = await apiClient.get<ApiResponse<number[]>>(
      `/statements/search?${params.toString()}`
    );
    return response.data.data;
  },

  /**
   * Get property and owner details by account number
   */
  async getPropertyDetails(nomBakaun: number): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(
      `/statements/${nomBakaun}/property`
    );
    return response.data.data;
  },

  /**
   * Send statement PDF via email
   */
  async sendStatementEmail(nomBakaun: number, email: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `/statements/${nomBakaun}/email`,
      { email }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send email');
    }
  },
};

