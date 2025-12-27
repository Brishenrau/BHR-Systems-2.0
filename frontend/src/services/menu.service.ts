import apiClient from './api';
import type { MenuItem, ProgramItem } from '../types/database.types';

export const menuService = {
  // Get menu structure for current user (reads from BHR_MENHEADER & BHR_PGRAMCODE)
  async getUserMenu(): Promise<MenuItem[]> {
    const response = await apiClient.get<MenuItem[]>('/menu/user-menu');
    return response.data;
  },

  // Get all programs (for admin)
  async getAllPrograms(): Promise<ProgramItem[]> {
    const response = await apiClient.get<ProgramItem[]>('/menu/programs');
    return response.data;
  },
};

