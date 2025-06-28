import express from 'express';

import WarrantyController from '../controllers';
import { validateData } from '../middleware/validation';
import { createWarrantySchema, searchWarrantySchema } from '../schemas';

export const router = express.Router();

router.get('/', WarrantyController.getWarranty);
router.post('/', validateData(createWarrantySchema), WarrantyController.createWarranty);
router.post('/search', validateData(searchWarrantySchema), WarrantyController.searchWarranty);
