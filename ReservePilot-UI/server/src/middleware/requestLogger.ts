import { randomUUID } from 'node:crypto';
import { pinoHttp } from 'pino-http';
import type { RequestHandler } from 'express';

export const requestId: RequestHandler = (_req, res, next) => {
  const id = randomUUID();
  res.locals.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
};
export const requestLogger = pinoHttp({ redact: ['req.headers.x-cmc-pro-api-key', 'req.headers.authorization', 'req.body.apiKey'] });
