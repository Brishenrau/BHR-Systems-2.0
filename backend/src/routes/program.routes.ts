import express from 'express';
import { ProgramController } from '../controllers/program.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const programController = new ProgramController();

router.use(authenticate);
router.post('/', programController.createProgram.bind(programController));
router.get('/', programController.getAllPrograms.bind(programController));

export default router;

