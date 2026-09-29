import type { DataMode } from './treasury.types.js';

export interface Quote {
  symbol: string;
  name?: string;
  priceUsd: number;
  marketCapUsd?: number;
  volume24hUsd?: number;
  percentChange24h?: number;
  marketRank?: number;
  lastUpdated: string;
  source: 'coinmarketcap';
}

export interface QuoteResponse {
  dataMode: DataMode;
  isStale: boolean;
  fetchedAt: string;
  staleSince?: string;
  quotes: Quote[];
}
