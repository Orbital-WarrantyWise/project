import express from 'express';

import WarrantyController from '../controllers';
import { validateData } from '../middleware/validation';
import WarrantySchema from '../schemas';

export const router = express.Router();

router.get('/', WarrantyController.getWarranties);
router.get('/:warrantyId(\\d+)', WarrantyController.getWarranty);
router.post('/', validateData(WarrantySchema.createWarrantySchema), WarrantyController.createWarranty);
router.put('/:warrantyId(\\d+)', validateData(WarrantySchema.editWarrantySchema), WarrantyController.editWarranty);
router.post('/search', validateData(WarrantySchema.searchWarrantySchema), WarrantyController.searchWarranty);
