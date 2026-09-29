import type { AnalysisResult } from './calculation.service.js';
import { getPrisma } from './prisma.service.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

export async function saveSnapshot(treasuryId: string, analysis: AnalysisResult) {
  const db = getPrisma(); const count = await db.snapshot.count({ where: { treasuryId } });
  if (count >= env.MAX_SNAPSHOTS_PER_TREASURY) throw new AppError('DATABASE_ERROR', `Snapshot limit of ${env.MAX_SNAPSHOTS_PER_TREASURY} reached.`, 409);
  return db.snapshot.create({ data: { treasuryId, dataMode: analysis.dataMode, totalTreasuryValue: analysis.totalTreasuryValue, stableReserve: analysis.stableReserve, volatileExposure: analysis.volatileExposure, volatileExposurePercent: analysis.volatileExposurePercent, runwayMonths: analysis.runwayMonths, targetReserve: analysis.targetReserve, reserveGap: analysis.reserveGap, status: analysis.status, analysis: analysis as any, quotes: { create: analysis.quotes.map((quote) => ({ ...quote, lastUpdated: new Date(quote.lastUpdated) })) } }, include: { quotes: true } });
}
export const listSnapshots = (treasuryId: string) => getPrisma().snapshot.findMany({ where: { treasuryId }, include: { quotes: true }, orderBy: { createdAt: 'desc' } });
export async function getSnapshot(id: string) { const snapshot = await getPrisma().snapshot.findUnique({ where: { id }, include: { quotes: true } }); if (!snapshot) throw new AppError('SNAPSHOT_NOT_FOUND', 'Snapshot not found.', 404); return snapshot; }
export async function compareSnapshots(treasuryId: string, left: string, right: string) { const [a, b] = await Promise.all([getSnapshot(left), getSnapshot(right)]); if (a.treasuryId !== treasuryId || b.treasuryId !== treasuryId) throw new AppError('SNAPSHOT_NOT_FOUND', 'Snapshot does not belong to this treasury.', 404); return { left: a.id, right: b.id, valueChange: b.totalTreasuryValue - a.totalTreasuryValue, runwayChange: b.runwayMonths - a.runwayMonths, stableReserveChange: b.stableReserve - a.stableReserve, volatileExposureChange: b.volatileExposure - a.volatileExposure, statusChange: { from: a.status, to: b.status }, holdingsAllocationChange: 'Available in each snapshot analysis.', expenseChange: (b.analysis as any).monthlyExpenses - (a.analysis as any).monthlyExpenses }; }
