import apiClient from './api';
import type { MenuItem, ProgramItem, BHR_MODULCODE } from '../types/database.types';

// API response wrapper type (backend wraps responses)
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const menuService = {
  // Get accessible modules for current user (from BHR_MODULCODE)
  async getUserModules(): Promise<BHR_MODULCODE[]> {
    const response = await apiClient.get<ApiResponse<BHR_MODULCODE[]>>('/menu/user-modules');
    return response.data.data;
  },

  // Get menu structure for current user (reads from BHR_MENHEADER & BHR_PGRAMCODE)
  // Backend filters based on user's access modules
  async getUserMenu(): Promise<MenuItem[]> {
    // Call actual API (backend wraps response in { success, data, message })
    const response = await apiClient.get<ApiResponse<MenuItem[]>>('/menu/user-menu');
    return response.data.data;
  },

  // Get menu headers and programs for a specific module
  async getModuleMenus(moduleCode: string): Promise<MenuItem[]> {
    const response = await apiClient.get<ApiResponse<MenuItem[]>>(`/menu/module/${moduleCode}/menus`);
    return response.data.data;
  },

  // Get all programs (for admin)
  async getAllPrograms(): Promise<ProgramItem[]> {
    const response = await apiClient.get<ApiResponse<ProgramItem[]>>('/menu/programs');
    return response.data.data;
  },
};
