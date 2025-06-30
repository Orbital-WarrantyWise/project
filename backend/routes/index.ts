import express from 'express';

import WarrantyController from '../controllers';
import { validateData } from '../middleware/validation';
import WarrantySchema from '../schemas';

export const router = express.Router();

// TODO: Add regex check for warrantyId to ensure it is a valid integer

router.get('/', WarrantyController.getWarranties);
router.get('/:warrantyId', WarrantyController.getWarranty);
router.post('/', validateData(WarrantySchema.createWarrantySchema), WarrantyController.createWarranty);
router.put('/:warrantyId', validateData(WarrantySchema.editWarrantySchema), WarrantyController.editWarranty);
router.post('/search', validateData(WarrantySchema.searchWarrantySchema), WarrantyController.searchWarranty);
