import { Request, Response, NextFunction } from 'express';
import { achievementsService } from '../services';
import { profileService } from '../services';
import { sendSuccess } from '../utils/response';

/**
 * GET /api/v1/achievements
 * List all achievements with unlock status
 */
export async function listAchievements(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const achievements = await achievementsService.getAll(userId);
    sendSuccess(res, achievements);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/achievements/unlocked
 * Get user's unlocked achievements
 */
export async function getUnlockedAchievements(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const achievements = await achievementsService.getUnlocked(userId);
    sendSuccess(res, achievements);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/achievements/stats
 * Get achievement statistics
 */
export async function getAchievementStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const stats = await achievementsService.getStats(userId);
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}
