import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import { nowIso } from '../utils/dates.js';
import type { Quote, QuoteResponse } from '../types/quote.types.js';
import { quoteCache } from './quoteCache.service.js';

export class CoinMarketCapService {
  lastSuccessfulRequest?: string;
  async getLatestQuotes(symbols: string[]): Promise<QuoteResponse> {
    const normalized = [...new Set(symbols.map((s) => s.toUpperCase()))].sort();
    const key = `quotes:${normalized.join(',')}:USD`;
    const fresh = quoteCache.fresh(key);
    if (fresh) return fresh.data;
    try {
      const response = await this.request(normalized);
      quoteCache.set(key, response, env.QUOTE_CACHE_TTL_SECONDS);
      return response;
    } catch (error) {
      const stale = quoteCache.get(key);
      if (stale) return { ...stale.data, dataMode: 'mixed', isStale: true, staleSince: stale.fetchedAt };
      throw error;
    }
  }
  private async request(symbols: string[]): Promise<QuoteResponse> {
    const fetchedAt = nowIso();
    if (!env.CMC_API_KEY) throw new AppError('CMC_NOT_CONFIGURED', 'CoinMarketCap is not configured. Set CMC_API_KEY to retrieve live data.', 503);
    let res: Response;
    try {
      res = await fetch(`${env.CMC_BASE_URL}/v2/cryptocurrency/quotes/latest?symbol=${encodeURIComponent(symbols.join(','))}&convert=USD`, { headers: { 'X-CMC_PRO_API_KEY': env.CMC_API_KEY, Accept: 'application/json' }, signal: AbortSignal.timeout(10_000) });
    } catch { throw new AppError('CMC_UPSTREAM_ERROR', 'CoinMarketCap could not be reached.', 502); }
    if (res.status === 401) throw new AppError('CMC_AUTH_ERROR', 'CoinMarketCap authentication failed.', 502);
    if (res.status === 429) throw new AppError('CMC_RATE_LIMIT', 'CoinMarketCap rate limit reached.', 429, { retryAfterSeconds: Number(res.headers.get('retry-after') ?? 60) });
    if (!res.ok) throw new AppError('CMC_UPSTREAM_ERROR', 'CoinMarketCap returned an upstream error.', 502);
    let payload: { data?: Record<string, Array<any>> };
    try {
      payload = await res.json() as { data?: Record<string, Array<any>> };
    } catch {
      throw new AppError('CMC_INVALID_RESPONSE', 'CoinMarketCap returned an invalid response.', 502);
    }
    if (!payload.data) throw new AppError('CMC_INVALID_RESPONSE', 'CoinMarketCap returned an invalid response.', 502);
    const quotes: Quote[] = [];
    for (const symbol of symbols) {
      const asset = payload.data[symbol]?.[0]; const usd = asset?.quote?.USD;
      if (!asset || !usd || typeof usd.price !== 'number') throw new AppError('CMC_INVALID_RESPONSE', `No valid quote was returned for ${symbol}.`, 502);
      quotes.push({ symbol: asset.symbol, name: asset.name, priceUsd: usd.price, marketCapUsd: usd.market_cap ?? undefined, volume24hUsd: usd.volume_24h ?? undefined, percentChange24h: usd.percent_change_24h ?? undefined, marketRank: asset.cmc_rank ?? undefined, lastUpdated: usd.last_updated ?? asset.last_updated ?? fetchedAt, source: 'coinmarketcap' });
    }
    this.lastSuccessfulRequest = fetchedAt;
    return { dataMode: 'live', isStale: false, fetchedAt, quotes };
  }
}

export const cmc = new CoinMarketCapService();
