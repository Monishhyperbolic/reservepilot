import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

let prisma: PrismaClient | undefined;
export const getPrisma = () => {
  if (!env.DATABASE_URL) throw new AppError('DATABASE_ERROR', 'DATABASE_URL is not configured.', 503);
  prisma ??= new PrismaClient();
  return prisma;
};
