import { z } from 'zod/v4';

export const createWarrantySchema = z.object({
  product_name: z.string(),
  product_categories: z.array(z.string()),
  purchase_date: z.iso.date(),
  expiration_date: z.iso.date(),
});

export const searchWarrantySchema = z.object({
  product_name: z.string(),
  // product_categories: z.array(z.string()),
});
