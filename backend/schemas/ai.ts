import { z } from 'zod/v4';

const NullableDatetime = z.union([
  z.literal(""),
  z.string().datetime(),  // Cannot use z.iso.date()
])

const AISchema = {
  recommendation: z.object({
    name: z.string(),
    description: z.string(),
    categories: z.array(z.string()),
    price: z.number(),
    purchase_date: z.iso.date(),
  }),

  ocrInput: z.object({
    imageUrl: z.string(),
  }),

  ocrOutput: z.object({
    product_name: z.string().describe('Human-friendly name of the product'),
    product_description: z.string().describe('Brief description of the product'),
    product_price: z.string().describe('Price of the product'),
    purchase_date: NullableDatetime.describe('Purchase date of the product'),
    expiration_date: NullableDatetime.describe("Expiration date of the product's warranty/subscription"),
  }),
};

export default AISchema;
