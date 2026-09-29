import type { QuoteResponse } from '../types/quote.types.js';

type Entry = { data: QuoteResponse; fetchedAt: string; expiresAt: number };
export class QuoteCache {
  private store = new Map<string, Entry>();
  get(key: string) { return this.store.get(key); }
  fresh(key: string) { const entry = this.store.get(key); return entry && entry.expiresAt > Date.now() ? entry : undefined; }
  set(key: string, data: QuoteResponse, ttlSeconds: number) { this.store.set(key, { data, fetchedAt: data.fetchedAt, expiresAt: Date.now() + ttlSeconds * 1000 }); }
}
export const quoteCache = new QuoteCache();
