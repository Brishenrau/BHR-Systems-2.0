import { Router } from 'express';
import { getStatementByAccount, searchAccounts } from '../controllers/statement.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Search for accounts
router.get('/search', searchAccounts);

// Get statement by account number
router.get('/:nomBakaun', getStatementByAccount);

export default router;

