
import { GoogleGenAI, Type } from "@google/genai";
import { Asset } from "../types.ts";

const extractJson = (str: string): any => {
  if (!str) return null;
  // Nettoyage Markdown
  let cleaned = str.replace(/```json\s?|\s?```/g, '').trim();
  
  // Si Gemini a ajouté du texte avant ou après, on cherche les bornes du JSON
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
    console.error("JSON Parse Error on string:", cleaned);
    return null;
  }
};

export const getPortfolioInsights = async (assets: Asset[]) => {
  if (assets.length === 0) return "Ajoutez des actifs pour recevoir une analyse personnalisée.";
  
  // Fix: Directly use process.env.API_KEY in the constructor according to guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const portfolioSummary = assets.map(a => `${a.name} (${a.category}): ${a.value}€`).join(", ");
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyse ce portefeuille d'investissement et fournis 3-4 points d'analyse professionnels et concis en français. Soyez critique si nécessaire.
      Portefeuille: ${portfolioSummary}. 
      Inclus des perspectives sur la diversification, le profil de risque actuel et des suggestions d'optimisation. Répondez uniquement en points de liste.`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Analyse indisponible.";
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return "L'intelligence artificielle est temporairement indisponible.";
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

  // Fix: Always use direct process.env.API_KEY initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const assetDataForAi = assets.map(a => ({
    id: a.id,
    name: a.name,
    category: a.category,
    value: a.value
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Évalue la santé financière de chaque actif de ce portefeuille. Attribue un score de 0 à 100 basé sur les fondamentaux actuels du marché.
      Actifs: ${JSON.stringify(assetDataForAi)}.`,
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
    console.error("Health Scores AI Error:", e);
    return [];
  }
};

/**
 * Utilise Google Search pour récupérer les prix UNITAIRES actuels des actifs
 */
export const syncMarketPrices = async (assets: Asset[]) => {
  const assetsToSync = assets.filter(a => a.category === 'Stocks' || a.category === 'Crypto');
  if (assetsToSync.length === 0) return { updates: [], sources: [] };

  // Fix: Directly use process.env.API_KEY in the constructor according to guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Trouve le PRIX UNITAIRE actuel en EURO (pour 1 unité de l'actif) pour les positions suivantes. 
  Il est crucial de donner le prix le plus récent possible.
  Réponds uniquement au format JSON: [{"id": "...", "unitPrice": 0.0, "change24h": 0.0}].
  Actifs à chercher: ${assetsToSync.map(a => `${a.name} (ID: ${a.id})`).join(", ")}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const result = extractJson(response.text || "[]");
    const updates = Array.isArray(result) ? result : [];
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { updates, sources };
  } catch (error) {
    console.error("Market Sync Error:", error);
    throw error;
  }
};
