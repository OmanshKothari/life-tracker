import { Request, Response, NextFunction } from 'express';
import { habitsService } from '../services/habits.service';
import { profileService } from '../services';
import { sendSuccess, sendCreated, sendDeleted, sendPaginated } from '../utils/response';

/**
 * GET /api/v1/habits
 */
export async function listHabits(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const query = req.query as unknown as {
      page: number;
      limit: number;
      isActive?: string;
    };

    const result = await habitsService.getAll(userId, {
      page: query.page || 1,
      limit: query.limit || 20,
      isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
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
 * GET /api/v1/habits/today
 */
export async function getTodayStatus(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const statuses = await habitsService.getTodayStatus(userId);
    sendSuccess(res, statuses);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/habits/stats
 */
export async function getHabitsStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const stats = await habitsService.getStats(userId);
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/habits/:id
 */
export async function getHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const habit = await habitsService.getById(req.params.id, userId);
    sendSuccess(res, habit);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/habits/:id/logs
 */
export async function getHabitLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const { year, month } = req.query as { year: string; month: string };

    const logs = await habitsService.getMonthLogs(
      req.params.id,
      userId,
      parseInt(year) || new Date().getFullYear(),
      parseInt(month) || new Date().getMonth() + 1
    );

    sendSuccess(res, logs);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/habits
 */
export async function createHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const habit = await habitsService.create(userId, req.body);
    sendCreated(res, habit);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/habits/:id
 */
export async function updateHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const habit = await habitsService.update(req.params.id, userId, req.body);
    sendSuccess(res, habit);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/habits/:id/log
 */
export async function logHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const { log, pointsEarned, isNewCompletion, achievements } = await habitsService.logHabit(
      req.params.id,
      userId,
      req.body
    );

    sendSuccess(res, {
      log,
      pointsEarned,
      isNewCompletion,
      achievements,
      message: isNewCompletion ? `Great job! You earned ${pointsEarned} XP!` : 'Habit log updated.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/habits/:id
 */
export async function deleteHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    await habitsService.delete(req.params.id, userId);
    sendDeleted(res, req.params.id);
  } catch (error) {
    next(error);
  }
}
