import express from 'express';
import { MenuHeaderController } from '../controllers/menuHeader.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const menuHeaderController = new MenuHeaderController();

router.use(authenticate);
router.post('/', menuHeaderController.createMenuHeader.bind(menuHeaderController));
router.get('/', menuHeaderController.getAllMenuHeaders.bind(menuHeaderController));
router.delete('/:menuNumber', menuHeaderController.deleteMenuHeader.bind(menuHeaderController));

export default router;

