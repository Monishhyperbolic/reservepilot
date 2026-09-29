import { Router } from 'express';
import { getReservePlan, runStressTest } from '../controllers/analysis.controller.js';
import { validateBody } from '../middleware/validate.js';
import { scenarioQuerySchema, stressRequestSchema } from '../schemas/analysis.schema.js';
import { validateQuery } from '../middleware/validate.js';
export const analysisRouter = Router();
analysisRouter.post('/treasuries/:treasuryId/stress-test', validateBody(stressRequestSchema), runStressTest);
analysisRouter.get('/treasuries/:treasuryId/reserve-plan', validateQuery(scenarioQuerySchema), getReservePlan);
