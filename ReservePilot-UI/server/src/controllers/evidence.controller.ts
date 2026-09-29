import type { RequestHandler } from 'express';
import { analyzeTreasury } from './treasury.controller.js';
import { stressTest } from '../services/stressTest.service.js';
import { toCsv } from '../utils/csv.js';
export const evidence: RequestHandler = async (req, res, next) => { try {
  const treasuryId = String(req.params.treasuryId); const analysis = await analyzeTreasury(treasuryId); const declinePercent = req.query.scenario === undefined ? 25 : Number(req.query.scenario);
  const report = { treasuryId, generatedAt: new Date().toISOString(), dataMode: analysis.dataMode, scenario: { declinePercent, stablecoinHaircutPercent: 0 }, sourceEvidence: analysis.sourceEvidence, pricesUsed: analysis.quotes, formulas: analysis.assumptions.slice(0, 2), assumptions: analysis.assumptions, results: { totalTreasuryValue: analysis.totalTreasuryValue, runwayMonths: analysis.runwayMonths, stableReserve: analysis.stableReserve, reserveGap: analysis.reserveGap, status: analysis.status, stressTest: stressTest(analysis, { declinePercent, stablecoinHaircutPercent: 0, expenseMultiplier: 1 }) } };
  if (req.query.format === 'csv') { const rows = analysis.holdings.map((holding) => [holding.symbol, holding.quantity, holding.priceUsd, holding.value, holding.portfolioWeight, holding.isStablecoin ? 'stable' : 'volatile', analysis.analyzedAt, analysis.sourceEvidence[0].endpoint]); res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', 'attachment; filename="reservepilot-evidence.csv"'); return res.send(toCsv(['Asset', 'Quantity', 'Price', 'Current value', 'Portfolio weight', 'Stable/volatile classification', 'Timestamp', 'Source endpoint'], rows)); }
  res.json({ report, requestId: res.locals.requestId });
} catch (error) { next(error); } };
