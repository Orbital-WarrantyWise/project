import express from 'express';

import InviteController from '../controllers/invite';
import { validateData } from '../middleware/validation';
import InviteSchema from '../schemas/invite';

export const router = express.Router();

router.post('/', validateData(InviteSchema.invite), InviteController.invite);
