import { BaseRepository } from './BaseRepository';
import type { TKN_STATEMENT, TKN_BAKHUTANG } from '../types/database.types';

export class StatementRepository extends BaseRepository<TKN_STATEMENT> {
  protected tableName = 'TKN_STATEMENT';
  protected schemaName = 'STKN';

  /**
   * Get all statements for an account number
   */
  async findByAccountNumber(nomBakaun: number): Promise<TKN_STATEMENT[]> {
    const sql = `
      SELECT 
        STA_NOMBAKAUN,
        STA_NOMSERIAL,
        STA_TARIKHTRX,
        STA_TARIKHPOS,
        STA_REFERENCE,
        STA_TRANSCODE,
        STA_TRANSTYPE,
        STA_STATTRANS,
        STA_TRANSDRCR,
        STA_AMOUNTTRX,
        STA_CARABAYAR,
        STA_NDOCUMENT,
        STA_PUSATKTPN,
        STA_ENTRYOPER,
        STA_ENTRYDATE
      FROM ${this.getFullTableName()}
      WHERE STA_NOMBAKAUN = :nomBakaun
      ORDER BY STA_TARIKHTRX DESC, STA_NOMSERIAL DESC
    `;
    
    return await this.query(sql, {
      nomBakaun,
    });
  }

  /**
   * Get statement by account number and serial
   */
  async findByAccountAndSerial(
    nomBakaun: number,
    nomSerial: number
  ): Promise<TKN_STATEMENT | null> {
    const sql = `
      SELECT 
        STA_NOMBAKAUN,
        STA_NOMSERIAL,
        STA_TARIKHTRX,
        STA_TARIKHPOS,
        STA_REFERENCE,
        STA_TRANSCODE,
        STA_TRANSTYPE,
        STA_STATTRANS,
        STA_TRANSDRCR,
        STA_AMOUNTTRX,
        STA_CARABAYAR,
        STA_NDOCUMENT,
        STA_PUSATKTPN,
        STA_ENTRYOPER,
        STA_ENTRYDATE
      FROM ${this.getFullTableName()}
      WHERE STA_NOMBAKAUN = :nomBakaun
        AND STA_NOMSERIAL = :nomSerial
    `;
    
    return await this.queryOne(sql, {
      nomBakaun,
      nomSerial,
    });
  }
}

export class BakhutangRepository extends BaseRepository<TKN_BAKHUTANG> {
  protected tableName = 'TKN_BAKHUTANG';
  protected schemaName = 'STKN';

  /**
   * Get debt/balance information for an account number
   */
  async findByAccountNumber(nomBakaun: number): Promise<TKN_BAKHUTANG[]> {
    const sql = `
      SELECT 
        BAK_NOMBAKAUN,
        BAK_NOMSERIAL,
        BAK_TRANSCODE,
        BAK_AMAUNCURR,
        BAK_AMAUNTHUN,
        BAK_AMAUNTNGK,
        BAK_AMAUNLBIH,
        BAK_ENTRYOPER,
        BAK_ENTRYDATE
      FROM ${this.getFullTableName()}
      WHERE BAK_NOMBAKAUN = :nomBakaun
      ORDER BY BAK_TRANSCODE
    `;
    
    return await this.query(sql, {
      nomBakaun,
    });
  }
}

