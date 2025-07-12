import { z } from 'zod/v4';

const AISchema = {
  recommendation: z.object({
    product_name: z.string(),
    product_description: z.string(),
    product_categories: z.array(z.string()),
    purchase_date: z.iso.date(),
  }),
};

export default AISchema;
