
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Sends an image to the Gemini API to remove handwriting.
 * @param base64ImageData The base64 encoded image data, without the data URL prefix.
 * @returns A promise that resolves to the base64 encoded string of the cleaned image.
 */
export async function cleanImageWithGemini(base64ImageData: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: 'image/png',
            },
          },
          {
            text: 'Remove all handwritten marks, notes, and drawings from this image. Keep only the original printed text, diagrams, and content perfectly intact. Return only the cleaned image.',
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    // Check for safety blocks or other reasons for no response
    if (!response.candidates || response.candidates.length === 0) {
      const blockReason = response.promptFeedback?.blockReason;
      if (blockReason) {
        throw new Error(`Request blocked for safety reasons: ${blockReason}. Please try a different image.`);
      }
      throw new Error("The AI returned an empty response. The image might be invalid or unsupported.");
    }
    
    const firstCandidate = response.candidates[0];
    if (!firstCandidate.content || !firstCandidate.content.parts) {
        throw new Error("The AI response was malformed and did not contain any content parts.");
    }

    // Find the image part in the response
    for (const part of firstCandidate.content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("The AI did not return an image. This can happen if the content is against policy.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      if (error.message.includes('API key not valid')) {
        throw new Error('Your API key is not valid. Please check your configuration.');
      }
       if (error.message.includes('deadline') || error.message.includes('timeout')) {
        throw new Error('The request to the AI service timed out. Please try again.');
      }
      // Re-throw user-friendly errors from the `try` block or other specific SDK errors
      throw error;
    }
    // Fallback for unknown error types
    throw new Error("An unknown error occurred while processing the image with AI.");
  }
}