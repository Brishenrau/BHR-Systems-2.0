import { Request, Response, NextFunction } from 'express';
import { MenuService } from '../services/menu.service';

const menuService = new MenuService();

export class MenuController {
  /**
   * Get user menu endpoint
   */
  async getUserMenu(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get pay number from authenticated user
      const payNumber = req.user?.payNumber;
      
      if (!payNumber) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const menus = await menuService.getUserMenu(payNumber);

      res.json({
        success: true,
        data: menus,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user menu',
      });
    }
  }

  /**
   * Get accessible modules for current user
   */
  async getUserModules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payNumber = req.user?.payNumber;
      
      if (!payNumber) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const modules = await menuService.getUserModules(payNumber);

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

  /**
   * Get menu headers and programs for a specific module
   */
  async getModuleMenus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { moduleCode } = req.params;
      
      if (!moduleCode) {
        res.status(400).json({
          success: false,
          message: 'Module code is required',
        });
        return;
      }

      const menus = await menuService.getModuleMenus(moduleCode);

      res.json({
        success: true,
        data: menus,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get module menus',
      });
    }
  }

  /**
   * Get all programs endpoint
   */
  async getAllPrograms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const programs = await menuService.getAllPrograms();

      res.json({
        success: true,
        data: programs,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get programs',
      });
    }
  }
}

