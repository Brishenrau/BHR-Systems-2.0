import { executeQueryOne } from '../config/database';

export interface PER_PORTRAITS {
  POR_PAYNUMBER: string;
  POR_PORTIMAGE: Buffer | string; // LONG RAW - binary data
  POR_PORTSPATH?: string | null;
  POR_ENTRYOPER: string;
  POR_ENTRYDATE: Date | string;
  POR_MODFYOPER?: string | null;
  POR_MODFYDATE?: Date | string | null;
}

export class PortraitRepository {
  /**
   * Get portrait image by pay number
   */
  async findByPayNumber(payNumber: string): Promise<PER_PORTRAITS | null> {
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
    
    return await executeQueryOne<PER_PORTRAITS>(sql, [payNumber]);
  }
}

