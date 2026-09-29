import { Router } from 'express';
import { z } from 'zod';
import { evidence } from '../controllers/evidence.controller.js';
import { validateQuery } from '../middleware/validate.js';
import { scenarioQuerySchema } from '../schemas/analysis.schema.js';
export const evidenceRouter = Router();
evidenceRouter.get('/treasuries/:treasuryId/evidence', validateQuery(scenarioQuerySchema.extend({ format: z.enum(['json', 'csv']).default('json') })), evidence);
