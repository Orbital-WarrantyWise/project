import { GoogleGenAI } from '@google/genai';
import { z } from 'zod/v4';

import AISchema from './schemas/ai';

// Adapted from https://ai.google.dev/gemini-api/docs/google-search#javascript
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generatePrompt = (
  product_name: string,
  product_description: string,
  product_categories: string[],
  purchase_date: string,
) => `
You are an expert product recommendation AI with access to the internet.

Your objective is to help users identify relevant replacement products when their product's warranty is about to expire.

The following are the details of the user's product:
- Product Name: ${product_name}
- Product Description: ${product_description}
- Product Categories: ${product_categories}
- Purchase Date: ${purchase_date}

Your job is to search the internet for similar replacement products (up to 7 products) based on the following guidelines:
1. Use only up-to-date and reputable sources (e.g. major retailers, manufacturer websites, etc.)
2. If the original product is discontinued or outdated, try to also include its successor products (if any).
3. Aim to provide a range of options across different price points and brands.

For each replacement product, extract the following information:
- Product Name
- Product Description (including features, similarities and differences, etc.)
- Brand/Manufacturer
- Price (in SGD)
- Warranty/Subscription Duration (if applicable)
- Product URL (e.g. https://website.com)
`;

async function getRecommendation({
  product_name,
  product_description,
  product_categories,
  purchase_date,
}: z.infer<typeof AISchema.recommendation>) {
  try {
    const imputedPrompt = generatePrompt(product_name, product_description, product_categories, purchase_date);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: imputedPrompt,
      config: {
        tools: [
          {
            googleSearch: {},
          },
        ],
      },
    });
    return { data: response.text, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export default getRecommendation;
