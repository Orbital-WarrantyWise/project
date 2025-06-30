import express from 'express';

import WarrantyController from '../controllers';
import { validateData } from '../middleware/validation';
import { createWarrantySchema, editWarrantySchema, searchWarrantySchema } from '../schemas';

export const router = express.Router();

router.get('/', WarrantyController.getWarranty);
router.post('/', validateData(createWarrantySchema), WarrantyController.createWarranty);
router.put('/:warrantyId(\\d+)', validateData(editWarrantySchema), WarrantyController.editWarranty);
router.post('/search', validateData(searchWarrantySchema), WarrantyController.searchWarranty);
