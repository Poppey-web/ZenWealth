
import { Asset, AssetCategory, ChartDataPoint } from './types.ts';

export const INITIAL_ASSETS: Asset[] = [
  { 
    id: '1', 
    name: 'S&P 500 ETF (VOO)', 
    category: AssetCategory.STOCKS, 
    quantity: 100,
    unitPrice: 450,
    value: 45000, 
    change24h: 1.2, 
    tags: ['Long Term', 'ETF'],
    history: [43000, 43500, 44200, 43800, 44500, 45000]
  },
  { 
    id: '2', 
    name: 'Bitcoin (BTC)', 
    category: AssetCategory.CRYPTO, 
    quantity: 0.5,
    unitPrice: 57000,
    value: 28500, 
    change24h: -2.4, 
    tags: ['Volatile', 'HODL'],
    history: [31000, 29500, 30200, 28800, 29100, 28500]
  },
  { 
    id: '3', 
    name: 'Ethereum (ETH)', 
    category: AssetCategory.CRYPTO, 
    quantity: 4,
    unitPrice: 3100,
    value: 12400, 
    change24h: 0.8, 
    tags: ['Web3'],
    history: [11800, 12100, 11950, 12200, 12300, 12400]
  },
  { 
    id: '4', 
    name: 'Immobilier Paris', 
    category: AssetCategory.REAL_ESTATE, 
    quantity: 1,
    unitPrice: 450000,
    value: 450000, 
    change24h: 0, 
    tags: ['Physique', 'Locatif'],
    history: [445000, 446000, 447500, 448000, 449000, 450000]
  },
  { 
    id: '5', 
    name: 'Livret A', 
    category: AssetCategory.CASH, 
    quantity: 15000,
    unitPrice: 1,
    value: 15000, 
    change24h: 0, 
    tags: ['Sécurité', 'Liquide'],
    history: [15000, 15000, 15000, 15000, 15000, 15000]
  },
  { 
    id: '6', 
    name: 'Apple Inc. (AAPL)', 
    category: AssetCategory.STOCKS, 
    quantity: 50,
    unitPrice: 170,
    value: 8500, 
    change24h: 1.5, 
    tags: ['Tech', 'Dividende'],
    history: [8100, 8250, 8180, 8300, 8400, 8500]
  },
];

export const MOCK_HISTORY: ChartDataPoint[] = [
  { date: '2023-08', value: 520000 },
  { date: '2023-09', value: 515000 },
  { date: '2023-10', value: 530000 },
  { date: '2023-11', value: 545000 },
  { date: '2023-12', value: 540000 },
  { date: '2024-01', value: 555000 },
  { date: '2024-02', value: 562000 },
  { date: '2024-03', value: 559400 },
];
