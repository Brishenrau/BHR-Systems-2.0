import { Request, Response, NextFunction } from 'express';
import { ProgramService } from '../services/program.service';

const programService = new ProgramService();

export class ProgramController {
  async createProgram(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payNumber = req.user?.payNumber;
      if (!payNumber) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { PGR_PGRAMCODE, PGR_MODULCODE, PGR_MENNUMBER, PGR_PGRAMNAME, PGR_SEQUENCED } = req.body;

      if (!PGR_PGRAMCODE || !PGR_MODULCODE || !PGR_MENNUMBER || !PGR_PGRAMNAME) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: PGR_PGRAMCODE, PGR_MODULCODE, PGR_MENNUMBER, PGR_PGRAMNAME',
        });
        return;
      }

      const program = await programService.createProgram(
        {
          PGR_PGRAMCODE: PGR_PGRAMCODE.trim().toUpperCase(),
          PGR_MODULCODE: PGR_MODULCODE.trim().toUpperCase(),
          PGR_MENNUMBER: Number(PGR_MENNUMBER),
          PGR_PGRAMNAME: PGR_PGRAMNAME.trim(),
          PGR_SEQUENCED: PGR_SEQUENCED ? Number(PGR_SEQUENCED) : undefined,
        },
        payNumber
      );

      res.status(201).json({
        success: true,
        data: program,
        message: 'Program created successfully',
      });
    } catch (error: any) {
      console.error('Error creating program:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create program',
      });
    }
  }

  async getAllPrograms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const programs = await programService.getAllPrograms();
      res.json({
        success: true,
        data: programs,
      });
    } catch (error: any) {
      console.error('Error getting programs:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get programs',
      });
    }
  }
}

