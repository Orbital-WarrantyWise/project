import express from 'express';
import WarrantyController from '../controllers';

export const router = express.Router();

router.get('/', WarrantyController.getWarranty);
router.post('/', WarrantyController.createWarranty);
