import type { RequestHandler } from 'express';
import { archiveTreasury, createTreasury, findTreasury, listTreasuries, updateTreasury } from '../services/treasury.service.js';
import { calculateAnalysis } from '../services/calculation.service.js';
import { cmc } from '../services/coinmarketcap.service.js';
import { saveSnapshot } from '../services/snapshot.service.js';

const toHolding = (holding: any) => ({ ...holding, manuallyClassified: holding.manuallyClassified });
export const create: RequestHandler = async (req, res, next) => { try { const treasury = await createTreasury(req.body); res.status(201).json({ treasury: { id: treasury.id, name: treasury.name }, requestId: res.locals.requestId }); } catch (error) { next(error); } };
export const list: RequestHandler = async (_req, res, next) => { try { res.json({ treasuries: await listTreasuries(), requestId: res.locals.requestId }); } catch (error) { next(error); } };
export const get: RequestHandler = async (req, res, next) => { try { const treasury = await findTreasury(String(req.params.treasuryId)); const lastSnapshot = treasury.snapshots[0]; res.json({ treasury: { ...treasury, lastAnalysis: lastSnapshot?.analysis ?? null, lastSnapshotDate: lastSnapshot?.createdAt ?? null }, requestId: res.locals.requestId }); } catch (error) { next(error); } };
export const update: RequestHandler = async (req, res, next) => { try { res.json({ treasury: await updateTreasury(String(req.params.treasuryId), req.body), requestId: res.locals.requestId }); } catch (error) { next(error); } };
export const archive: RequestHandler = async (req, res, next) => { try { const treasury = await archiveTreasury(String(req.params.treasuryId)); res.json({ treasury: { id: treasury.id, archived: treasury.archived }, requestId: res.locals.requestId }); } catch (error) { next(error); } };
export async function analyzeTreasury(id: string) { const treasury = await findTreasury(id); const quotes = await cmc.getLatestQuotes(treasury.holdings.map((holding) => holding.symbol)); return calculateAnalysis(treasury, treasury.holdings.map(toHolding), quotes); }
export const analyze: RequestHandler = async (req, res, next) => { try { const treasuryId = String(req.params.treasuryId); const analysis = await analyzeTreasury(treasuryId); const snapshot = req.body.saveSnapshot ? await saveSnapshot(treasuryId, analysis) : undefined; res.json({ analysis, snapshot, requestId: res.locals.requestId }); } catch (error) { next(error); } };
