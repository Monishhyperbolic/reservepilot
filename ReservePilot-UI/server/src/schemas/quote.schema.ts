import { z } from 'zod';
export const quoteQuerySchema = z.object({
  symbols: z.string().min(2).max(400).transform((raw) => raw.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)).refine((symbols) => symbols.length > 0 && symbols.length <= 25 && symbols.every((s) => /^[A-Z0-9]{2,15}$/.test(s)), 'Provide 1–25 valid uppercase symbols')
});
