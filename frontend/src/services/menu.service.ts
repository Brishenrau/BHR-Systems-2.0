import apiClient from './api';
import type { MenuItem, ProgramItem } from '../types/database.types';

// API response wrapper type (backend wraps responses)
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const menuService = {
  // Get menu structure for current user (reads from BHR_MENHEADER & BHR_PGRAMCODE)
  // Backend filters based on user's access modules
  async getUserMenu(): Promise<MenuItem[]> {
    // Call actual API (backend wraps response in { success, data, message })
    const response = await apiClient.get<ApiResponse<MenuItem[]>>('/menu/user-menu');
    return response.data.data;
  },

  // Get all programs (for admin)
  async getAllPrograms(): Promise<ProgramItem[]> {
    const response = await apiClient.get<ApiResponse<ProgramItem[]>>('/menu/programs');
    return response.data.data;
  },
};
