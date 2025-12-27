import { BaseRepository } from './BaseRepository';
import type { BHR_MODULCODE } from '../types/database.types';

export class ModuleRepository extends BaseRepository<BHR_MODULCODE> {
  protected tableName = 'BHR_MODULCODE';
  protected schemaName = 'SADM';

  /**
   * Find all active modules ordered by sequence
   */
  async findAllActive(): Promise<BHR_MODULCODE[]> {
    const sql = `
      SELECT 
        MOD_MODULCODE,
        MOD_MODULSIRI,
        MOD_MODULNAME,
        MOD_STATUSFLG,
        MOD_ENTRYOPER,
        MOD_ENTRYDATE,
        MOD_MODFYOPER,
        MOD_MODFYDATE
      FROM ${this.getFullTableName()}
      WHERE MOD_STATUSFLG = 'Y'
      ORDER BY MOD_MODULSIRI
    `;
    
    return await this.query<BHR_MODULCODE>(sql);
  }

  /**
   * Find module by code
   */
  async findByCode(moduleCode: string): Promise<BHR_MODULCODE | null> {
    const sql = `
      SELECT 
        MOD_MODULCODE,
        MOD_MODULSIRI,
        MOD_MODULNAME,
        MOD_STATUSFLG,
        MOD_ENTRYOPER,
        MOD_ENTRYDATE,
        MOD_MODFYOPER,
        MOD_MODFYDATE
      FROM ${this.getFullTableName()}
      WHERE MOD_MODULCODE = :1
        AND MOD_STATUSFLG = 'Y'
    `;
    
    return await this.queryOne<BHR_MODULCODE>(sql, [moduleCode]);
  }
}

