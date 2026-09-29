import type { PlanningStatus } from '../types/treasury.types.js';
import type { AnalysisResult } from './calculation.service.js';
import { round } from '../utils/formulas.js';

export interface StressOptions { declinePercent: number; stablecoinHaircutPercent: number; expenseMultiplier: number; }
export function stressTest(analysis: AnalysisResult, options: StressOptions) {
  const assetImpacts = analysis.holdings.map((holding) => {
    const currentValue = holding.value;
    const decline = holding.isStablecoin ? options.stablecoinHaircutPercent : options.declinePercent;
    const stressedValue = currentValue * (1 - decline / 100);
    return { symbol: holding.symbol, currentValue, stressedValue: round(stressedValue), loss: round(currentValue - stressedValue) };
  });
  const stressedValue = assetImpacts.reduce((sum, impact) => sum + impact.stressedValue, 0);
  const stressedMonthlyExpenses = analysis.monthlyExpenses * options.expenseMultiplier;
  const stressedRunwayMonths = stressedValue / stressedMonthlyExpenses;
  const stableStressed = assetImpacts.filter((item) => analysis.holdings.find((holding) => holding.symbol === item.symbol)?.isStablecoin).reduce((sum, item) => sum + item.stressedValue, 0);
  const reserveGap = Math.max(analysis.targetReserve - stableStressed, 0);
  const targetReserveMonths = analysis.targetReserve / analysis.monthlyExpenses;
  const status: PlanningStatus = stressedRunwayMonths < targetReserveMonths ? 'reserve_gap' : stressedRunwayMonths < analysis.runwayMonths ? 'watch' : analysis.volatileExposurePercent > 75 ? 'high_exposure' : 'covered';
  return { ...options, currentValue: analysis.totalTreasuryValue, stressedValue: round(stressedValue), currentRunwayMonths: analysis.runwayMonths, stressedRunwayMonths: round(stressedRunwayMonths), targetReserveMonths, reserveGap: round(reserveGap), status, assetImpacts, assumptions: [{ label: 'Scenario', detail: `Volatile assets decline ${options.declinePercent}%; stablecoins receive a ${options.stablecoinHaircutPercent}% haircut; expenses are multiplied by ${options.expenseMultiplier}.` }] };
}
