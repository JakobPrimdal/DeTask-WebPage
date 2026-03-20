import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function fetchGeminiIdeas(previousIdeas = []) {
  // If previousIdeas is provided, ask for new ideas not in that list
  let prompt = "List 10 creative, fun, and modern event ideas for a workplace team. Only return a numbered list of event titles, no explanations or reasoning.";
  if (previousIdeas.length > 0) {
    prompt = `List 10 new, creative, fun, and modern event ideas for a workplace team that are different from these: ${previousIdeas.join(", ")}. Only return a numbered list of event titles, no explanations or reasoning.`;
  }
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { temperature: 0.7 }
  });
  // The SDK returns a response object; extract text as needed
  return response.text
    .split(/\n|\r/)
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
}

// Simple API helper for GET requests
const apiService = {
  async get(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    return res.json();
  }
};

export default apiService;
