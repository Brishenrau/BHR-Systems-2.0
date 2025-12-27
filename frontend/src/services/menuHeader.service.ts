import apiClient from './api';
import type { ApiResponse } from '../types/api.types';
import type { BHR_MENHEADER } from '../types/database.types';

export interface CreateMenuHeaderRequest {
  MEN_MENNUMBER?: number;
  MEN_MENHEADER: string;
}

export const menuHeaderService = {
  async createMenuHeader(data: CreateMenuHeaderRequest): Promise<BHR_MENHEADER> {
    const response = await apiClient.post<ApiResponse<BHR_MENHEADER>>('/menu-headers', data);
    return response.data.data;
  },

  async getAllMenuHeaders(): Promise<BHR_MENHEADER[]> {
    const response = await apiClient.get<ApiResponse<BHR_MENHEADER[]>>('/menu-headers');
    return response.data.data;
  },
};

