import { GoogleGenAI } from "@google/genai";

// Ensure API key is present
const apiKey = process.env.API_KEY || '';
if (!apiKey) {
  console.error("API Key is missing from process.env.API_KEY");
}

const ai = new GoogleGenAI({ apiKey });

// Helper for exponential backoff retry
const retryOperation = async <T>(operation: () => Promise<T>, retries = 5, delay = 2000): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    const isRateLimit = 
      error?.status === 429 || 
      error?.status === 'RESOURCE_EXHAUSTED' || 
      error?.response?.status === 429 ||
      error?.message?.includes('429') || 
      error?.message?.includes('quota') ||
      error?.message?.includes('RESOURCE_EXHAUSTED');

    if (retries > 0 && isRateLimit) {
      console.warn(`Rate limit hit. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const generateText = async (prompt: string, isJSON: boolean = false) => {
  return retryOperation(async () => {
    try {
      const config = isJSON ? { responseMimeType: "application/json" } : undefined;
      
      // Using gemini-2.5-flash for text/JSON tasks
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: config
      });

      const text = response.text;
      if (!text) throw new Error("No content generated");
      
      return isJSON ? JSON.parse(text) : text;
    } catch (error) {
      console.error("AI Text Generation Failed:", error);
      throw error;
    }
  });
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  return retryOperation(async () => {
    try {
      // Using imagen-4.0-generate-001 for image generation via SDK
      const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: prompt,
          config: {
            numberOfImages: 1,
            aspectRatio: '1:1',
            outputMimeType: 'image/jpeg'
          },
      });

      // Extract base64
      const base64 = response.generatedImages?.[0]?.image?.imageBytes;
      
      if (!base64) throw new Error("No image generated");
      
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error("AI Image Generation Failed:", error);
      return null; 
    }
  });
};