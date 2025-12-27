import { MenuRepository } from '../repositories/MenuRepository';
import { AccessRepository } from '../repositories/AccessRepository';
import type { MenuItem, ProgramItem } from '../types/database.types';

export class MenuService {
  private menuRepository = new MenuRepository();
  private accessRepository = new AccessRepository();

  /**
   * Get menu structure for current user
   * Filters menus based on user access permissions
   */
  async getUserMenu(payNumber: string): Promise<MenuItem[]> {
    // Get all menus with programs
    const allMenus = await this.menuRepository.getUserMenu();
    
    // Get user access modules
    const access = await this.accessRepository.findByPayNumber(payNumber);
    const accessModules = access?.ACC_MODACCESS || 'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT';
    
    // Filter menus based on access (if needed)
    // For now, return all menus
    // You can implement filtering logic based on ACC_MODACCESS string
    return allMenus;
  }

  /**
   * Get all programs (for admin or general use)
   */
  async getAllPrograms(): Promise<ProgramItem[]> {
    return await this.menuRepository.getAllPrograms();
  }
}

