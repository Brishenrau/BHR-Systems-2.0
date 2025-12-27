import { ProgramRepository } from '../repositories/ProgramRepository';
import type { BHR_PGRAMCODE } from '../types/database.types';

export class ProgramService {
  private programRepository = new ProgramRepository();

  async createProgram(
    program: {
      PGR_PGRAMCODE: string;
      PGR_MODULCODE: string;
      PGR_MENNUMBER: number;
      PGR_PGRAMNAME: string;
      PGR_SEQUENCED?: number;
    },
    entryOper: string
  ): Promise<BHR_PGRAMCODE> {
    return await this.programRepository.create({
      ...program,
      PGR_ENTRYOPER: entryOper,
    });
  }

  async getAllPrograms(): Promise<BHR_PGRAMCODE[]> {
    return await this.programRepository.findAll();
  }
}

