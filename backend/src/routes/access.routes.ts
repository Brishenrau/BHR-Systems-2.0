import express from 'express';
import { AccessController } from '../controllers/access.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const accessController = new AccessController();

// All access routes require authentication
router.use(authenticate);

router.get('/user/:payNumber', accessController.getUserAccess.bind(accessController));
router.put('/user/:payNumber', accessController.updateUserAccess.bind(accessController));

export default router;

