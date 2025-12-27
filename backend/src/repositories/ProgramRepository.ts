import { BaseRepository } from './BaseRepository';
import type { BHR_PGRAMCODE } from '../types/database.types';

export class ProgramRepository extends BaseRepository<BHR_PGRAMCODE> {
  protected tableName = 'BHR_PGRAMCODE';
  protected schemaName = 'SADM';

  /**
   * Find program by code and module code (composite primary key)
   */
  async findByCode(programCode: string, moduleCode: string): Promise<BHR_PGRAMCODE | null> {
    const sql = `
      SELECT 
        PGR_PGRAMCODE,
        PGR_MODULCODE,
        PGR_MENNUMBER,
        PGR_PGRAMNAME,
        PGR_SEQUENCED,
        PGR_ENTRYOPER,
        PGR_ENTRYDATE,
        PGR_MODFYOPER,
        PGR_MODFYDATE
      FROM ${this.getFullTableName()}
      WHERE PGR_PGRAMCODE = :programCode
        AND PGR_MODULCODE = :moduleCode
    `;
    
    return await this.queryOne<BHR_PGRAMCODE>(sql, {
      programCode,
      moduleCode,
    });
  }

  /**
   * Get next sequence number for a given menu number and module code
   */
  async getNextSequence(menuNumber: number, moduleCode: string): Promise<number> {
    const sql = `
      SELECT NVL(MAX(PGR_SEQUENCED), 0) + 1 AS NEXT_SEQ
      FROM ${this.getFullTableName()}
      WHERE PGR_MENNUMBER = :menuNumber
        AND PGR_MODULCODE = :moduleCode
    `;
    const result = await this.queryOne<{ NEXT_SEQ: number }>(sql, {
      menuNumber,
      moduleCode,
    });
    return result?.NEXT_SEQ || 1;
  }

  /**
   * Create a new program
   */
  async create(program: Partial<BHR_PGRAMCODE>): Promise<BHR_PGRAMCODE> {
    // Get next sequence if not provided
    let sequence = program.PGR_SEQUENCED;
    if (!sequence && program.PGR_MENNUMBER && program.PGR_MODULCODE) {
      sequence = await this.getNextSequence(program.PGR_MENNUMBER, program.PGR_MODULCODE);
    }

    const sql = `
      INSERT INTO ${this.getFullTableName()} (
        PGR_PGRAMCODE,
        PGR_MODULCODE,
        PGR_MENNUMBER,
        PGR_PGRAMNAME,
        PGR_SEQUENCED,
        PGR_ENTRYOPER,
        PGR_ENTRYDATE
      ) VALUES (
        :programCode,
        :moduleCode,
        :menuNumber,
        :programName,
        :sequence,
        :entryOper,
        SYSDATE
      )
    `;
    
    await this.execute(sql, {
      programCode: program.PGR_PGRAMCODE,
      moduleCode: program.PGR_MODULCODE,
      menuNumber: program.PGR_MENNUMBER,
      programName: program.PGR_PGRAMNAME,
      sequence: sequence || 1,
      entryOper: program.PGR_ENTRYOPER || 'SYSTEM',
    });

    const createdProgram = await this.findByCode(program.PGR_PGRAMCODE!, program.PGR_MODULCODE!);
    if (!createdProgram) {
      throw new Error('Failed to create program');
    }
    return createdProgram;
  }

  /**
   * Get all programs
   */
  async findAll(): Promise<BHR_PGRAMCODE[]> {
    const sql = `
      SELECT 
        PGR_PGRAMCODE,
        PGR_MODULCODE,
        PGR_MENNUMBER,
        PGR_PGRAMNAME,
        PGR_SEQUENCED,
        PGR_ENTRYOPER,
        PGR_ENTRYDATE,
        PGR_MODFYOPER,
        PGR_MODFYDATE
      FROM ${this.getFullTableName()}
      ORDER BY PGR_MODULCODE, PGR_MENNUMBER, PGR_SEQUENCED
    `;
    
    return await this.query<BHR_PGRAMCODE>(sql);
  }
}

