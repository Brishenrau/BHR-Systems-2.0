import { BaseRepository } from './BaseRepository';
import type { BHR_PAYNUMBER } from '../types/database.types';

export class UserRepository extends BaseRepository<BHR_PAYNUMBER> {
  protected tableName = 'BHR_PAYNUMBER';
  protected schemaName = 'SADM';

  /**
   * Find user by pay number
   */
  async findByPayNumber(payNumber: string): Promise<BHR_PAYNUMBER | null> {
    const sql = `
      SELECT 
        USE_PAYNUMBER,
        USE_PTJPKCODE,
        USE_SHORTNAME,
        USE_USERLEVEL,
        USE_STATUSFLG,
        USE_ENTRYOPER,
        USE_ENTRYDATE,
        USE_MODFYOPER,
        USE_MODFYDATE
      FROM ${this.getFullTableName()}
      WHERE USE_PAYNUMBER = :payNumber
    `;
    
    return await this.queryOne<BHR_PAYNUMBER>(sql, [payNumber]);
  }

  /**
   * Find active user by pay number
   */
  async findActiveByPayNumber(payNumber: string): Promise<BHR_PAYNUMBER | null> {
    const sql = `
      SELECT 
        USE_PAYNUMBER,
        USE_PTJPKCODE,
        USE_SHORTNAME,
        USE_USERLEVEL,
        USE_STATUSFLG,
        USE_ENTRYOPER,
        USE_ENTRYDATE,
        USE_MODFYOPER,
        USE_MODFYDATE
      FROM ${this.getFullTableName()}
      WHERE USE_PAYNUMBER = :payNumber
        AND USE_STATUSFLG = 'Y'
    `;
    
    return await this.queryOne<BHR_PAYNUMBER>(sql, [payNumber]);
  }

  /**
   * Create new user
   */
  async create(user: Partial<BHR_PAYNUMBER>): Promise<BHR_PAYNUMBER> {
    const sql = `
      INSERT INTO ${this.getFullTableName()} (
        USE_PAYNUMBER,
        USE_PTJPKCODE,
        USE_SHORTNAME,
        USE_USERLEVEL,
        USE_STATUSFLG,
        USE_ENTRYOPER,
        USE_ENTRYDATE
      ) VALUES (
        :payNumber,
        :ptjpkCode,
        :shortName,
        :userLevel,
        :statusFlg,
        :entryOper,
        SYSDATE
      )
    `;
    
    await this.execute(sql, [
      user.USE_PAYNUMBER,
      user.USE_PTJPKCODE,
      user.USE_SHORTNAME || 0,
      user.USE_USERLEVEL || 'U',
      user.USE_STATUSFLG || 'Y',
      user.USE_ENTRYOPER || 'SYSTEM',
    ]);
    
    const created = await this.findByPayNumber(user.USE_PAYNUMBER!);
    if (!created) {
      throw new Error('Failed to create user');
    }
    return created;
  }

  /**
   * Update user
   */
  async update(payNumber: string, updates: Partial<BHR_PAYNUMBER>): Promise<BHR_PAYNUMBER> {
    const setClauses: string[] = [];
    const binds: any[] = [];
    let bindIndex = 1;

    if (updates.USE_PTJPKCODE !== undefined) {
      setClauses.push(`USE_PTJPKCODE = :${bindIndex++}`);
      binds.push(updates.USE_PTJPKCODE);
    }
    if (updates.USE_SHORTNAME !== undefined) {
      setClauses.push(`USE_SHORTNAME = :${bindIndex++}`);
      binds.push(updates.USE_SHORTNAME);
    }
    if (updates.USE_USERLEVEL !== undefined) {
      setClauses.push(`USE_USERLEVEL = :${bindIndex++}`);
      binds.push(updates.USE_USERLEVEL);
    }
    if (updates.USE_STATUSFLG !== undefined) {
      setClauses.push(`USE_STATUSFLG = :${bindIndex++}`);
      binds.push(updates.USE_STATUSFLG);
    }
    
    setClauses.push(`USE_MODFYOPER = :${bindIndex++}`);
    binds.push(updates.USE_MODFYOPER || 'SYSTEM');
    setClauses.push(`USE_MODFYDATE = SYSDATE`);
    
    binds.push(payNumber);

    const sql = `
      UPDATE ${this.getFullTableName()}
      SET ${setClauses.join(', ')}
      WHERE USE_PAYNUMBER = :${bindIndex}
    `;

    await this.execute(sql, binds);
    const updated = await this.findByPayNumber(payNumber);
    if (!updated) {
      throw new Error('Failed to update user');
    }
    return updated;
  }
}

