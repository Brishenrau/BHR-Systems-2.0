import apiClient from './api';
import type { ApiResponse } from '../types/api.types';
import type { BHR_ACCESSMDL, BHR_PAYNUMBER, BHR_MODULCODE } from '../types/database.types';

export interface UserAccessData {
  user: BHR_PAYNUMBER;
  access: BHR_ACCESSMDL | null;
  modules: BHR_MODULCODE[];
}

export const accessService = {
  async getUserAccess(payNumber: string): Promise<UserAccessData> {
    const response = await apiClient.get<ApiResponse<UserAccessData>>(`/access/user/${payNumber}`);
    return response.data.data;
  },

  async updateUserAccess(payNumber: string, accessString: string): Promise<BHR_ACCESSMDL> {
    const response = await apiClient.put<ApiResponse<BHR_ACCESSMDL>>(`/access/user/${payNumber}`, {
      accessString,
    });
    return response.data.data;
  },
};

