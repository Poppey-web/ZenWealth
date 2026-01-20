
import { Asset, AssetCategory, HealthWeights } from "../types.ts";

export interface HealthScoreResult {
  id: string;
  score: number;
  reasoning: string;
  metrics: { volatility: number; liquidity: number; resilience: number; };
}

export const getPortfolioInsights = async (assets: Asset[]): Promise<string> => {
  if (assets.length === 0) return "Add assets to receive a strategic analysis.";
  const total = assets.reduce((sum, a) => sum + a.value, 0);
  const cryptoWeight = (assets.filter(a => a.category === AssetCategory.CRYPTO).reduce((sum, a) => sum + a.value, 0) / total) * 100;
  const cashWeight = (assets.filter(a => a.category === AssetCategory.CASH).reduce((sum, a) => sum + a.value, 0) / total) * 100;
  const insights = [];
  if (cryptoWeight > 20) insights.push(`⚠️ Your Crypto exposure is ${cryptoWeight.toFixed(1)}%. This is high. Consider securing profits.`);
  if (cashWeight < 5) insights.push(`💡 Your safety net is low (${cashWeight.toFixed(1)}%). Aim for 3-6 months of expenses in Cash.`);
  if (assets.length < 5) insights.push(`🔍 Portfolio lacks diversification (${assets.length} lines).`);
  return insights.join("\n") || "Your portfolio allocation is balanced and strategic.";
};

export const getAssetHealthScores = async (assets: Asset[], weights: HealthWeights): Promise<HealthScoreResult[]> => {
  return assets.map(asset => {
    let metrics = { volatility: 50, liquidity: 50, resilience: 50 };
    switch (asset.category) {
      case AssetCategory.CRYPTO: metrics = { volatility: 10, liquidity: 80, resilience: 30 }; break;
      case AssetCategory.STOCKS: metrics = { volatility: 60, liquidity: 90, resilience: 70 }; break;
      case AssetCategory.REAL_ESTATE: metrics = { volatility: 90, liquidity: 20, resilience: 85 }; break;
      case AssetCategory.CASH: metrics = { volatility: 98, liquidity: 100, resilience: 95 }; break;
    }
    const totalWeight = weights.volatility + weights.liquidity + weights.resilience;
    const score = totalWeight > 0 ? (metrics.volatility * weights.volatility + metrics.liquidity * weights.liquidity + metrics.resilience * weights.resilience) / totalWeight : 50;
    return { id: asset.id, score: Math.round(score), reasoning: "Weighted analysis", metrics };
  });
};

export const syncMarketPrices = async (assets: Asset[]) => {
  const updates = [];
  const cryptos = assets.filter(a => a.category === AssetCategory.CRYPTO);
  let cryptoPrices: Record<string, any> = {};
  
  if (cryptos.length > 0) {
    try {
      const ids = cryptos.map(c => c.name.toLowerCase().replace(' ', '-')).join(',');
      const resp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur&include_24hr_change=true`);
      if (resp.ok) cryptoPrices = await resp.json();
    } catch (e) { console.warn("API Limit reached"); }
  }

  for (const asset of assets) {
    const name = asset.name.toLowerCase();
    
    // RÈGLE : Actifs à valeur fixe (Banques, Cash, Vinicius)
    if (asset.category === AssetCategory.CASH || name.includes('banque') || name.includes('vinicius') || name.includes('livret')) {
      updates.push({ id: asset.id, unitPrice: asset.unitPrice, change24h: 0 });
      continue;
    }

    // RÈGLE : Bricks (Immobilier fractionné) -> Ne bouge que par APY
    if (name.includes('bricks')) {
      const dailyYield = (asset.yieldAPY || 0.1) / 365;
      const newPrice = (asset.unitPrice || 10) * (1 + dailyYield);
      updates.push({ id: asset.id, unitPrice: newPrice, change24h: dailyYield * 100 });
      continue;
    }

    // RÈGLE : Marchés volatiles
    if (asset.category === AssetCategory.CRYPTO && cryptoPrices[name.replace(' ', '-')]) {
      const p = cryptoPrices[name.replace(' ', '-')];
      updates.push({ id: asset.id, unitPrice: p.eur, change24h: p.eur_24h_change });
    } else {
      const vol = asset.category === AssetCategory.STOCKS ? 0.012 : 0.04;
      const change = (Math.random() - 0.49) * vol;
      updates.push({ id: asset.id, unitPrice: (asset.unitPrice || 100) * (1 + change), change24h: change * 100 });
    }
  }
  return { updates };
};
