import { z } from 'zod/v4';

export const createWarrantySchema = z.object({});

export const searchWarrantySchema = z.object({
  product_name: z.string(),
});
