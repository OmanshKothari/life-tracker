import { Request, Response, NextFunction } from 'express';
import { bucketListService } from '../services/bucketList.service';
import { profileService } from '../services';
import { sendSuccess, sendCreated, sendDeleted, sendPaginated } from '../utils/response';

/**
 * GET /api/v1/bucket-list
 */
export async function listBucketItems(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const query = req.query as unknown as {
      page: number;
      limit: number;
      category?: string;
      difficulty?: string;
      isCompleted?: string;
    };

    const result = await bucketListService.getAll(userId, {
      page: query.page || 1,
      limit: query.limit || 20,
      category: query.category,
      difficulty: query.difficulty,
      isCompleted:
        query.isCompleted === 'true' ? true : query.isCompleted === 'false' ? false : undefined,
    });

    sendPaginated(res, result.data, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/bucket-list/:id
 */
export async function getBucketItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const item = await bucketListService.getById(req.params.id, userId);
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/bucket-list
 */
export async function createBucketItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const item = await bucketListService.create(userId, req.body);
    sendCreated(res, item);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/bucket-list/:id
 */
export async function updateBucketItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const item = await bucketListService.update(req.params.id, userId, req.body);
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/bucket-list/:id/complete
 */
export async function completeBucketItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const { notes } = req.body as { notes?: string };
    const { item, pointsAwarded } = await bucketListService.complete(req.params.id, userId, notes);

    sendSuccess(res, {
      ...item,
      pointsAwarded,
      message: `Amazing! You earned ${pointsAwarded} XP!`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/bucket-list/:id
 */
export async function deleteBucketItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    await bucketListService.delete(req.params.id, userId);
    sendDeleted(res, req.params.id);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/bucket-list/stats
 */
export async function getBucketListStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const stats = await bucketListService.getStats(userId);
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}
