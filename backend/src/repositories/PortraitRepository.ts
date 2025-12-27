import { getConnection } from '../config/database';
import oracledb from 'oracledb';

export interface PER_PORTRAITS {
  POR_PAYNUMBER: string;
  POR_PORTIMAGE: Buffer | null; // LONG RAW - binary data
  POR_PORTSPATH?: string | null;
  POR_ENTRYOPER: string;
  POR_ENTRYDATE: Date | string;
  POR_MODFYOPER?: string | null;
  POR_MODFYDATE?: Date | string | null;
}

export class PortraitRepository {
  /**
   * Get portrait image by pay number
   * LONG RAW needs special handling in Oracle
   */
  async findByPayNumber(payNumber: string): Promise<PER_PORTRAITS | null> {
    const connection = await getConnection();
    try {
      // Try using RAWTOHEX first, then convert back to Buffer if needed
      // LONG RAW can be tricky, so we'll try multiple approaches
      const sql = `
        SELECT 
          POR_PAYNUMBER,
          POR_PORTIMAGE,
          POR_PORTSPATH,
          POR_ENTRYOPER,
          POR_ENTRYDATE,
          POR_MODFYOPER,
          POR_MODFYDATE
        FROM SPER.PER_PORTRAITS
        WHERE POR_PAYNUMBER = :1
      `;
      
      console.log('Executing portrait query for payNumber:', payNumber);
      
      // Try with fetchInfo first
      let result;
      try {
        result = await connection.execute<PER_PORTRAITS>(
          sql,
          [payNumber],
          {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            fetchInfo: {
              POR_PORTIMAGE: { type: oracledb.BUFFER }, // Fetch as Buffer
            },
          }
        );
      } catch (fetchError: any) {
        console.log('Fetch with BUFFER type failed, trying without fetchInfo:', fetchError.message);
        // If that fails, try without fetchInfo (Oracle will return it as-is)
        result = await connection.execute<PER_PORTRAITS>(
          sql,
          [payNumber],
          {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
          }
        );
      }
      
      console.log('Portrait query result rows:', result.rows?.length || 0);
      
      if (result.rows && result.rows.length > 0) {
        const portrait = result.rows[0];
        console.log('Portrait found - POR_PORTIMAGE exists:', !!portrait.POR_PORTIMAGE);
        if (portrait.POR_PORTIMAGE) {
          console.log('POR_PORTIMAGE type:', typeof portrait.POR_PORTIMAGE);
          console.log('POR_PORTIMAGE is Buffer:', Buffer.isBuffer(portrait.POR_PORTIMAGE));
          if (Buffer.isBuffer(portrait.POR_PORTIMAGE)) {
            console.log('POR_PORTIMAGE Buffer length:', portrait.POR_PORTIMAGE.length);
          }
        }
        return portrait;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error fetching portrait:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.errorCode);
      throw error;
    } finally {
      try {
        await connection.close();
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    }
  }
}

