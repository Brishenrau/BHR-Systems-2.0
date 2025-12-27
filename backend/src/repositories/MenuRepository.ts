import { BaseRepository } from './BaseRepository';
import type { BHR_MENHEADER, BHR_PGRAMCODE, MenuItem, ProgramItem } from '../types/database.types';

export class MenuRepository extends BaseRepository<BHR_MENHEADER> {
  protected tableName = 'BHR_MENHEADER';
  protected schemaName = 'SADM';

  /**
   * Get all menu headers ordered by menu number
   */
  async findAllMenus(): Promise<BHR_MENHEADER[]> {
    const sql = `
      SELECT 
        MEN_MENNUMBER,
        MEN_MENHEADER,
        MEN_ENTRYOPER,
        MEN_ENTRYDATE,
        MEN_MODFYOPER,
        MEN_MODFYDATE
      FROM ${this.getFullTableName()}
      ORDER BY MEN_MENNUMBER
    `;
    
    return await this.query<BHR_MENHEADER>(sql);
  }

  /**
   * Get menu with programs for a user
   * This combines BHR_MENHEADER and BHR_PGRAMCODE
   * If menu headers don't exist, programs are still returned grouped by menu number
   */
  async getUserMenu(payNumber?: string): Promise<MenuItem[]> {
    // Get all menu headers
    const menus = await this.findAllMenus();
    
    // Get all programs
    const programsSql = `
      SELECT 
        PGR_PGRAMCODE,
        PGR_MODULCODE,
        PGR_MENNUMBER,
        PGR_PGRAMNAME,
        PGR_SEQUENCED
      FROM SADM.BHR_PGRAMCODE
      ORDER BY PGR_MENNUMBER, PGR_SEQUENCED
    `;
    
    const allPrograms = await this.query<BHR_PGRAMCODE>(programsSql);
    
    // If no programs exist, return empty array
    if (allPrograms.length === 0) {
      return [];
    }
    
    // Group programs by menu number
    const menuMap = new Map<number, ProgramItem[]>();
    const menuHeaderMap = new Map<number, string>();
    
    // Create map of menu headers
    menus.forEach((menu) => {
      menuHeaderMap.set(menu.MEN_MENNUMBER, menu.MEN_MENHEADER);
    });
    
    allPrograms.forEach((program) => {
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
    
    // If menu headers exist, use them; otherwise create menu items from program menu numbers
    if (menus.length > 0) {
      // Combine menus with their programs
      const menuItems: MenuItem[] = menus.map((menu) => ({
        menuNumber: menu.MEN_MENNUMBER,
        menuHeader: menu.MEN_MENHEADER,
        programs: menuMap.get(menu.MEN_MENNUMBER) || [],
      }));
      
      return menuItems;
    } else {
      // No menu headers, but we have programs - create menu items from menu numbers
      const menuItems: MenuItem[] = Array.from(menuMap.keys())
        .sort((a, b) => a - b)
        .map((menuNumber) => ({
          menuNumber,
          menuHeader: menuHeaderMap.get(menuNumber) || `Menu ${menuNumber}`,
          programs: menuMap.get(menuNumber) || [],
        }));
      
      return menuItems;
    }
  }

  /**
   * Get all programs
   */
  async getAllPrograms(): Promise<ProgramItem[]> {
    const sql = `
      SELECT 
        PGR_PGRAMCODE,
        PGR_MODULCODE,
        PGR_MENNUMBER,
        PGR_PGRAMNAME,
        PGR_SEQUENCED
      FROM SADM.BHR_PGRAMCODE
      ORDER BY PGR_MENNUMBER, PGR_SEQUENCED
    `;
    
    const programs = await this.query<BHR_PGRAMCODE>(sql);
    
    return programs.map((program) => ({
      programCode: program.PGR_PGRAMCODE,
      moduleCode: program.PGR_MODULCODE,
      programName: program.PGR_PGRAMNAME,
      sequence: program.PGR_SEQUENCED,
    }));
  }
}

