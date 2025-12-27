import express from 'express';
import { ModuleController } from '../controllers/module.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const moduleController = new ModuleController();

// All module routes require authentication
router.use(authenticate);

router.post('/', moduleController.createModule.bind(moduleController));
router.get('/', moduleController.getAllModules.bind(moduleController));

export default router;

