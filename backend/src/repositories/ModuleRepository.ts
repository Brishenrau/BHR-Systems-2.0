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

  /**
   * Get next sequence number for new module
   */
  async getNextSequence(): Promise<number> {
    const sql = `
      SELECT NVL(MAX(MOD_MODULSIRI), 0) + 1 AS NEXT_SEQ
      FROM ${this.getFullTableName()}
    `;
    
    const result = await this.queryOne<{ NEXT_SEQ: number }>(sql);
    return result?.NEXT_SEQ || 1;
  }

  /**
   * Create a new module
   */
  async create(module: {
    MOD_MODULCODE: string;
    MOD_MODULNAME: string;
    MOD_STATUSFLG?: string;
    MOD_ENTRYOPER: string;
  }): Promise<BHR_MODULCODE> {
    // Get next sequence number
    const nextSequence = await this.getNextSequence();
    
    // Check if module code already exists
    const existing = await this.findByCode(module.MOD_MODULCODE);
    if (existing) {
      throw new Error(`Module code ${module.MOD_MODULCODE} already exists`);
    }
    
    const sql = `
      INSERT INTO ${this.getFullTableName()} (
        MOD_MODULCODE,
        MOD_MODULSIRI,
        MOD_MODULNAME,
        MOD_STATUSFLG,
        MOD_ENTRYOPER,
        MOD_ENTRYDATE
      ) VALUES (
        :1,
        :2,
        :3,
        :4,
        :5,
        SYSDATE
      )
    `;
    
    await this.execute(sql, [
      module.MOD_MODULCODE.toUpperCase().trim(),
      nextSequence,
      module.MOD_MODULNAME.trim(),
      module.MOD_STATUSFLG || 'Y',
      module.MOD_ENTRYOPER,
    ]);
    
    const created = await this.findByCode(module.MOD_MODULCODE);
    if (!created) {
      throw new Error('Failed to create module');
    }
    return created;
  }
}

