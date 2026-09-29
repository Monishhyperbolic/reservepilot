import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
  CMC_API_KEY: z.string().min(1).optional(),
  CMC_BASE_URL: z.string().url().default('https://pro-api.coinmarketcap.com'),
  DATABASE_URL: z.string().min(1).optional(),
  QUOTE_CACHE_TTL_SECONDS: z.coerce.number().int().min(1).max(3600).default(60),
  MAX_HOLDINGS_PER_TREASURY: z.coerce.number().int().min(1).max(100).default(25),
  MAX_SNAPSHOTS_PER_TREASURY: z.coerce.number().int().min(1).max(5000).default(500)
});

export const env = schema.parse(process.env);

if (env.NODE_ENV === 'production' && !env.CMC_API_KEY) {
  throw new Error('CMC_API_KEY is required in production.');
}
