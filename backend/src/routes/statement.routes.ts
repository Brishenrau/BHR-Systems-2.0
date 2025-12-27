import { Router } from 'express';
import { getStatementByAccount } from '../controllers/statement.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get statement by account number
router.get('/:nomBakaun', getStatementByAccount);

export default router;

