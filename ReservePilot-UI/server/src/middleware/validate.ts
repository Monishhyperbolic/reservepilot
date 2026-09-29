import type { RequestHandler } from 'express';
import type { z } from 'zod';
export const validateBody = <T extends z.ZodTypeAny>(schema: T): RequestHandler => (req, _res, next) => { try { req.body = schema.parse(req.body); next(); } catch (error) { next(error); } };
export const validateQuery = <T extends z.ZodTypeAny>(schema: T): RequestHandler => (req, _res, next) => { try { req.query = schema.parse(req.query) as any; next(); } catch (error) { next(error); } };
