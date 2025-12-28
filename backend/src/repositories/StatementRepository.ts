import { BaseRepository } from './BaseRepository';
import type { TKN_STATEMENT, TKN_BAKHUTANG } from '../types/database.types';

export class StatementRepository extends BaseRepository<TKN_STATEMENT> {
  protected tableName = 'TKN_STATEMENT';
  protected schemaName = 'STKN';

  /**
   * Get all statements for an account number
   * @param nomBakaun - Account number
   * @param includeOlderRecords - If false, only show records from the last 5 years (default: false)
   */
  async findByAccountNumber(nomBakaun: number, includeOlderRecords: boolean = false): Promise<TKN_STATEMENT[]> {
    let sql = `
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
    `;
    
    const binds: Record<string, any> = { nomBakaun };
    
    // If not including older records, filter to last 5 years
    if (!includeOlderRecords) {
      sql += ` AND STA_TARIKHTRX >= ADD_MONTHS(SYSDATE, -60)`;
    }
    
    sql += ` ORDER BY STA_TARIKHTRX ASC, STA_TRANSCODE DESC, STA_TRANSDRCR DESC`;
    
    return await this.query(sql, binds);
  }

  /**
   * Calculate opening balance from records older than 5 years
   * This represents the carried forward balance from previous years
   * @param nomBakaun - Account number
   */
  async calculateOpeningBalance(nomBakaun: number): Promise<number> {
    const sql = `
      SELECT 
        NVL(SUM(
          CASE 
            WHEN STA_TRANSDRCR = 'D' THEN STA_AMOUNTTRX
            ELSE -STA_AMOUNTTRX
          END
        ), 0) as OPENING_BALANCE
      FROM ${this.getFullTableName()}
      WHERE STA_NOMBAKAUN = :nomBakaun
        AND STA_TARIKHTRX < ADD_MONTHS(SYSDATE, -60)
    `;
    
    const result = await this.queryOne<{ OPENING_BALANCE: number }>(sql, { nomBakaun });
    return result?.OPENING_BALANCE || 0;
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
      // Owner name column in VTK_PEMILIKAN is PEM_NAMAMILIK
      conditions.push('UPPER(p.PEM_NAMAMILIK) LIKE UPPER(:ownerName)');
      binds.ownerName = `%${searchCriteria.ownerName}%`;
    }

    if (conditions.length === 0) {
      return [];
    }

    // Query to find distinct account numbers
    // Using VTK_PEMILIKAN table which contains property and owner information
    const sql = `
      SELECT DISTINCT s.STA_NOMBAKAUN
      FROM ${this.getFullTableName()} s
      INNER JOIN SADM.VTK_PEMILIKAN p ON p.PEM_NOMBAKAUN = s.STA_NOMBAKAUN
      WHERE ${conditions.join(' OR ')}
    `;
    
    const results = await this.query(sql, binds) as { STA_NOMBAKAUN: number }[];
    return results.map(r => r.STA_NOMBAKAUN);
  }

  /**
   * Get property and owner details for an account number
   * Fetches property and owner information from VTK_PEMILIKAN table
   */
  async getPropertyDetails(nomBakaun: number): Promise<any> {
    const tableName = 'SADM.VTK_PEMILIKAN';
    
    const sql = `
      SELECT 
        p.PEM_NOMBAKAUN as accountNumber,
        p.PEG_ALAMATHRT as propertyAddress,
        p.PEG_NOMBORLOT as lotNumber,
        p.PEG_XCORDINAT as xCoordinate,
        p.PEG_YCORDINAT as yCoordinate,
        p.PEG_PERATUSAN as percentage,
        p.PEG_NILAIBARU as newValue,
        p.PEG_KADARTHUN as ratePerYear,
        p.PEG_CUKAIBARU as newTax,
        p.PEM_NAMAMILIK as ownerName,
        p.PEM_ALAMATSRT as mailingAddress,
        p.PEM_ALAMATEML as ownerEmail,
        p.PEG_LORONGKOD as laneCode,
        p.PEG_JALANCODE as roadCode,
        p.MIL_MILIKNAME as ownerType,
        p.RAC_RACESNAME as race
      FROM ${tableName} p
      WHERE p.PEM_NOMBAKAUN = :nomBakaun
    `;
    
    try {
      console.log(`Fetching property details for account: ${nomBakaun}`);
      const result = await this.queryOne<any>(sql, { nomBakaun });
      
      if (!result) {
        console.log(`No property details found for account: ${nomBakaun}`);
        return null;
      }

      // Log the raw result to see what columns are actually returned
      console.log(`Raw property details result for account ${nomBakaun}:`, JSON.stringify(result, null, 2));
      console.log(`Result keys:`, Object.keys(result));
      
      // Map the result to ensure we have the right field names
      // Oracle might return column names in uppercase or with different casing
      const mappedResult: any = {
        accountNumber: result.ACCOUNTNUMBER || result.accountNumber || result.PEM_NOMBAKAUN,
        propertyAddress: result.PROPERTYADDRESS || result.propertyAddress || result.PEG_ALAMATHRT,
        lotNumber: result.LOTNUMBER || result.lotNumber || result.PEG_NOMBORLOT,
        xCoordinate: result.XCOORDINATE || result.xCoordinate || result.PEG_XCORDINAT,
        yCoordinate: result.YCOORDINATE || result.yCoordinate || result.PEG_YCORDINAT,
        percentage: result.PERCENTAGE || result.percentage || result.PEG_PERATUSAN,
        newValue: result.NEWVALUE || result.newValue || result.PEG_NILAIBARU,
        ratePerYear: result.RATEPERYEAR || result.ratePerYear || result.PEG_KADARTHUN,
        newTax: result.NEWTAX || result.newTax || result.PEG_CUKAIBARU,
        ownerName: result.OWNERNAME || result.ownerName || result.PEM_NAMAMILIK,
        mailingAddress: result.MAILINGADDRESS || result.mailingAddress || result.PEM_ALAMATSRT,
        ownerEmail: result.OWNEREMAIL || result.ownerEmail || result.PEM_ALAMATEML || '',
        laneCode: result.LANECODE || result.laneCode || result.PEG_LORONGKOD,
        roadCode: result.ROADCODE || result.roadCode || result.PEG_JALANCODE,
        ownerType: result.OWNERTYPE || result.ownerType || result.MIL_MILIKNAME,
        race: result.RACE || result.race || result.RAC_RACESNAME,
      };

      console.log(`Mapped property details for account ${nomBakaun}:`, {
        accountNumber: mappedResult.accountNumber,
        ownerName: mappedResult.ownerName,
        propertyAddress: mappedResult.propertyAddress,
        hasData: Object.keys(mappedResult).length > 0
      });

      // Format CTA calculation if values are available
      if (mappedResult.newValue && mappedResult.ratePerYear && mappedResult.percentage) {
        const cta = (mappedResult.newValue * (mappedResult.ratePerYear / 100) * (mappedResult.percentage / 100)).toFixed(2);
        mappedResult.ctaCalculation = `${mappedResult.newValue.toFixed(2)} X ${mappedResult.ratePerYear.toFixed(4)}% X ${mappedResult.percentage.toFixed(2)}% = ${cta}`;
      }
      
      return mappedResult;
    } catch (error: any) {
      // If table doesn't exist, return null gracefully instead of crashing
      if (error.errorNum === 942) { // ORA-00942: table or view does not exist
        console.error(`Table ${tableName} does not exist. Please update the table name in getPropertyDetails method.`);
        return null; // Return null so the page still works without property details
      }
      console.error('Error fetching property details:', error);
      throw error;
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

