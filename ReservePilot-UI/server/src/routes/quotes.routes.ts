import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { quotes, status } from '../controllers/quotes.controller.js';
import { validateQuery } from '../middleware/validate.js';
import { quoteQuerySchema } from '../schemas/quote.schema.js';
export const quotesRouter = Router();
quotesRouter.get('/status', status);
quotesRouter.get('/quotes', rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: true, legacyHeaders: false }), validateQuery(quoteQuerySchema), quotes);
