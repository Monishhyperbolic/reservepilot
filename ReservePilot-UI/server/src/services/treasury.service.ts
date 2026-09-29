import type { TreasuryInput } from '../types/treasury.types.js';
import { isStablecoin } from '../utils/stablecoins.js';
import { getPrisma } from './prisma.service.js';
import { AppError } from '../middleware/errorHandler.js';

const include = { holdings: true, snapshots: { take: 1, orderBy: { createdAt: 'desc' as const } } };
export async function createTreasury(input: TreasuryInput) {
  const db = getPrisma();
  return db.treasury.create({ data: { ...input, nextPaymentDate: input.nextPaymentDate ? new Date(input.nextPaymentDate) : undefined, holdings: { create: input.holdings.map((holding) => ({ ...holding, isStablecoin: isStablecoin(holding.symbol, holding.isStablecoin, holding.manuallyClassified), manuallyClassified: Boolean(holding.manuallyClassified) })) } }, include });
}
export async function listTreasuries() { return getPrisma().treasury.findMany({ where: { archived: false }, include, orderBy: { updatedAt: 'desc' } }); }
export async function findTreasury(id: string) { const treasury = await getPrisma().treasury.findFirst({ where: { id, archived: false }, include }); if (!treasury) throw new AppError('TREASURY_NOT_FOUND', 'Treasury not found.', 404); return treasury; }
export async function updateTreasury(id: string, input: Partial<TreasuryInput>) {
  await findTreasury(id); const { holdings, nextPaymentDate, ...profile } = input;
  return getPrisma().treasury.update({ where: { id }, data: { ...profile, nextPaymentDate: nextPaymentDate ? new Date(nextPaymentDate) : undefined, ...(holdings ? { holdings: { deleteMany: {}, create: holdings.map((holding) => ({ ...holding, isStablecoin: isStablecoin(holding.symbol, holding.isStablecoin, holding.manuallyClassified), manuallyClassified: Boolean(holding.manuallyClassified) })) } } : {}) }, include });
}
export async function archiveTreasury(id: string) { await findTreasury(id); return getPrisma().treasury.update({ where: { id }, data: { archived: true } }); }
