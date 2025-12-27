import { Request, Response, NextFunction } from 'express';
import { MenuHeaderService } from '../services/menuHeader.service';

const menuHeaderService = new MenuHeaderService();

export class MenuHeaderController {
  async createMenuHeader(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payNumber = req.user?.payNumber;
      if (!payNumber) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { MEN_MENNUMBER, MEN_MENHEADER } = req.body;

      if (!MEN_MENHEADER) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: MEN_MENHEADER',
        });
        return;
      }

      if (MEN_MENHEADER.length > 20) {
        res.status(400).json({
          success: false,
          message: 'Menu header must be 20 characters or less',
        });
        return;
      }

      const menuHeader = await menuHeaderService.createMenuHeader(
        {
          MEN_MENNUMBER: MEN_MENNUMBER ? Number(MEN_MENNUMBER) : undefined,
          MEN_MENHEADER: MEN_MENHEADER.trim(),
        },
        payNumber
      );

      res.status(201).json({
        success: true,
        data: menuHeader,
        message: 'Menu header created successfully',
      });
    } catch (error: any) {
      console.error('Error creating menu header:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create menu header',
      });
    }
  }

  async getAllMenuHeaders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const menuHeaders = await menuHeaderService.getAllMenuHeaders();
      res.json({
        success: true,
        data: menuHeaders,
      });
    } catch (error: any) {
      console.error('Error getting menu headers:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get menu headers',
      });
    }
  }
}

