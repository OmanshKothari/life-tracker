import { userRepository } from '../repositories';
import { getLevelFromXP, getXPProgress, LEVELS } from '@life-tracker/shared';
import { ApiError } from '../middlewares/errorHandler';

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  profile: {
    totalXP: number;
    currentLevel: number;
    levelTitle: string;
    levelIcon: string;
    xpToNextLevel: number;
    levelProgress: number;
    goalsCompleted: number;
    bucketCompleted: number;
    habitsCompleted: number;
    totalSaved: number;
  };
}

export interface LevelProgressData {
  currentXP: number;
  currentLevel: number;
  levelTitle: string;
  levelIcon: string;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpToNextLevel: number;
  progressPercent: number;
}

class ProfileService {
  /**
   * Get current user profile with computed level info
   */
  async getProfile(): Promise<ProfileData> {
    const user = await userRepository.findFirst();

    if (!user || !user.profile) {
      throw ApiError.notFound('User profile');
    }

    const levelInfo = getLevelFromXP(user.profile.totalXP);
    const xpProgress = getXPProgress(user.profile.totalXP);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: {
        totalXP: user.profile.totalXP,
        currentLevel: user.profile.currentLevel,
        levelTitle: levelInfo.title,
        levelIcon: levelInfo.icon,
        xpToNextLevel: xpProgress.required - xpProgress.current,
        levelProgress: xpProgress.percentage,
        goalsCompleted: user.profile.goalsCompleted,
        bucketCompleted: user.profile.bucketCompleted,
        habitsCompleted: user.profile.habitsCompleted,
        totalSaved: Number(user.profile.totalSaved),
      },
    };
  }

  /**
   * Update user profile (name)
   */
  async updateProfile(data: { name: string }): Promise<ProfileData> {
    const user = await userRepository.findFirst();

    if (!user) {
      throw ApiError.notFound('User');
    }

    const updated = await userRepository.updateProfile(user.id, data);

    if (!updated || !updated.profile) {
      throw ApiError.internal('Failed to update profile');
    }

    return this.getProfile();
  }

  /**
   * Get detailed level progression info
   */
  async getLevelProgress(): Promise<LevelProgressData> {
    const user = await userRepository.findFirst();

    if (!user || !user.profile) {
      throw ApiError.notFound('User profile');
    }

    const xp = user.profile.totalXP;
    const levelInfo = getLevelFromXP(xp);
    const xpProgress = getXPProgress(xp);

    const nextLevel = LEVELS.find((l) => l.level === levelInfo.level + 1);

    return {
      currentXP: xp,
      currentLevel: levelInfo.level,
      levelTitle: levelInfo.title,
      levelIcon: levelInfo.icon,
      xpForCurrentLevel: levelInfo.minXP,
      xpForNextLevel: nextLevel?.minXP || levelInfo.maxXP,
      xpToNextLevel: xpProgress.required - xpProgress.current,
      progressPercent: xpProgress.percentage,
    };
  }

  /**
   * Get the current user ID (for single-user mode)
   */
  async getCurrentUserId(): Promise<string> {
    const user = await userRepository.findFirst();

    if (!user) {
      throw ApiError.notFound('User');
    }

    return user.id;
  }

  /**
   * Add XP to user profile
   */
  async addXP(points: number): Promise<void> {
    const userId = await this.getCurrentUserId();
    await userRepository.addXP(userId, points);
  }

  /**
   * Increment goals completed counter
   */
  async incrementGoalsCompleted(): Promise<void> {
    const user = await userRepository.findFirst();
    if (!user || !user.profile) return;

    await userRepository.updatePlayerStats(user.id, {
      goalsCompleted: user.profile.goalsCompleted + 1,
    });
  }

  /**
   * Increment bucket list completed counter
   */
  async incrementBucketCompleted(): Promise<void> {
    const user = await userRepository.findFirst();
    if (!user || !user.profile) return;

    await userRepository.updatePlayerStats(user.id, {
      bucketCompleted: user.profile.bucketCompleted + 1,
    });
  }

  /**
   * Update total saved amount
   */
  async updateTotalSaved(amount: number): Promise<void> {
    const userId = await this.getCurrentUserId();
    await userRepository.updatePlayerStats(userId, {
      totalSaved: amount,
    });
  }
}

export const profileService = new ProfileService();
