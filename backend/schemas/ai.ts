import { z } from 'zod/v4';

const AISchema = {
  recommendation: z.object({
    name: z.string(),
    description: z.string(),
    categories: z.array(z.string()),
    purchase_date: z.iso.date(),
  }),
};

export default AISchema;
