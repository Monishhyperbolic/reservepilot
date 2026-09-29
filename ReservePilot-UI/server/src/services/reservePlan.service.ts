import type { AnalysisResult } from './calculation.service.js';
export function reservePlan(analysis: AnalysisResult, stress?: { reserveGap: number }) {
  const { targetReserve, stableReserve: currentStableReserve, reserveGap, reserveSurplus } = analysis;
  const volatile = analysis.volatileExposurePercent > 75;
  const recommendation = reserveGap > 0
    ? { title: 'Protected reserve is below target', explanation: `The stable reserve is ${reserveGap} USD below the target calculated from monthly operating expenses and the selected reserve months.`, severity: 'critical' as const }
    : volatile ? { title: 'High volatile exposure', explanation: 'The protected reserve target is covered, but volatile assets represent more than 75% of treasury value.', severity: 'watch' as const }
    : { title: 'Protected reserve target is covered', explanation: 'The current stable reserve exceeds the planning target.', severity: 'info' as const };
  return { targetReserve, currentStableReserve, reserveGap, reserveSurplus, stressedTargetReserve: stress ? targetReserve + stress.reserveGap : undefined, recommendation, contributingAssets: analysis.holdings.map((item) => ({ symbol: item.symbol, value: item.value, portfolioWeight: item.portfolioWeight })), disclaimer: 'ReservePilot planning recommendations are informational only. They do not execute transactions or provide financial advice.' };
}
