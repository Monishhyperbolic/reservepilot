import { Router } from 'express';
import { compare, createSnapshot, getSnapshotById, listSnapshot } from '../controllers/snapshots.controller.js';
import { validateQuery } from '../middleware/validate.js';
import { snapshotCompareQuerySchema } from '../schemas/analysis.schema.js';
export const snapshotsRouter = Router();
snapshotsRouter.get('/treasuries/:treasuryId/snapshots/compare', validateQuery(snapshotCompareQuerySchema), compare);
snapshotsRouter.route('/treasuries/:treasuryId/snapshots').post(createSnapshot).get(listSnapshot);
snapshotsRouter.get('/snapshots/:snapshotId', getSnapshotById);
