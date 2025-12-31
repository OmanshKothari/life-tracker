import { Request, Response, NextFunction } from 'express';
import { goalsService } from '../services';
import { profileService } from '../services';
import { sendSuccess, sendCreated, sendDeleted, sendPaginated } from '../utils/response';
import { CreateGoalInput, UpdateGoalInput } from '@life-tracker/shared';

/**
 * GET /api/v1/goals
 * List all goals with filters
 */
export async function listGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    // Query is already validated and transformed by middleware
    const query = req.query as unknown as {
      page: number;
      limit: number;
      status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | undefined;
      category:
        | 'CAREER'
        | 'HEALTH'
        | 'LEARNING'
        | 'RELATIONSHIPS'
        | 'FINANCE'
        | 'PERSONAL_GROWTH'
        | 'OTHER'
        | undefined;
      timeline: 'SHORT_TERM' | 'MID_TERM' | 'LONG_TERM' | undefined;
      priority: 'HIGH' | 'MEDIUM' | 'LOW' | undefined;
      includeDeleted: boolean;
    };

    const result = await goalsService.getAll(userId, query);

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
 * GET /api/v1/goals/:id
 * Get a single goal
 */
export async function getGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const goal = await goalsService.getById(req.params.id, userId);
    sendSuccess(res, goal);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/goals
 * Create a new goal
 */
export async function createGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const goal = await goalsService.create(userId, req.body as CreateGoalInput);
    sendCreated(res, goal);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/goals/:id
 * Update a goal
 */
export async function updateGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const goal = await goalsService.update(req.params.id, userId, req.body as UpdateGoalInput);
    sendSuccess(res, goal);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/goals/:id/progress
 * Update goal progress
 */
export async function updateGoalProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const { progress } = req.body as { progress: number };
    const goal = await goalsService.updateProgress(req.params.id, userId, progress);
    sendSuccess(res, goal);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/goals/:id/complete
 * Mark goal as completed
 */
export async function completeGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const { goal, pointsAwarded } = await goalsService.complete(req.params.id, userId);

    sendSuccess(res, {
      ...goal,
      pointsAwarded,
      message: `Congratulations! You earned ${pointsAwarded} XP!`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/goals/:id
 * Soft delete a goal
 */
export async function deleteGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    await goalsService.delete(req.params.id, userId);
    sendDeleted(res, req.params.id);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/goals/:id/restore
 * Restore a deleted goal
 */
export async function restoreGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const goal = await goalsService.restore(req.params.id, userId);
    sendSuccess(res, goal);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/goals/stats
 * Get goals statistics
 */
export async function getGoalsStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const stats = await goalsService.getStats(userId);
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}
