import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Gemini to suggest a detailed description and subtasks based on a task title.
 */
export const suggestTaskDetails = async (title: string): Promise<{ description: string; subtasks: string[] }> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Actúa como un experto en productividad. El usuario quiere crear una tarea titulada: "${title}".
    1. Genera una descripción breve pero profesional y clara para esta tarea.
    2. Genera una lista de 3 pasos o subtareas clave para completarla.
    
    Devuelve la respuesta estrictamente en JSON.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: "Una descripción clara y profesional de la tarea."
            },
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 3 pasos accionables para completar la tarea."
            }
          },
          required: ["description", "subtasks"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating task details:", error);
    return {
      description: "No se pudo generar una descripción automática.",
      subtasks: []
    };
  }
};