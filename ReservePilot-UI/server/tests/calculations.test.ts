import { describe, expect, it } from 'vitest';
import { calculateAnalysis } from '../src/services/calculation.service.js';
import { stressTest } from '../src/services/stressTest.service.js';
import { reservePlan } from '../src/services/reservePlan.service.js';
import type { QuoteResponse } from '../src/types/quote.types.js';
const treasury = { id: 't1', monthlyExpenses: 25000, oneTimeExpenses: 5000, targetReserveMonths: 4, minimumProtectedReservePercent: 60 };
const quotes: QuoteResponse = { dataMode: 'live', isStale: false, fetchedAt: '2026-01-01T00:00:00.000Z', quotes: [{ symbol: 'BTC', name: 'Bitcoin', priceUsd: 80000, lastUpdated: '2026-01-01T00:00:00.000Z', source: 'coinmarketcap' }, { symbol: 'USDC', name: 'USD Coin', priceUsd: 1, lastUpdated: '2026-01-01T00:00:00.000Z', source: 'coinmarketcap' }] };
const holdings = [{ symbol: 'BTC', name: 'Bitcoin', quantity: 1, isStablecoin: false, manuallyClassified: false }, { symbol: 'USDC', name: 'USD Coin', quantity: 40000, isStablecoin: true, manuallyClassified: false }];
describe('ReservePilot calculations', () => {
  it('calculates assets, reserve gap, exposure, runway, and concentration', () => { const result = calculateAnalysis(treasury, holdings, quotes); expect(result.totalTreasuryValue).toBe(120000); expect(result.stableReserve).toBe(40000); expect(result.volatileExposurePercent).toBeCloseTo(66.67, 1); expect(result.runwayMonths).toBe(4.8); expect(result.targetReserve).toBe(100000); expect(result.reserveGap).toBe(60000); expect(result.reserveSurplus).toBe(0); expect(result.concentration.status).toBe('high'); });
  it('models volatile declines, stablecoin haircuts, and expense multiplier', () => { const stress = stressTest(calculateAnalysis(treasury, holdings, quotes), { declinePercent: 25, stablecoinHaircutPercent: 10, expenseMultiplier: 2 }); expect(stress.stressedValue).toBe(96000); expect(stress.stressedRunwayMonths).toBe(1.92); expect(stress.assetImpacts.find((item) => item.symbol === 'USDC')?.loss).toBe(4000); });
  it('returns a non-execution reserve recommendation', () => { const plan = reservePlan(calculateAnalysis(treasury, holdings, quotes)); expect(plan.recommendation.severity).toBe('critical'); expect(plan.disclaimer).toMatch(/do not execute/i); });
  it('rejects zero monthly expenses', () => expect(() => calculateAnalysis({ ...treasury, monthlyExpenses: 0 }, holdings, quotes)).toThrow());
});
