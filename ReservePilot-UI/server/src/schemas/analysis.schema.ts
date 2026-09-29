import { z } from 'zod';
export const snapshotRequestSchema = z.object({ saveSnapshot: z.boolean().default(false) }).default({ saveSnapshot: false });
export const stressRequestSchema = z.object({
  declinePercent: z.number().finite().min(0).max(95).default(25),
  stablecoinHaircutPercent: z.number().finite().min(0).max(100).default(0),
  expenseMultiplier: z.number().finite().min(0.1).max(10).default(1)
});
export const scenarioQuerySchema = z.object({
  scenario: z.coerce.number().finite().min(0).max(95).optional(),
});
export const snapshotCompareQuerySchema = z.object({
  left: z.string().trim().min(1),
  right: z.string().trim().min(1),
});
