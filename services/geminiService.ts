
import { GoogleGenAI, Type } from "@google/genai";
import { Asset } from "../types.ts";

/**
 * Instancie l'IA au moment de l'appel pour utiliser la clé sélectionnée via window.aistudio.
 * Le modèle gemini-3-pro-preview est utilisé pour une analyse de qualité supérieure.
 */
const getAi = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("AI_NOT_CONFIGURED");
  }
  return new GoogleGenAI({ apiKey });
};

const handleAiError = (error: any): string => {
  if (error?.message === "AI_NOT_CONFIGURED") {
    return "Configuration Requise : Cliquez sur 'Activer ZenIA' pour connecter votre clé API.";
  }
  const msg = error?.message || String(error);
  if (msg.includes("API key expired") || msg.includes("401") || msg.includes("invalid")) {
    return "⚠️ Clé expirée. Cliquez sur le bouton d'activation pour la renouveler.";
  }
  return "L'analyse IA est temporairement indisponible.";
};

const extractJson = (str: string): any => {
  if (!str) return null;
  try {
    let cleaned = str.replace(/```json\s?|\s?```/g, '').trim();
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start !== -1 && end !== -1) cleaned = cleaned.substring(start, end + 1);
    return JSON.parse(cleaned);
  } catch (e) { return null; }
};

export const getPortfolioInsights = async (assets: Asset[]) => {
  if (assets.length === 0) return "Ajoutez des actifs pour commencer l'analyse.";
  try {
    const ai = getAi();
    const summary = assets.map(a => `${a.name}: ${a.value}€`).join(", ");
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Tu es un expert en gestion de patrimoine. Analyse ce portefeuille : ${summary}. Donne 3 conseils stratégiques courts en français.`,
    });
    return response.text || "Analyse indisponible.";
  } catch (error) { return handleAiError(error); }
};

export interface HealthScoreResult {
  id: string;
  score: number;
  reasoning: string;
  metrics: { volatility: number; correlation: number; macroResilience: number; };
}

export const getAssetHealthScores = async (assets: Asset[]): Promise<HealthScoreResult[]> => {
  if (assets.length === 0) return [];
  try {
    const ai = getAi();
    const data = assets.map(a => ({ id: a.id, name: a.name, value: a.value }));
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Attribue un score de santé (0-100) à ces actifs: ${JSON.stringify(data)}.`,
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
  } catch { return []; }
};

export const syncMarketPrices = async (assets: Asset[]) => {
  const assetsToSync = assets.filter(a => a.category === 'Stocks' || a.category === 'Crypto');
  if (assetsToSync.length === 0) return { updates: [] };
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Trouve le prix actuel (€) et la variation 24h (%) pour ces actifs: ${assetsToSync.map(a => a.name).join(", ")}. Réponds en JSON: [{"name": "...", "unitPrice": 0.0, "change24h": 0.0}]`,
      config: { tools: [{ googleSearch: {} }] }
    });
    const result = extractJson(response.text);
    return { 
      updates: (result || []).map((u: any) => {
        const asset = assetsToSync.find(a => a.name.toLowerCase().includes(u.name.toLowerCase()));
        return asset ? { id: asset.id, unitPrice: u.unitPrice, change24h: u.change24h } : null;
      }).filter(Boolean)
    };
  } catch (error) { throw new Error(handleAiError(error)); }
};
