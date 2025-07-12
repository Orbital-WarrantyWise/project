import express from 'express';

import AIController from '../controllers/ai';
import { validateData } from '../middleware/validation';
import AISchema from '../schemas/ai';

export const router = express.Router();

router.post('/recommendation', validateData(AISchema.recommendation), AIController.recommendation);
