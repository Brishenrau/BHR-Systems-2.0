import apiClient from './api';
import type { ApiResponse } from '../types/api.types';
import type { BHR_MODULCODE } from '../types/database.types';

export interface CreateModuleRequest {
  MOD_MODULCODE: string;
  MOD_MODULNAME: string;
  MOD_STATUSFLG?: string;
}

export const moduleService = {
  async createModule(data: CreateModuleRequest): Promise<BHR_MODULCODE> {
    const response = await apiClient.post<ApiResponse<BHR_MODULCODE>>('/modules', data);
    return response.data.data;
  },

  async getAllModules(): Promise<BHR_MODULCODE[]> {
    const response = await apiClient.get<ApiResponse<BHR_MODULCODE[]>>('/modules');
    return response.data.data;
  },
};

