import type { RequestHandler } from 'express';
import { cmc } from '../services/coinmarketcap.service.js';
import { env } from '../config/env.js';
import { getPrisma } from '../services/prisma.service.js';

export const quotes: RequestHandler = async (req, res, next) => { try { const response = await cmc.getLatestQuotes(req.query.symbols as unknown as string[]); res.json({ ...response, source: { provider: 'CoinMarketCap', endpoint: '/v2/cryptocurrency/quotes/latest' }, requestId: res.locals.requestId }); } catch (error) { next(error); } };
export const status: RequestHandler = async (_req, res) => {
  let connected = false; try { await getPrisma().$queryRawUnsafe('SELECT 1'); connected = true; } catch { /* status endpoint does not disclose connection errors */ }
  res.json({ coinmarketcap: { configured: Boolean(env.CMC_API_KEY), lastSuccessfulRequest: cmc.lastSuccessfulRequest ?? null, cacheEnabled: true }, database: { connected }, requestId: res.locals.requestId });
};
