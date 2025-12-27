import { BaseRepository } from './BaseRepository';
import type { BHR_MENHEADER } from '../types/database.types';

export class MenuHeaderRepository extends BaseRepository<BHR_MENHEADER> {
  protected tableName = 'BHR_MENHEADER';
  protected schemaName = 'SADM';

  /**
   * Find menu header by menu number
   */
  async findByMenuNumber(menuNumber: number): Promise<BHR_MENHEADER | null> {
    const sql = `
      SELECT 
        MEN_MENNUMBER,
        MEN_MENHEADER,
        MEN_ENTRYOPER,
        MEN_ENTRYDATE,
        MEN_MODFYOPER,
        MEN_MODFYDATE
      FROM ${this.getFullTableName()}
      WHERE MEN_MENNUMBER = :menuNumber
    `;
    
    return await this.queryOne<BHR_MENHEADER>(sql, { menuNumber });
  }

  /**
   * Get next menu number
   */
  async getNextMenuNumber(): Promise<number> {
    const sql = `
      SELECT NVL(MAX(MEN_MENNUMBER), 0) + 1 AS NEXT_MENU
      FROM ${this.getFullTableName()}
    `;
    const result = await this.queryOne<{ NEXT_MENU: number }>(sql);
    return result?.NEXT_MENU || 1;
  }

  /**
   * Create a new menu header
   */
  async create(menuHeader: Partial<BHR_MENHEADER>): Promise<BHR_MENHEADER> {
    // Get next menu number if not provided
    let menuNumber = menuHeader.MEN_MENNUMBER;
    if (!menuNumber) {
      menuNumber = await this.getNextMenuNumber();
    }

    const sql = `
      INSERT INTO ${this.getFullTableName()} (
        MEN_MENNUMBER,
        MEN_MENHEADER,
        MEN_ENTRYOPER,
        MEN_ENTRYDATE
      ) VALUES (
        :menuNumber,
        :menuHeader,
        :entryOper,
        SYSDATE
      )
    `;
    
    await this.execute(sql, {
      menuNumber,
      menuHeader: menuHeader.MEN_MENHEADER,
      entryOper: menuHeader.MEN_ENTRYOPER || 'SYSTEM',
    });

    const createdMenu = await this.findByMenuNumber(menuNumber);
    if (!createdMenu) {
      throw new Error('Failed to create menu header');
    }
    return createdMenu;
  }

  /**
   * Get all menu headers
   */
  async findAll(): Promise<BHR_MENHEADER[]> {
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
   * Check if menu number already exists
   */
  async menuNumberExists(menuNumber: number): Promise<boolean> {
    const existing = await this.findByMenuNumber(menuNumber);
    return existing !== null;
  }

  /**
   * Check if menu header name already exists
   */
  async menuHeaderNameExists(menuHeader: string): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) AS CNT
      FROM ${this.getFullTableName()}
      WHERE UPPER(TRIM(MEN_MENHEADER)) = UPPER(TRIM(:menuHeader))
    `;
    const result = await this.queryOne<{ CNT: number }>(sql, { menuHeader });
    return (result?.CNT || 0) > 0;
  }

  /**
   * Delete menu header by menu number
   */
  async delete(menuNumber: number): Promise<void> {
    const sql = `
      DELETE FROM ${this.getFullTableName()}
      WHERE MEN_MENNUMBER = :menuNumber
    `;
    await this.execute(sql, { menuNumber });
  }
}

