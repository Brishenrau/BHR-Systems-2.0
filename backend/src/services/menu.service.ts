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
    // Get all menu headers
    const allMenus = await this.menuRepository.findAllMenus();
    
    // Get all programs for this specific module
    const modulePrograms = await this.menuRepository.getProgramsByModule(moduleCode);
    
    console.log(`[getModuleMenus] Module: ${moduleCode}, Found ${modulePrograms.length} programs`);
    if (modulePrograms.length > 0) {
      console.log(`[getModuleMenus] Sample program:`, {
        code: modulePrograms[0].PGR_PGRAMCODE,
        module: modulePrograms[0].PGR_MODULCODE,
        menuNumber: modulePrograms[0].PGR_MENNUMBER,
        name: modulePrograms[0].PGR_PGRAMNAME
      });
    }
    
    // Group programs by menu number
    const menuMap = new Map<number, ProgramItem[]>();
    
    modulePrograms.forEach((program) => {
      const programItem: ProgramItem = {
        programCode: program.PGR_PGRAMCODE,
        moduleCode: program.PGR_MODULCODE,
        programName: program.PGR_PGRAMNAME,
        sequence: program.PGR_SEQUENCED,
      };
      
      if (!menuMap.has(program.PGR_MENNUMBER)) {
        menuMap.set(program.PGR_MENNUMBER, []);
      }
      menuMap.get(program.PGR_MENNUMBER)!.push(programItem);
    });
    
    console.log(`[getModuleMenus] Menu numbers with programs:`, Array.from(menuMap.keys()));
    console.log(`[getModuleMenus] Available menu headers:`, allMenus.map(m => ({ number: m.MEN_MENNUMBER, header: m.MEN_MENHEADER })));
    
    // Only include menu headers that have programs for this module
    const moduleMenus: MenuItem[] = allMenus
      .filter((menu) => menuMap.has(menu.MEN_MENNUMBER))
      .map((menu) => ({
        menuNumber: menu.MEN_MENNUMBER,
        menuHeader: menu.MEN_MENHEADER,
        programs: menuMap.get(menu.MEN_MENNUMBER)!.sort((a, b) => a.sequence - b.sequence),
      }));
    
    console.log(`[getModuleMenus] Returning ${moduleMenus.length} menu items`);
    
    return moduleMenus;
  }

  /**
   * Get all programs (for admin or general use)
   */
  async getAllPrograms(): Promise<ProgramItem[]> {
    return await this.menuRepository.getAllPrograms();
  }
}

