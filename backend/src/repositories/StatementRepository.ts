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
      ORDER BY STA_TARIKHTRX ASC, STA_TRANSCODE DESC, STA_TRANSDRCR DESC
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

  /**
   * Search for account numbers by address or owner name (wildcard search)
   * Returns distinct account numbers that match the search criteria
   * Note: This assumes a property/pegangan table exists - adjust table/column names as needed
   */
  async searchAccountNumbers(searchCriteria: {
    address?: string;
    ownerName?: string;
  }): Promise<number[]> {
    const conditions: string[] = [];
    const binds: Record<string, any> = {};

    // Build WHERE conditions based on provided criteria
    // Adjust table and column names based on your actual schema
    if (searchCriteria.address) {
      // Assuming PEG_ALAMATHRT is the address field in a property table
      conditions.push('UPPER(p.PEG_ALAMATHRT) LIKE UPPER(:address)');
      binds.address = `%${searchCriteria.address}%`;
    }

    if (searchCriteria.ownerName) {
      // Adjust column name for owner name - this is a placeholder
      // You may need to join with a different table for owner information
      conditions.push('UPPER(p.NAMA_PEMILIK) LIKE UPPER(:ownerName)');
      binds.ownerName = `%${searchCriteria.ownerName}%`;
    }

    if (conditions.length === 0) {
      return [];
    }

    // Query to find distinct account numbers
    // This structure assumes TKN_PEGANGAN table exists with PEG_NOMBAKAUN linking to STA_NOMBAKAUN
    // Adjust based on your actual schema
    const sql = `
      SELECT DISTINCT s.STA_NOMBAKAUN
      FROM ${this.getFullTableName()} s
      INNER JOIN STKN.TKN_PEGANGAN p ON p.PEG_NOMBAKAUN = s.STA_NOMBAKAUN
      WHERE ${conditions.join(' OR ')}
    `;
    
    const results = await this.query(sql, binds) as { STA_NOMBAKAUN: number }[];
    return results.map(r => r.STA_NOMBAKAUN);
  }

  /**
   * Get property and owner details for an account number
   * Fetches from TKN_PEGANGAN table which contains property and owner information
   */
  async getPropertyDetails(nomBakaun: number): Promise<any> {
    // Query TKN_PEGANGAN for property and owner details
    // NAMA_PEMILIK is used in searchAccountNumbers, so it should exist in this table
    const sql = `
      SELECT 
        p.PEG_NOMBAKAUN as accountNumber,
        p.PEG_ALAMATHRT as propertyAddress,
        p.PEG_NOMBORLOT as lotNumber,
        p.PEG_XCORDINAT as xCoordinate,
        p.PEG_YCORDINAT as yCoordinate,
        p.PEG_PERATUSAN as percentage,
        p.PEG_NILAIBARU as newValue,
        p.PEG_KADARTHUN as ratePerYear,
        p.PEG_CUKAIBARU as newTax,
        p.NAMA_PEMILIK as ownerName
      FROM STKN.TKN_PEGANGAN p
      WHERE p.PEG_NOMBAKAUN = :nomBakaun
    `;
    
    try {
      const result = await this.queryOne<any>(sql, { nomBakaun });
      
      if (!result) {
        return null;
      }

      // Set mailing address same as property address (can be updated if separate mailing address column exists)
      result.mailingAddress = result.propertyAddress;
      
      // Format CTA calculation if values are available
      if (result.newValue && result.ratePerYear && result.percentage) {
        const cta = (result.newValue * (result.ratePerYear / 100) * (result.percentage / 100)).toFixed(2);
        result.ctaCalculation = `${result.newValue.toFixed(2)} X ${result.ratePerYear.toFixed(4)}% X ${result.percentage.toFixed(2)}% = ${cta}`;
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching property details:', error);
      throw error; // Re-throw to let the controller handle it properly
    }
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

