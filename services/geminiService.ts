
import { GoogleGenAI, Modality } from "@google/genai";
import type { ImageState } from '../types';

export const editImageWithPrompt = async (
  image: ImageState,
  prompt: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: image.base64,
              mimeType: image.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image was generated in the response.");

  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to edit image with Gemini. Please check the console for details.");
  }
};
