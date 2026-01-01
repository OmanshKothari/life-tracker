import { achievementsRepository, AchievementWithStatus } from '../repositories';
import { profileService } from './profile.service';

export interface UnlockedAchievement {
  code: string;
  name: string;
  description: string;
  icon: string;
  pointsAwarded: number;
}

class AchievementsService {
  /**
   * Get all achievements with unlock status
   */
  async getAll(userId: string): Promise<AchievementWithStatus[]> {
    return achievementsRepository.findAllWithStatus(userId);
  }

  /**
   * Get user's unlocked achievements
   */
  async getUnlocked(userId: string): Promise<AchievementWithStatus[]> {
    return achievementsRepository.findUnlocked(userId);
  }

  /**
   * Get achievement statistics
   */
  async getStats(userId: string) {
    return achievementsRepository.getStats(userId);
  }

  /**
   * Check and unlock goal-related achievements
   */
  async checkGoalAchievements(
    userId: string,
    goalsCompleted: number
  ): Promise<UnlockedAchievement[]> {
    const unlocked: UnlockedAchievement[] = [];

    // GOAL_GETTER - Complete 1 goal
    if (goalsCompleted >= 1) {
      const achievement = await this.tryUnlock(userId, 'GOAL_GETTER');
      if (achievement) unlocked.push(achievement);
    }

    // TRIPLE_THREAT - Complete 3 goals
    if (goalsCompleted >= 3) {
      const achievement = await this.tryUnlock(userId, 'TRIPLE_THREAT');
      if (achievement) unlocked.push(achievement);
    }

    // GOAL_MASTER - Complete 10 goals
    if (goalsCompleted >= 10) {
      const achievement = await this.tryUnlock(userId, 'GOAL_MASTER');
      if (achievement) unlocked.push(achievement);
    }

    return unlocked;
  }

  /**
   * Check and unlock habit-related achievements
   */
  async checkHabitAchievements(
    userId: string,
    totalCompletions: number,
    currentStreak: number
  ): Promise<UnlockedAchievement[]> {
    const unlocked: UnlockedAchievement[] = [];

    // FIRST_STEPS - Complete first habit
    if (totalCompletions >= 1) {
      const achievement = await this.tryUnlock(userId, 'FIRST_STEPS');
      if (achievement) unlocked.push(achievement);
    }

    // WEEK_WARRIOR - 7-day streak
    if (currentStreak >= 7) {
      const achievement = await this.tryUnlock(userId, 'WEEK_WARRIOR');
      if (achievement) unlocked.push(achievement);
    }

    // MONTH_MASTER - 30-day streak
    if (currentStreak >= 30) {
      const achievement = await this.tryUnlock(userId, 'MONTH_MASTER');
      if (achievement) unlocked.push(achievement);
    }

    // HABIT_LEGEND - 100-day streak
    if (currentStreak >= 100) {
      const achievement = await this.tryUnlock(userId, 'HABIT_LEGEND');
      if (achievement) unlocked.push(achievement);
    }

    return unlocked;
  }

  /**
   * Check and unlock bucket list achievements
   */
  async checkBucketAchievements(
    userId: string,
    bucketCompleted: number
  ): Promise<UnlockedAchievement[]> {
    const unlocked: UnlockedAchievement[] = [];

    // DREAM_STARTER - Complete 1 bucket list item
    if (bucketCompleted >= 1) {
      const achievement = await this.tryUnlock(userId, 'DREAM_STARTER');
      if (achievement) unlocked.push(achievement);
    }

    // ADVENTURE_SEEKER - Complete 5 bucket list items
    if (bucketCompleted >= 5) {
      const achievement = await this.tryUnlock(userId, 'ADVENTURE_SEEKER');
      if (achievement) unlocked.push(achievement);
    }

    return unlocked;
  }

  /**
   * Check and unlock finance achievements
   */
  async checkFinanceAchievements(
    userId: string,
    options: {
      hasSavingsGoal?: boolean;
      totalSaved?: number;
      underBudget?: boolean;
    }
  ): Promise<UnlockedAchievement[]> {
    const unlocked: UnlockedAchievement[] = [];

    // SAVERS_START - Create first savings goal
    if (options.hasSavingsGoal) {
      const achievement = await this.tryUnlock(userId, 'SAVERS_START');
      if (achievement) unlocked.push(achievement);
    }

    // FIRST_LAKH - Save ₹1,00,000
    if (options.totalSaved && options.totalSaved >= 100000) {
      const achievement = await this.tryUnlock(userId, 'FIRST_LAKH');
      if (achievement) unlocked.push(achievement);
    }

    // BUDGET_BOSS - Stay under budget for a month
    if (options.underBudget) {
      const achievement = await this.tryUnlock(userId, 'BUDGET_BOSS');
      if (achievement) unlocked.push(achievement);
    }

    return unlocked;
  }

  /**
   * Check overall achievements (using all features)
   */
  async checkOverallAchievements(
    userId: string,
    stats: {
      hasGoals: boolean;
      hasHabits: boolean;
      hasBucketItems: boolean;
      hasFinanceData: boolean;
    }
  ): Promise<UnlockedAchievement[]> {
    const unlocked: UnlockedAchievement[] = [];

    // LIFE_TRACKER - Use all features
    if (stats.hasGoals && stats.hasHabits && stats.hasBucketItems && stats.hasFinanceData) {
      const achievement = await this.tryUnlock(userId, 'LIFE_TRACKER');
      if (achievement) unlocked.push(achievement);
    }

    return unlocked;
  }

  /**
   * Try to unlock an achievement and award XP if successful
   */
  private async tryUnlock(userId: string, code: string): Promise<UnlockedAchievement | null> {
    // Check if already unlocked
    const isUnlocked = await achievementsRepository.isUnlocked(userId, code);
    if (isUnlocked) return null;

    // Get achievement details
    const achievement = await achievementsRepository.findByCode(code);
    if (!achievement) return null;

    // Unlock and award XP
    const userAchievement = await achievementsRepository.unlock(userId, code);
    if (!userAchievement) return null;

    // Award bonus XP
    await profileService.addXP(achievement.bonusPoints);

    return {
      code: achievement.code,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      pointsAwarded: achievement.bonusPoints,
    };
  }
}

export const achievementsService = new AchievementsService();
