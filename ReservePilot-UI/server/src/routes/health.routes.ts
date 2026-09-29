import { Router } from 'express';
export const healthRouter = Router();
healthRouter.get('/health', (_req, res) => res.json({ status: 'ok', service: 'reservepilot-api', timestamp: new Date().toISOString(), version: '1.0.0', requestId: res.locals.requestId }));
