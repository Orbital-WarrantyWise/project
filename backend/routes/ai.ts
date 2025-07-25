import express from 'express';

import AIController from '../controllers/ai';
import { validateData } from '../middleware/validation';
import AISchema from '../schemas/ai';

export const router = express.Router();

router.post('/recommendation', validateData(AISchema.recommendation), AIController.recommendation);
router.post('/ocr', validateData(AISchema.ocrInput), AIController.ocr);
router.post('/ocr2', validateData(AISchema.ocrInput), AIController.ocr2);
