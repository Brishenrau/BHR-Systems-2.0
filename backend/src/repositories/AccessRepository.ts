import { BaseRepository } from './BaseRepository';
import type { BHR_ACCESSMDL } from '../types/database.types';

export class AccessRepository extends BaseRepository<BHR_ACCESSMDL> {
  protected tableName = 'BHR_ACCESSMDL';
  protected schemaName = 'SADM';

  /**
   * Find access modules by pay number
   */
  async findByPayNumber(payNumber: string): Promise<BHR_ACCESSMDL | null> {
    const sql = `
      SELECT 
        ACC_PAYNUMBER,
        ACC_MODACCESS,
        ACC_STATUSFLG,
        ACC_ENTRYOPER,
        ACC_ENTRYDATE,
        ACC_MODFYOPER,
        ACC_MODFYDATE
      FROM ${this.getFullTableName()}
      WHERE ACC_PAYNUMBER = :payNumber
        AND ACC_STATUSFLG = 'Y'
    `;
    
    return await this.queryOne<BHR_ACCESSMDL>(sql, [payNumber]);
  }

  /**
   * Create or update access modules
   */
  async upsert(access: Partial<BHR_ACCESSMDL>): Promise<BHR_ACCESSMDL> {
    const sql = `
      MERGE INTO ${this.getFullTableName()} t
      USING (SELECT :payNumber AS payNumber FROM DUAL) s
      ON (t.ACC_PAYNUMBER = s.payNumber)
      WHEN MATCHED THEN
        UPDATE SET
          ACC_MODACCESS = :modAccess,
          ACC_STATUSFLG = :statusFlg,
          ACC_MODFYOPER = :modfyOper,
          ACC_MODFYDATE = SYSDATE
      WHEN NOT MATCHED THEN
        INSERT (
          ACC_PAYNUMBER,
          ACC_MODACCESS,
          ACC_STATUSFLG,
          ACC_ENTRYOPER,
          ACC_ENTRYDATE
        ) VALUES (
          :payNumber,
          :modAccess,
          :statusFlg,
          :entryOper,
          SYSDATE
        )
    `;
    
    await this.execute(sql, [
      access.ACC_PAYNUMBER,
      access.ACC_MODACCESS || 'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      access.ACC_STATUSFLG || 'Y',
      access.ACC_MODFYOPER || access.ACC_ENTRYOPER || 'SYSTEM',
      access.ACC_PAYNUMBER,
      access.ACC_MODACCESS || 'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      access.ACC_STATUSFLG || 'Y',
      access.ACC_ENTRYOPER || 'SYSTEM',
    ]);
    
    const result = await this.findByPayNumber(access.ACC_PAYNUMBER!);
    if (!result) {
      throw new Error('Failed to upsert access modules');
    }
    return result;
  }
}

