import { Request, Response, NextFunction } from 'express';
import { profileService } from '../services';
import { sendSuccess } from '../utils/response';
import { UpdateProfileInput } from '@life-tracker/shared';

/**
 * GET /api/v1/profile
 * Get current user profile
 */
export async function getProfile(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await profileService.getProfile();
    sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/profile
 * Update user profile
 */
export async function updateProfile(
  req: Request<{}, {}, UpdateProfileInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const profile = await profileService.updateProfile(req.body);
    sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/profile/stats
 * Get detailed user statistics
 */
export async function getProfileStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const profile = await profileService.getProfile();
    // We'll expand this later with more stats
    sendSuccess(res, {
      overview: {
        totalXP: profile.profile.totalXP,
        currentLevel: profile.profile.currentLevel,
        levelTitle: profile.profile.levelTitle,
      },
      goals: {
        completed: profile.profile.goalsCompleted,
      },
      bucketList: {
        completed: profile.profile.bucketCompleted,
      },
      habits: {
        completed: profile.profile.habitsCompleted,
      },
      finance: {
        totalSaved: profile.profile.totalSaved,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/profile/level-progress
 * Get level progression details
 */
export async function getLevelProgress(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const levelProgress = await profileService.getLevelProgress();
    sendSuccess(res, levelProgress);
  } catch (error) {
    next(error);
  }
}
