
import { GoogleGenAI, Type } from "@google/genai";
import { Asset } from "../types.ts";

/**
 * Valide et récupère la clé API.
 * Gère les cas où Vercel n'injecte pas correctement la variable dans le contexte browser.
 */
const getSafeApiKey = (): string | null => {
  const key = process.env.API_KEY;
  if (!key || key === "undefined" || key === "null" || key.trim() === "") {
    return null;
  }
  return key;
};

const handleAiError = (error: any): string => {
  console.error("ZenIA Debug Log:", error);
  const msg = error?.message || String(error);
  
  if (msg.includes("API key expired") || msg.includes("API_KEY_INVALID") || msg.includes("400")) {
    return "⚠️ Clé API expirée ou invalide. Veuillez renouveler votre clé sur Google AI Studio et redéployer sur Vercel.";
  }
  if (msg.includes("API Key must be set") || msg.includes("not found")) {
    return "⚙️ Configuration manquante : La variable d'environnement API_KEY n'est pas accessible par le navigateur. Vérifiez vos réglages Vercel.";
  }
  if (msg.includes("429") || msg.includes("quota")) {
    return "⏳ Quota IA épuisé. Réessayez dans quelques minutes.";
  }
  return "L'analyse IA est momentanément indisponible.";
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
  
  const apiKey = getSafeApiKey();
  if (!apiKey) return "Configuration Requise : La clé API Gemini n'est pas détectée. Assurez-vous d'avoir ajouté 'API_KEY' dans les variables d'environnement Vercel et d'avoir redéployé.";

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
  const apiKey = getSafeApiKey();
  if (!apiKey) return [];

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
    console.error("Health Score Error:", e);
    return [];
  }
};

export const syncMarketPrices = async (assets: Asset[]) => {
  const assetsToSync = assets.filter(a => a.category === 'Stocks' || a.category === 'Crypto');
  if (assetsToSync.length === 0) return { updates: [] };
  
  const apiKey = getSafeApiKey();
  if (!apiKey) throw new Error("Clé API absente de la configuration.");

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
