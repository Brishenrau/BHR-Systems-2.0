import { BaseRepository } from './BaseRepository';
import type { UTL_TRANSCODE } from '../types/database.types';

export class TransCodeRepository extends BaseRepository<UTL_TRANSCODE> {
  protected tableName = 'UTL_TRANSCODE';
  protected schemaName = 'SUTL';

  /**
   * Find transaction code by code and module type
   */
  async findByCodeAndModuleType(
    transCode: string,
    moduleType: string
  ): Promise<UTL_TRANSCODE | null> {
    const sql = `
      SELECT 
        TRA_TRANSCODE,
        TRA_MODULTYPE,
        TRA_TRANSDESC
      FROM ${this.getFullTableName()}
      WHERE TRA_TRANSCODE = :transCode
        AND TRA_MODULTYPE = :moduleType
    `;
    
    return await this.queryOne(sql, {
      transCode,
      moduleType,
    });
  }

  /**
   * Get all transaction codes for a specific module type
   */
  async findByModuleType(moduleType: string): Promise<UTL_TRANSCODE[]> {
    const sql = `
      SELECT 
        TRA_TRANSCODE,
        TRA_MODULTYPE,
        TRA_TRANSDESC
      FROM ${this.getFullTableName()}
      WHERE TRA_MODULTYPE = :moduleType
      ORDER BY TRA_TRANSCODE
    `;
    
    return await this.query(sql, {
      moduleType,
    });
  }
}

