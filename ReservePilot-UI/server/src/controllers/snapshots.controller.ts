import type { RequestHandler } from 'express';
import { analyzeTreasury } from './treasury.controller.js';
import { compareSnapshots, getSnapshot, listSnapshots, saveSnapshot } from '../services/snapshot.service.js';
export const createSnapshot: RequestHandler = async (req, res, next) => { try { const treasuryId = String(req.params.treasuryId); const snapshot = await saveSnapshot(treasuryId, await analyzeTreasury(treasuryId)); res.status(201).json({ snapshot, requestId: res.locals.requestId }); } catch (error) { next(error); } };
export const listSnapshot: RequestHandler = async (req, res, next) => { try { res.json({ snapshots: await listSnapshots(String(req.params.treasuryId)), requestId: res.locals.requestId }); } catch (error) { next(error); } };
export const getSnapshotById: RequestHandler = async (req, res, next) => { try { res.json({ snapshot: await getSnapshot(String(req.params.snapshotId)), requestId: res.locals.requestId }); } catch (error) { next(error); } };
export const compare: RequestHandler = async (req, res, next) => { try { res.json({ comparison: await compareSnapshots(String(req.params.treasuryId), req.query.left as string, req.query.right as string), requestId: res.locals.requestId }); } catch (error) { next(error); } };
