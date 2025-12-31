import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Logs incoming requests in development mode
 */
export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  if (env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
  }
  next();
}
