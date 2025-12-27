import { GoogleGenAI } from "@google/genai";
import { ScheduledEvent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFunMessage = async (
  currentEvent: ScheduledEvent | undefined,
  timeOfDay: string
): Promise<string> => {
  try {
    const context = currentEvent 
      ? `The current scheduled activity is "${currentEvent.title}".` 
      : `There is no specific scheduled activity right now.`;
    
    const prompt = `
      You are a friendly, magical screen in a kids' playroom. 
      It is currently ${timeOfDay}. ${context}
      
      Generate a very short, fun, 1-sentence fact, joke, or encouraging message for a child (age 5-8). 
      If it's bedtime, make it sleepy. If it's active time, make it energetic.
      Do not use quotes. Just the text. Max 20 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Have a magical day!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Time to play and have fun!";
  }
};
