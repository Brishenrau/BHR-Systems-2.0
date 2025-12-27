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
      
      const result = await connection.execute<PER_PORTRAITS>(
        sql,
        [payNumber],
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
          fetchInfo: {
            POR_PORTIMAGE: { type: oracledb.BUFFER }, // Fetch as Buffer
          },
        }
      );
      
      return result.rows && result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error fetching portrait:', error);
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

