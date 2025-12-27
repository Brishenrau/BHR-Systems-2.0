import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post(
  '/login',
  AuthController.validateLogin,
  authController.login.bind(authController)
);

router.post('/logout', authController.logout.bind(authController));

// Protected route (requires authentication)
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

export default router;

