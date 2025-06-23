import express from 'express';
import WarrantyController from '../controllers';
import { validateData } from '../middleware/validation';
import { searchWarrantySchema } from '../schemas';

export const router = express.Router();

router.get('/', WarrantyController.getWarranty);
router.post('/', WarrantyController.createWarranty);
router.post('/search', validateData(searchWarrantySchema), WarrantyController.searchWarranty);
