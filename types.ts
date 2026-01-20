
export enum AssetCategory {
  STOCKS = 'Stocks',
  CRYPTO = 'Crypto',
  REAL_ESTATE = 'Real Estate',
  CASH = 'Cash',
  OTHER = 'Other'
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  quantity: number;
  unitPrice?: number;
  value: number;
  change24h?: number;
  yieldAPY?: number;
  feePercentage?: number;
  icon?: string;
  tags?: string[];
  history?: number[];
  created_at?: string;
  user_id?: string;
}

export interface HealthWeights {
  volatility: number;
  liquidity: number;
  resilience: number;
}

export interface PortfolioStats {
  totalNetWorth: number;
  totalChange24h: number;
  totalChangePercentage: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense'
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  label: string;
  user_id?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  icon?: string;
  user_id?: string;
}
