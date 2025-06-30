import { z } from 'zod/v4';

const WarrantySchema: { [key: string]: z.ZodObject } = {
  createWarrantySchema: z.object({
    product_name: z.string(),
    product_categories: z.array(z.string()),
    purchase_date: z.iso.date(),
    expiration_date: z.iso.date(),
  }),

  editWarrantySchema: z.object({
    product_name: z.string(),
    product_categories: z.array(z.string()),
    purchase_date: z.iso.date(),
    expiration_date: z.iso.date(),
  }),

  searchWarrantySchema: z.object({
    product_name: z.string(),
    // product_categories: z.array(z.string()),
  }),
};

export default WarrantySchema;
