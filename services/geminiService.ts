
import { GoogleGenAI, Type } from "@google/genai";
import { Asset } from "../types.ts";

const extractJson = (str: string): any => {
  if (!str) return null;
  let cleaned = str.replace(/```json\s?|\s?```/g, '').trim();
  const arrayStart = cleaned.indexOf('[');
  const arrayEnd = cleaned.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    cleaned = cleaned.substring(arrayStart, arrayEnd + 1);
  } else {
    const objectStart = cleaned.indexOf('{');
    const objectEnd = cleaned.lastIndexOf('}');
    if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
      cleaned = cleaned.substring(objectStart, objectEnd + 1);
    }
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
};

export const getPortfolioInsights = async (assets: Asset[]) => {
  if (assets.length === 0) return "Ajoutez des actifs pour recevoir une analyse personnalisée.";
  
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    return "Analyse IA indisponible : La clé API n'est pas configurée dans les paramètres Vercel.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const portfolioSummary = assets.map(a => `${a.name} (${a.category}): ${a.value}€`).join(", ");
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyse ce portefeuille d'investissement et fournis 3-4 points d'analyse professionnels et concis en français.
      Portefeuille: ${portfolioSummary}. Répondez uniquement en points de liste.`,
    });

    return response.text || "Analyse indisponible.";
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return "Erreur lors de la génération des conseils IA.";
  }
};

export interface HealthScoreResult {
  id: string;
  score: number;
  reasoning: string;
  metrics: {
    volatility: number;
    correlation: number;
    macroResilience: number;
  };
}

export const getAssetHealthScores = async (assets: Asset[]): Promise<HealthScoreResult[]> => {
  if (assets.length === 0) return [];
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") return [];

  try {
    const ai = new GoogleGenAI({ apiKey });
    const assetDataForAi = assets.map(a => ({ id: a.id, name: a.name, category: a.category, value: a.value }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Évalue la santé financière de chaque actif: ${JSON.stringify(assetDataForAi)}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              score: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              metrics: {
                type: Type.OBJECT,
                properties: {
                  volatility: { type: Type.NUMBER },
                  correlation: { type: Type.NUMBER },
                  macroResilience: { type: Type.NUMBER }
                },
                required: ["volatility", "correlation", "macroResilience"]
              }
            },
            required: ["id", "score", "reasoning", "metrics"]
          }
        }
      }
    });

    const result = extractJson(response.text || "[]");
    return Array.isArray(result) ? result : [];
  } catch (e) {
    return [];
  }
};

export const syncMarketPrices = async (assets: Asset[]) => {
  const assetsToSync = assets.filter(a => a.category === 'Stocks' || a.category === 'Crypto');
  if (assetsToSync.length === 0) return { updates: [], sources: [] };

  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") throw new Error("Clé API manquante.");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Trouve le PRIX UNITAIRE actuel en EURO pour: ${assetsToSync.map(a => `${a.name} (ID: ${a.id})`).join(", ")}. 
    Réponds uniquement au format JSON: [{"id": "...", "unitPrice": 0.0, "change24h": 0.0}].`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });

    const result = extractJson(response.text || "[]");
    return { updates: Array.isArray(result) ? result : [], sources: [] };
  } catch (error) {
    throw error;
  }
};
