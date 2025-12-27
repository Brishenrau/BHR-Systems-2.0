import express from 'express';
import { ModuleController } from '../controllers/module.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();
const moduleController = new ModuleController();

router.post('/', authenticateToken, moduleController.createModule.bind(moduleController));
router.get('/', authenticateToken, moduleController.getAllModules.bind(moduleController));

export default router;

