import { Request, Response, NextFunction } from 'express';
import { AccessService } from '../services/access.service';

const accessService = new AccessService();

export class AccessController {
  /**
   * Get user access information
   */
  async getUserAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { payNumber } = req.params;
      const currentUserPayNumber = req.user?.payNumber;

      if (!currentUserPayNumber) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!payNumber) {
        res.status(400).json({
          success: false,
          message: 'Pay number is required',
        });
        return;
      }

      const data = await accessService.getUserAccess(payNumber);

      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user access',
      });
    }
  }

  /**
   * Update user module access
   */
  async updateUserAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { payNumber } = req.params;
      const { accessString } = req.body;
      const modifierPayNumber = req.user?.payNumber;

      if (!modifierPayNumber) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!payNumber) {
        res.status(400).json({
          success: false,
          message: 'Pay number is required',
        });
        return;
      }

      if (!accessString || typeof accessString !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Access string is required',
        });
        return;
      }

      const access = await accessService.updateUserAccess(
        payNumber,
        accessString,
        modifierPayNumber
      );

      res.json({
        success: true,
        data: access,
        message: 'User access updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update user access',
      });
    }
  }
}

