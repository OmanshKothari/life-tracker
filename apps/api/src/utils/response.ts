import { Response } from 'express';

/**
 * Standard success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>
): void {
  res.status(statusCode).json({
    success: true,
    data,
    ...(meta && { meta }),
  });
}

/**
 * Success response for created resources
 */
export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

/**
 * Success response for deleted resources
 */
export function sendDeleted(res: Response, id: string): void {
  sendSuccess(res, {
    id,
    deleted: true,
    deletedAt: new Date().toISOString(),
  });
}

/**
 * Success response with pagination meta
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }
): void {
  sendSuccess(res, data, 200, pagination);
}
