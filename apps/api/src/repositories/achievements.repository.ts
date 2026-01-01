import { Achievement, UserAchievement } from '@prisma/client';
import { BaseRepository } from './base.repository';

export type AchievementWithStatus = Achievement & {
  unlockedAt: Date | null;
  pointsAwarded: number | null;
};

export class AchievementsRepository extends BaseRepository {
  /**
   * Get all achievements with user unlock status
   */
  async findAllWithStatus(userId: string): Promise<AchievementWithStatus[]> {
    const achievements = await this.prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { bonusPoints: 'asc' }],
    });

    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
    });

    const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));

    return achievements.map((achievement) => {
      const unlocked = unlockedMap.get(achievement.id);
      return {
        ...achievement,
        unlockedAt: unlocked?.unlockedAt || null,
        pointsAwarded: unlocked?.pointsAwarded || null,
      };
    });
  }

  /**
   * Get user's unlocked achievements
   */
  async findUnlocked(userId: string): Promise<AchievementWithStatus[]> {
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });

    return userAchievements.map((ua) => ({
      ...ua.achievement,
      unlockedAt: ua.unlockedAt,
      pointsAwarded: ua.pointsAwarded,
    }));
  }

  /**
   * Get achievement by code
   */
  async findByCode(code: string): Promise<Achievement | null> {
    return this.prisma.achievement.findUnique({
      where: { code },
    });
  }

  /**
   * Check if user has unlocked an achievement
   */
  async isUnlocked(userId: string, achievementCode: string): Promise<boolean> {
    const achievement = await this.prisma.achievement.findUnique({
      where: { code: achievementCode },
    });

    if (!achievement) return false;

    const userAchievement = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    return !!userAchievement;
  }

  /**
   * Unlock an achievement for a user
   */
  async unlock(userId: string, achievementCode: string): Promise<UserAchievement | null> {
    const achievement = await this.prisma.achievement.findUnique({
      where: { code: achievementCode },
    });

    if (!achievement) return null;

    // Check if already unlocked
    const existing = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (existing) return existing;

    return this.prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
        pointsAwarded: achievement.bonusPoints,
      },
    });
  }

  /**
   * Get achievement stats for a user
   */
  async getStats(userId: string): Promise<{
    total: number;
    unlocked: number;
    totalPoints: number;
    recentUnlock: AchievementWithStatus | null;
  }> {
    const [total, userAchievements] = await Promise.all([
      this.prisma.achievement.count(),
      this.prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
      }),
    ]);

    const totalPoints = userAchievements.reduce((sum, ua) => sum + ua.pointsAwarded, 0);

    const recentUnlock = userAchievements[0]
      ? {
          ...userAchievements[0].achievement,
          unlockedAt: userAchievements[0].unlockedAt,
          pointsAwarded: userAchievements[0].pointsAwarded,
        }
      : null;

    return {
      total,
      unlocked: userAchievements.length,
      totalPoints,
      recentUnlock,
    };
  }
}

export const achievementsRepository = new AchievementsRepository();
