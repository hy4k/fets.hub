import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Safely initialize the client only when needed to avoid issues if key is missing during render
const getClient = () => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateProjectDetails = async (name: string, techStack: string): Promise<{ description: string; suggestedFiles: string } | null> => {
  const client = getClient();
  if (!client) return null;

  const prompt = `
    I am building a software project named "${name}" using the following technologies: "${techStack}".
    
    Please provide:
    1. A concise, professional project description (max 2 sentences).
    2. A recommended file folder structure for this type of project.
  `;

  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            suggestedFiles: { type: Type.STRING, description: "A simple text representation of a file tree structure" }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;

  } catch (error) {
    console.error("Error generating project details:", error);
    return null;
  }
};
