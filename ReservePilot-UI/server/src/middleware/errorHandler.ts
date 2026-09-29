import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(public code: string, message: string, public status = 500, public details?: Record<string, unknown>) { super(message); }
}

export const notFound: RequestHandler = (req, _res, next) => next(new AppError('ASSET_NOT_FOUND', `No route matches ${req.method} ${req.path}`, 404));

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const requestId = String(res.locals.requestId ?? 'unknown');
  if (error instanceof ZodError) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request input.', details: { issues: error.flatten() }, requestId } });
  const appError = error instanceof AppError ? error : new AppError('INTERNAL_ERROR', 'An unexpected error occurred.');
  req.log?.error({ err: appError, requestId, code: appError.code }, 'API request failed');
  return res.status(appError.status).json({ error: { code: appError.code, message: appError.message, details: appError.details, requestId } });
};
