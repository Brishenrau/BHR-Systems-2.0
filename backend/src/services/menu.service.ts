import { MenuRepository } from '../repositories/MenuRepository';
import { AccessRepository } from '../repositories/AccessRepository';
import { ModuleRepository } from '../repositories/ModuleRepository';
import type { MenuItem, ProgramItem, BHR_MODULCODE, BHR_PGRAMCODE } from '../types/database.types';

export class MenuService {
  private menuRepository = new MenuRepository();
  private accessRepository = new AccessRepository();
  private moduleRepository = new ModuleRepository();

  /**
   * Check if user has access to a module based on access string
   * @param moduleSequence - MOD_MODULSIRI (1-based)
   * @param accessString - ACC_MODACCESS (60 char string)
   * @returns true if user has access (Y = access, T = no access)
   */
  private hasModuleAccess(moduleSequence: number, accessString: string): boolean {
    // Access string is 0-indexed, module sequence is 1-based
    // Position in access string = moduleSequence - 1
    const position = moduleSequence - 1;
    
    if (position < 0 || position >= accessString.length) {
      return false; // Out of bounds, no access
    }
    
    const accessChar = accessString.charAt(position).toUpperCase();
    // Y = access granted, T = no access
    return accessChar === 'Y';
  }

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
    
    // Get all active modules to map module codes to sequences
    const allModules = await this.moduleRepository.findAllActive();
    const moduleMap = new Map<string, number>(); // moduleCode -> sequence
    
    allModules.forEach((module) => {
      moduleMap.set(module.MOD_MODULCODE, module.MOD_MODULSIRI);
    });
    
    // Filter programs based on module access
    const filteredMenus: MenuItem[] = allMenus.map((menu) => {
      const filteredPrograms = menu.programs.filter((program) => {
        // Get module sequence for this program's module code
        const moduleSequence = moduleMap.get(program.moduleCode);
        
        if (!moduleSequence) {
          // Module not found, deny access by default
          return false;
        }
        
        // Check if user has access to this module
        return this.hasModuleAccess(moduleSequence, accessModules);
      });
      
      // Only include menu if it has accessible programs
      return {
        ...menu,
        programs: filteredPrograms,
      };
    }).filter((menu) => menu.programs.length > 0); // Remove empty menus
    
    return filteredMenus;
  }

  /**
   * Get accessible modules for current user
   * Returns modules from BHR_MODULCODE filtered by user access
   */
  async getUserModules(payNumber: string): Promise<BHR_MODULCODE[]> {
    // Get user access modules
    const access = await this.accessRepository.findByPayNumber(payNumber);
    const accessModules = access?.ACC_MODACCESS || 'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT';
    
    // Get all active modules
    const allModules = await this.moduleRepository.findAllActive();
    
    // Filter modules based on user access
    const accessibleModules = allModules.filter((module) => {
      return this.hasModuleAccess(module.MOD_MODULSIRI, accessModules);
    });
    
    return accessibleModules;
  }

  /**
   * Get menu headers and programs for a specific module
   * Only returns headers that have programs for the given module
   */
  async getModuleMenus(moduleCode: string): Promise<MenuItem[]> {
    // Use getUserMenu() which we know works, then filter by module code
    // This ensures we're using the same working query pattern
    const allMenuItems = await this.menuRepository.getUserMenu();
    
    // Filter to only include programs for this module
    const moduleMenuItems: MenuItem[] = allMenuItems
      .map((menu) => ({
        ...menu,
        programs: menu.programs.filter(
          (program) => program.moduleCode.trim().toUpperCase() === moduleCode.trim().toUpperCase()
        ),
      }))
      .filter((menu) => menu.programs.length > 0); // Only keep menus with programs
    
    return moduleMenuItems;
  }

  /**
   * Get all programs (for admin or general use)
   */
  async getAllPrograms(): Promise<ProgramItem[]> {
    return await this.menuRepository.getAllPrograms();
  }
}

