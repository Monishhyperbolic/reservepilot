import { z } from 'zod';
import { env } from '../config/env.js';

const finitePositive = z.number().finite().positive().max(1e15);
const finiteNonNegative = z.number().finite().nonnegative().max(1e15);
const holding = z.object({
  symbol: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,15}$/),
  name: z.string().trim().min(1).max(100),
  quantity: finitePositive,
  isStablecoin: z.boolean().optional(),
  manuallyClassified: z.boolean().optional()
});

const treasuryBaseSchema = z.object({
  name: z.string().trim().min(1).max(100),
  organizationType: z.enum(['web3_startup', 'dao', 'protocol', 'freelancer', 'personal', 'other']),
  reportingCurrency: z.literal('USD').default('USD'),
  monthlyExpenses: finitePositive,
  oneTimeExpenses: finiteNonNegative.default(0),
  nextPaymentDate: z.string().datetime().optional(),
  targetReserveMonths: z.number().int().min(1).max(24),
  minimumProtectedReservePercent: z.number().finite().min(0).max(100),
  riskTolerance: z.enum(['conservative', 'balanced', 'aggressive']),
  holdings: z.array(holding).min(1).max(env.MAX_HOLDINGS_PER_TREASURY)
});

const noDuplicateSymbols = (body: { holdings?: Array<{ symbol: string }> }, ctx: z.RefinementCtx) => {
  if (!body.holdings) return;
  const seen = new Set<string>();
  for (const item of body.holdings) {
    if (seen.has(item.symbol)) ctx.addIssue({ code: 'custom', path: ['holdings'], message: `Duplicate holding symbol: ${item.symbol}` });
    seen.add(item.symbol);
  }
};

export const treasurySchema = treasuryBaseSchema.superRefine(noDuplicateSymbols);

export const treasuryUpdateSchema = treasuryBaseSchema.partial().superRefine(noDuplicateSymbols);
