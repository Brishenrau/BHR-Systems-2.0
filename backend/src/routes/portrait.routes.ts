import express from 'express';
import { PortraitController } from '../controllers/portrait.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const portraitController = new PortraitController();

// All portrait routes require authentication
router.use(authenticate);

router.get('/:payNumber', portraitController.getPortrait.bind(portraitController));

export default router;

