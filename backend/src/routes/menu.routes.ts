import express from 'express';
import { MenuController } from '../controllers/menu.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const menuController = new MenuController();

// All menu routes require authentication
router.use(authenticate);

router.get('/user-menu', menuController.getUserMenu.bind(menuController));
router.get('/programs', menuController.getAllPrograms.bind(menuController));

export default router;

