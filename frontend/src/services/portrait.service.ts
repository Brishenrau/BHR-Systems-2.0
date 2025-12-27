import apiClient from './api';
import type { ApiResponse } from '../types/api.types';

export interface PortraitResponse {
  imageUrl: string;
}

export const portraitService = {
  async getPortrait(payNumber: string): Promise<string | null> {
    try {
      const response = await apiClient.get<ApiResponse<PortraitResponse>>(`/portrait/${payNumber}`);
      return response.data.data.imageUrl;
    } catch (error: any) {
      // If portrait not found, return null (will show default avatar)
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Failed to get portrait:', error);
      return null;
    }
  },
};

