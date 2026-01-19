
import { Asset, AssetCategory } from "../types.ts";

/**
 * Moteur Stratégique ZenWealth (Algorithmique - Pas de clé API requise)
 * Remplace l'IA cloud par des calculs financiers locaux.
 */

export interface HealthScoreResult {
  id: string;
  score: number;
  reasoning: string;
  metrics: { volatility: number; correlation: number; macroResilience: number; };
}

export const getPortfolioInsights = async (assets: Asset[]): Promise<string> => {
  if (assets.length === 0) return "Ajoutez des actifs pour recevoir une analyse stratégique.";
  
  const total = assets.reduce((sum, a) => sum + a.value, 0);
  const cryptoWeight = (assets.filter(a => a.category === AssetCategory.CRYPTO).reduce((sum, a) => sum + a.value, 0) / total) * 100;
  const cashWeight = (assets.filter(a => a.category === AssetCategory.CASH).reduce((sum, a) => sum + a.value, 0) / total) * 100;
  
  const insights = [];
  
  // Règle de diversification Crypto
  if (cryptoWeight > 20) {
    insights.push(`⚠️ Votre exposition Crypto est de ${cryptoWeight.toFixed(1)}%. C'est élevé. Envisagez de sécuriser des profits vers des actifs plus stables.`);
  } else if (cryptoWeight > 0) {
    insights.push(`✅ Votre exposition Crypto (${cryptoWeight.toFixed(1)}%) est bien maîtrisée pour un profil équilibré.`);
  }

  // Règle de liquidité (Matelas de sécurité)
  if (cashWeight < 5) {
    insights.push(`💡 Votre épargne de précaution est faible (${cashWeight.toFixed(1)}%). Visez au moins 3 à 6 mois de dépenses en Cash.`);
  }

  // Analyse de la granularité
  if (assets.length < 5) {
    insights.push(`🔍 Portefeuille peu diversifié (${assets.length} lignes). Multiplier les supports réduit votre risque spécifique.`);
  } else {
    insights.push(`🌟 Excellente granularité. Vos ${assets.length} positions offrent une bonne base de diversification.`);
  }

  return insights.join("\n");
};

export const getAssetHealthScores = async (assets: Asset[]): Promise<HealthScoreResult[]> => {
  return assets.map(asset => {
    let score = 70; // Score de base
    const metrics = { volatility: 50, correlation: 50, macroResilience: 50 };

    switch (asset.category) {
      case AssetCategory.CRYPTO:
        score = 45;
        metrics.volatility = 90;
        metrics.macroResilience = 30;
        break;
      case AssetCategory.STOCKS:
        score = 75;
        metrics.volatility = 60;
        metrics.macroResilience = 65;
        break;
      case AssetCategory.REAL_ESTATE:
        score = 85;
        metrics.volatility = 20;
        metrics.macroResilience = 80;
        break;
      case AssetCategory.CASH:
        score = 95;
        metrics.volatility = 5;
        metrics.macroResilience = 95;
        break;
    }

    return {
      id: asset.id,
      score,
      reasoning: `Analyse basée sur la volatilité historique de la catégorie ${asset.category}.`,
      metrics
    };
  });
};

/**
 * Synchronisation des prix via API publique CoinGecko (pour Crypto) 
 * et Simulation Algorithmique (pour le reste).
 */
export const syncMarketPrices = async (assets: Asset[]) => {
  const updates = [];
  
  // On tente de récupérer les vrais prix Crypto via CoinGecko (Gratuit, pas de clé)
  const cryptos = assets.filter(a => a.category === AssetCategory.CRYPTO);
  let cryptoPrices: Record<string, any> = {};
  
  if (cryptos.length > 0) {
    try {
      const ids = cryptos.map(c => c.name.toLowerCase().replace(' ', '-')).join(',');
      const resp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur&include_24hr_change=true`);
      if (resp.ok) cryptoPrices = await resp.json();
    } catch (e) {
      console.warn("CoinGecko rate limit, switching to simulation.");
    }
  }

  for (const asset of assets) {
    const nameLower = asset.name.toLowerCase().replace(' ', '-');
    
    if (asset.category === AssetCategory.CRYPTO && cryptoPrices[nameLower]) {
      updates.push({
        id: asset.id,
        unitPrice: cryptoPrices[nameLower].eur,
        change24h: cryptoPrices[nameLower].eur_24h_change
      });
    } else {
      // Simulation intelligente : Drifting basé sur la catégorie
      const volatility = asset.category === AssetCategory.CRYPTO ? 0.05 : 0.01;
      const drift = (Math.random() - 0.48) * volatility; // Légère tendance haussière
      const currentPrice = asset.unitPrice || 100;
      updates.push({
        id: asset.id,
        unitPrice: currentPrice * (1 + drift),
        change24h: drift * 100
      });
    }
  }

  return { updates };
};
