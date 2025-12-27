import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { body, validationResult } from 'express-validator';
import type { LoginRequest } from '../types/api.types';

const authService = new AuthService();

export class AuthController {
  /**
   * Login validation rules
   */
  static validateLogin = [
    body('payNumber')
      .trim()
      .notEmpty()
      .withMessage('Pay number is required')
      .isLength({ min: 1, max: 12 })
      .withMessage('Pay number must be between 1 and 12 characters'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ];

  /**
   * Login endpoint
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const credentials: LoginRequest = {
        payNumber: req.body.payNumber,
        password: req.body.password,
      };

      const result = await authService.login(credentials);

      res.json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  /**
   * Logout endpoint
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // In a stateless JWT system, logout is handled client-side
      // You could implement token blacklisting here if needed
      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Logout failed',
      });
    }
  }

  /**
   * Get current user endpoint
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'No token provided',
        });
        return;
      }

      const token = authHeader.substring(7);
      const user = await authService.getCurrentUser(token);

      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Failed to get user',
      });
    }
  }
}

