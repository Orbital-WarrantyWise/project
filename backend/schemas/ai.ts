import { z } from 'zod/v4';

const AISchema = {
  recommendation: z.object({
    product_name: z.string(),
    product_description: z.string(),
    product_categories: z.array(z.string()),
    purchase_date: z.iso.date(),
  }),

  ocrInput: z.object({
    imageUrl: z.string(),
  }),

  ocrOutput: z.object({
    product_name: z.string().describe('Human-friendly name of the product'),
    product_description: z.string().describe('Brief description of the product'),
    product_price: z.string().describe('Price of the product'),
    purchase_date: z.string().datetime().describe('Purchase date of the product'), // Cannot use z.iso.date()
    warranty_duration: z.string().describe('Warranty/subscription duration of the product'),
  }),
};

export default AISchema;
