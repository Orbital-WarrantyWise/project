import { GoogleGenAI } from '@google/genai';
import { z } from 'zod/v4';

import AISchema from './schemas/ai';

// Adapted from https://ai.google.dev/gemini-api/docs/google-search#javascript
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateRecommendationPrompt = (
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
    const imputedPrompt = generateRecommendationPrompt(product_name, product_description, product_categories, purchase_date);
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

const generateOCRPrompt = () => `
You are an expert OCR AI with access to the internet.

You'll be an image of a receipt or warranty document pertaining to a product that was purchased.

Your objective is to goal is to extract the following information about the product (if available).

1. Name
2. Description
3. Price
4. Purchase Date
5. Warranty/Subscription Duration

You may use the internet to convert product IDs (e.g. SKU12345XA) into product names, or to search for product descriptions. 

However, you must ensure that the information obtained via the internet is accurate, coherent, and consistent with the information available in the image or document. For instance, if you searched the internet for the product ID and found a product with brand X with the same product ID, BUT the receipt shows that the product has brand Y, then you MUST ignore the information obtained from the internet as it's inconsistent with the receipt (i.e. you must treat the receipt as the ground truth, and not the internet).

If certain product information (e.g. name, price, etc.) is unavailable, missing, unclear, or contradictory, that is perfectly acceptable, but you MUST return an empty string corresponding to that field.
`;

async function getOCR({b64Image, mimeType}: z.infer<typeof AISchema.ocrInput>) {
  try {
    const prompt = generateOCRPrompt();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          text: prompt
        },
        {
          inlineData: {
            mimeType: mimeType,
            data: b64Image,
          },
        }
      ],
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

export { getRecommendation, getOCR };
