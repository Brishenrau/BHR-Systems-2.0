import { Router } from 'express';
import { getStatementByAccount, searchAccounts, getPropertyDetails, sendStatementEmail } from '../controllers/statement.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Search for accounts
router.get('/search', searchAccounts);

// Send statement via email
router.post('/:nomBakaun/email', sendStatementEmail);

// Get property details by account number
router.get('/:nomBakaun/property', getPropertyDetails);

// Get statement by account number
router.get('/:nomBakaun', getStatementByAccount);

export default router;

