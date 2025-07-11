import { GoogleGenAI } from "@google/genai";

// Adapted from https://ai.google.dev/gemini-api/docs/google-search#javascript
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const groundingTool = {
  googleSearch: {},
};

const config = {
  tools: [groundingTool],
};

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "What is the current population of Singapore?",
    config,
  });
  console.log(response.text);
}

main();