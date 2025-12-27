import apiClient from './api';
import type { ApiResponse } from '../types/api.types';

export interface PortraitResponse {
  imageUrl: string;
}

export const portraitService = {
  async getPortrait(payNumber: string): Promise<string | null> {
    try {
      console.log('Fetching portrait for payNumber:', payNumber);
      const response = await apiClient.get<ApiResponse<PortraitResponse>>(`/portrait/${payNumber}`);
      console.log('Portrait API response:', response.data);
      return response.data.data.imageUrl;
    } catch (error: any) {
      // If portrait not found, return null (will show default avatar)
      if (error.response?.status === 404) {
        console.log('Portrait not found (404) for payNumber:', payNumber);
        return null;
      }
      console.error('Failed to get portrait:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      // Don't throw - just return null to show default avatar
      return null;
    }
  },
};

