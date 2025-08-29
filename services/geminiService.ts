import { GoogleGenAI } from "@google/genai";
import { Gender } from "../types";

// Ensure you have your API key set in your environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: apiKey! });

export const generateBackstory = async (race: string, playerClass: string, name: string, gender: Gender): Promise<string> => {
  if (!apiKey) {
    return "The void of space is silent about this one's past... (API key not configured)";
  }
  const prompt = `Create a short, one-paragraph backstory for a futuristic space gladiator character in a game.
  
  Name: ${name}
  Gender: ${gender}
  Race: ${race}
  Class: ${playerClass}
  
  The tone should be gritty, concise, and fit a sci-fi universe. Focus on what led them to the gladiator arena.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating backstory:", error);
    return "The chronicles of this warrior are lost in cosmic static...";
  }
};