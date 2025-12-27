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

/**
 * Search for account numbers by address or owner name
 * GET /api/v1/statements/search?address=...&ownerName=...
 */
export const searchAccounts = async (req: Request, res: Response) => {
  try {
    const { address, ownerName } = req.query;

    if (!address && !ownerName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either address or ownerName',
      });
    }

    const accountNumbers = await statementService.searchAccounts({
      address: address as string | undefined,
      ownerName: ownerName as string | undefined,
    });
    
    res.json({
      success: true,
      data: accountNumbers,
    });
  } catch (error) {
    console.error('Error searching accounts:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to search accounts',
    });
  }
};

/**
 * Get property and owner details by account number
 * GET /api/v1/statements/:nomBakaun/property
 */
export const getPropertyDetails = async (req: Request, res: Response) => {
  try {
    const nomBakaun = parseInt(req.params.nomBakaun, 10);
    
    if (isNaN(nomBakaun)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account number',
      });
    }

    const propertyDetails = await statementService.getPropertyDetails(nomBakaun);
    
    res.json({
      success: true,
      data: propertyDetails || {},
    });
  } catch (error) {
    console.error('Error fetching property details:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch property details',
    });
  }
};

