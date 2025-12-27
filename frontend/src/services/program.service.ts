import apiClient from './api';
import type { ApiResponse } from '../types/api.types';
import type { BHR_PGRAMCODE } from '../types/database.types';

export interface CreateProgramRequest {
  PGR_PGRAMCODE: string;
  PGR_MODULCODE: string;
  PGR_MENNUMBER: number;
  PGR_PGRAMNAME: string;
  PGR_SEQUENCED?: number;
}

export const programService = {
  async createProgram(data: CreateProgramRequest): Promise<BHR_PGRAMCODE> {
    const response = await apiClient.post<ApiResponse<BHR_PGRAMCODE>>('/programs', data);
    return response.data.data;
  },

  async getAllPrograms(): Promise<BHR_PGRAMCODE[]> {
    const response = await apiClient.get<ApiResponse<BHR_PGRAMCODE[]>>('/programs');
    return response.data.data;
  },
};

