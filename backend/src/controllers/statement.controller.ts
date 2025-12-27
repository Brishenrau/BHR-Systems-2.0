import { Request, Response } from 'express';
import { StatementService } from '../services/statement.service';

const statementService = new StatementService();

/**
 * Get statement by account number
 * GET /api/v1/statements/:nomBakaun
 */
export const getStatementByAccount = async (req: Request, res: Response) => {
  try {
    const nomBakaun = parseInt(req.params.nomBakaun, 10);
    
    if (isNaN(nomBakaun)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account number',
      });
    }

    const result = await statementService.getStatementByAccount(nomBakaun);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching statement:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch statement',
    });
  }
};

