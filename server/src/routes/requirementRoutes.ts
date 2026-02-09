import { Router } from 'express';
import * as requirementController from '../controllers/requirementController';

const router = Router();

// Requirements routes
router.get('/', requirementController.getAllRequirements);

export default router;
