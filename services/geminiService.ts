
import { GoogleGenAI, Type } from "@google/genai";
import { Asset } from "../types.ts";

const handleAiError = (error: any): string => {
  console.error("Gemini AI Error Trace:", error);
  const msg = error?.message || String(error);
  
  if (msg.includes("API key expired") || msg.includes("API_KEY_INVALID") || msg.includes("400")) {
    return "⚠️ Action Requise : Votre clé API Gemini a expiré ou est invalide. Veuillez générer une nouvelle clé sur Google AI Studio et la mettre à jour dans vos variables d'environnement Vercel.";
  }
  if (msg.includes("429") || msg.includes("quota") || msg.includes("rate limit")) {
    return "⏳ Limite atteinte : Le quota gratuit de l'IA est épuisé. Veuillez réessayer dans quelques minutes.";
  }
  return "L'analyse IA est temporairement indisponible (vérifiez votre connexion ou votre clé API).";
};

const extractJson = (str: string): any => {
  if (!str) return null;
  try {
    let cleaned = str.replace(/```json\s?|\s?```/g, '').trim();
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start !== -1 && end !== -1) cleaned = cleaned.substring(start, end + 1);
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
};

export const getPortfolioInsights = async (assets: Asset[]) => {
  if (assets.length === 0) return "Ajoutez des actifs pour recevoir une analyse personnalisée.";
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey === "") return "Clé API non configurée.";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const summary = assets.map(a => `${a.name}: ${a.value}€`).join(", ");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Expert financier. Analyse ce portefeuille et donne 3 conseils courts : ${summary}. Réponds en français, liste à puces.`,
    });
    return response.text || "Analyse indisponible.";
  } catch (error) {
    return handleAiError(error);
  }
};

export interface HealthScoreResult {
  id: string;
  score: number;
  reasoning: string;
  metrics: { volatility: number; correlation: number; macroResilience: number; };
}

export const getAssetHealthScores = async (assets: Asset[]): Promise<HealthScoreResult[]> => {
  if (assets.length === 0) return [];
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") return [];

  try {
    const ai = new GoogleGenAI({ apiKey });
    const data = assets.map(a => ({ id: a.id, name: a.name, value: a.value }));
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Score de santé (0-100) pour ces actifs: ${JSON.stringify(data)}.`,
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
    return extractJson(response.text) || [];
  } catch (e) {
    return [];
  }
};

export const syncMarketPrices = async (assets: Asset[]) => {
  const assetsToSync = assets.filter(a => a.category === 'Stocks' || a.category === 'Crypto');
  if (assetsToSync.length === 0) return { updates: [] };
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") throw new Error("Clé API absente.");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Prix actuel (€) pour: ${assetsToSync.map(a => a.name).join(", ")}. Format JSON: [{"name": "...", "unitPrice": 0.0, "change24h": 0.0}]`,
      config: { tools: [{ googleSearch: {} }] }
    });
    const result = extractJson(response.text);
    const updates = (result || []).map((u: any) => {
      const asset = assetsToSync.find(a => a.name.toLowerCase().includes(u.name.toLowerCase()));
      return asset ? { id: asset.id, unitPrice: u.unitPrice, change24h: u.change24h } : null;
    }).filter(Boolean);
    return { updates };
  } catch (error) {
    throw new Error(handleAiError(error));
  }
};
