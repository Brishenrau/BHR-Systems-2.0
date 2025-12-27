import { Request, Response, NextFunction } from 'express';
import { ModuleService } from '../services/module.service';

const moduleService = new ModuleService();

export class ModuleController {
  /**
   * Create a new module
   */
  async createModule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payNumber = req.user?.payNumber;
      
      if (!payNumber) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { MOD_MODULCODE, MOD_MODULNAME, MOD_STATUSFLG } = req.body;

      if (!MOD_MODULCODE || !MOD_MODULNAME) {
        res.status(400).json({
          success: false,
          message: 'Module code and module name are required',
        });
        return;
      }

      const module = await moduleService.createModule(
        {
          MOD_MODULCODE,
          MOD_MODULNAME,
          MOD_STATUSFLG: MOD_STATUSFLG || 'Y',
        },
        payNumber
      );

      res.status(201).json({
        success: true,
        data: module,
        message: 'Module created successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create module',
      });
    }
  }

  /**
   * Get all modules (for admin)
   */
  async getAllModules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const modules = await moduleService.getAllModules();

      res.json({
        success: true,
        data: modules,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get modules',
      });
    }
  }
}

