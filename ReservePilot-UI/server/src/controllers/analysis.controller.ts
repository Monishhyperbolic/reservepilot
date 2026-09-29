import type { RequestHandler } from 'express';
import { analyzeTreasury } from './treasury.controller.js';
import { stressTest } from '../services/stressTest.service.js';
import { reservePlan } from '../services/reservePlan.service.js';

export const runStressTest: RequestHandler = async (req, res, next) => { try { const analysis = await analyzeTreasury(String(req.params.treasuryId)); res.json({ stressTest: stressTest(analysis, req.body), requestId: res.locals.requestId }); } catch (error) { next(error); } };
export const getReservePlan: RequestHandler = async (req, res, next) => { try { const analysis = await analyzeTreasury(String(req.params.treasuryId)); const scenario = req.query.scenario === undefined ? undefined : Number(req.query.scenario); const stress = scenario === undefined ? undefined : stressTest(analysis, { declinePercent: scenario, stablecoinHaircutPercent: 0, expenseMultiplier: 1 }); res.json({ reservePlan: reservePlan(analysis, stress), requestId: res.locals.requestId }); } catch (error) { next(error); } };
