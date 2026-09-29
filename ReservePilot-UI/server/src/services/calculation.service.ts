import type { Quote, QuoteResponse } from '../types/quote.types.js';
import type { DataMode, PlanningStatus } from '../types/treasury.types.js';
import { assetValue, firstMonthCashNeed, round, targetReserve } from '../utils/formulas.js';
import { nowIso } from '../utils/dates.js';

export type AnalysisHolding = { symbol: string; name: string; quantity: number; isStablecoin: boolean; classification: 'automatic' | 'manual'; priceUsd: number; value: number; portfolioWeight: number };
type HoldingLike = { symbol: string; name: string; quantity: number; isStablecoin: boolean; manuallyClassified: boolean };
type TreasuryLike = { id?: string; monthlyExpenses: number; oneTimeExpenses: number; targetReserveMonths: number; minimumProtectedReservePercent: number };

export interface AnalysisResult {
  treasuryId?: string; analyzedAt: string; dataMode: DataMode; quotes: Quote[]; holdings: AnalysisHolding[];
  totalTreasuryValue: number; monthlyExpenses: number; oneTimeExpenses: number; firstMonthCashNeed: number;
  targetReserve: number; targetReserveWithOneTimeExpense: number; stableReserve: number; volatileExposure: number;
  volatileExposurePercent: number; runwayMonths: number; reserveGap: number; reserveSurplus: number;
  concentration: { largestHolding: string; largestHoldingPercent: number; score: number; status: 'high' | 'moderate' | 'diversified'; heuristic: string };
  status: PlanningStatus; statusLabel: string; assumptions: Array<{ label: string; detail: string }>; sourceEvidence: Array<{ provider: string; endpoint: string; fetchedAt: string; isStale: boolean }>;
}

export const statusLabel = (status: PlanningStatus) => ({ covered: 'Covered', watch: 'Watch', reserve_gap: 'Reserve gap', high_exposure: 'High exposure' })[status];

export function calculateAnalysis(treasury: TreasuryLike, holdings: HoldingLike[], quoteResponse: QuoteResponse): AnalysisResult {
  if (!Number.isFinite(treasury.monthlyExpenses) || treasury.monthlyExpenses <= 0) throw new Error('Monthly expenses must be greater than zero.');
  const quoteBySymbol = new Map(quoteResponse.quotes.map((quote) => [quote.symbol, quote]));
  const partial = holdings.map((holding) => {
    const quote = quoteBySymbol.get(holding.symbol);
    if (!quote) throw new Error(`Missing quote for ${holding.symbol}.`);
    return { ...holding, priceUsd: quote.priceUsd, value: assetValue(holding.quantity, quote.priceUsd) };
  });
  const totalTreasuryValue = partial.reduce((sum, item) => sum + item.value, 0);
  const stableReserve = partial.filter((item) => item.isStablecoin).reduce((sum, item) => sum + item.value, 0);
  const volatileExposure = totalTreasuryValue - stableReserve;
  const volatileExposurePercent = totalTreasuryValue ? volatileExposure / totalTreasuryValue * 100 : 0;
  const runwayMonths = totalTreasuryValue / treasury.monthlyExpenses;
  const reserveTarget = targetReserve(treasury.monthlyExpenses, treasury.targetReserveMonths);
  const rawReserveGap = reserveTarget - stableReserve;
  const holdingsWithWeight: AnalysisHolding[] = partial.map((item) => ({
    ...item, value: round(item.value), portfolioWeight: totalTreasuryValue ? round(item.value / totalTreasuryValue * 100) : 0,
    classification: item.manuallyClassified ? 'manual' : 'automatic'
  }));
  const largest = [...holdingsWithWeight].sort((a, b) => b.value - a.value)[0];
  const largestHoldingPercent = largest?.portfolioWeight ?? 0;
  const concentrationStatus = largestHoldingPercent > 60 ? 'high' : largestHoldingPercent >= 40 ? 'moderate' : 'diversified';
  const stressRunway = partial.reduce((sum, item) => sum + item.value * (item.isStablecoin ? 1 : 0.75), 0) / treasury.monthlyExpenses;
  const status: PlanningStatus = runwayMonths < treasury.targetReserveMonths ? 'reserve_gap' : stressRunway < treasury.targetReserveMonths ? 'watch' : volatileExposurePercent > 75 ? 'high_exposure' : 'covered';
  return {
    treasuryId: treasury.id, analyzedAt: nowIso(), dataMode: quoteResponse.dataMode, quotes: quoteResponse.quotes, holdings: holdingsWithWeight,
    totalTreasuryValue: round(totalTreasuryValue), monthlyExpenses: treasury.monthlyExpenses, oneTimeExpenses: treasury.oneTimeExpenses,
    firstMonthCashNeed: round(firstMonthCashNeed(treasury.monthlyExpenses, treasury.oneTimeExpenses)), targetReserve: round(reserveTarget),
    targetReserveWithOneTimeExpense: round(reserveTarget + treasury.oneTimeExpenses), stableReserve: round(stableReserve), volatileExposure: round(volatileExposure), volatileExposurePercent: round(volatileExposurePercent), runwayMonths: round(runwayMonths),
    reserveGap: round(Math.max(rawReserveGap, 0)), reserveSurplus: round(Math.max(-rawReserveGap, 0)),
    concentration: { largestHolding: largest?.symbol ?? '', largestHoldingPercent, score: round(holdingsWithWeight.reduce((sum, item) => sum + item.portfolioWeight ** 2, 0)), status: concentrationStatus, heuristic: 'ReservePilot product heuristic: high >60%, moderate 40–60%, otherwise diversified.' },
    status, statusLabel: statusLabel(status),
    assumptions: [
      { label: 'Runway formula', detail: 'Total treasury value ÷ monthly operating expenses. One-time expenses are shown separately.' },
      { label: 'Target reserve formula', detail: 'Monthly operating expenses × target reserve months.' },
      { label: 'Stablecoin classification', detail: 'A central symbol list or explicit manual classification is used; classification does not guarantee stability.' },
      { label: 'Stress test', detail: 'The planning status considers a hypothetical 25% decline in volatile assets.' }
    ],
    sourceEvidence: [{ provider: 'CoinMarketCap', endpoint: '/v2/cryptocurrency/quotes/latest', fetchedAt: quoteResponse.fetchedAt, isStale: quoteResponse.isStale }]
  };
}
