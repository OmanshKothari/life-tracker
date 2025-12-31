import { User, PlayerProfile } from '@prisma/client';
import { BaseRepository } from './base.repository';

export type UserWithProfile = User & {
  profile: PlayerProfile | null;
};

export class UserRepository extends BaseRepository {
  /**
   * Find user by ID with profile
   */
  async findById(id: string): Promise<UserWithProfile | null> {
    return this.prisma.user.findFirst({
      where: {
        id,
        ...this.notDeleted,
      },
      include: {
        profile: true,
      },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserWithProfile | null> {
    return this.prisma.user.findFirst({
      where: {
        email,
        ...this.notDeleted,
      },
      include: {
        profile: true,
      },
    });
  }

  /**
   * Get the first user (for single-user mode)
   */
  async findFirst(): Promise<UserWithProfile | null> {
    return this.prisma.user.findFirst({
      where: this.notDeleted,
      include: {
        profile: true,
      },
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: Partial<{
      name: string;
    }>
  ): Promise<UserWithProfile | null> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        updatedAt: new Date(),
      },
      include: {
        profile: true,
      },
    });
  }

  /**
   * Update player stats (XP, level, etc.)
   */
  async updatePlayerStats(
    userId: string,
    data: Partial<{
      totalXP: number;
      currentLevel: number;
      goalsCompleted: number;
      bucketCompleted: number;
      habitsCompleted: number;
      totalSaved: number;
    }>
  ): Promise<PlayerProfile> {
    return this.prisma.playerProfile.update({
      where: { userId },
      data,
    });
  }

  /**
   * Increment XP and update level if needed
   */
  async addXP(userId: string, points: number): Promise<PlayerProfile> {
    const profile = await this.prisma.playerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    const newXP = profile.totalXP + points;
    const newLevel = this.calculateLevel(newXP);

    return this.prisma.playerProfile.update({
      where: { userId },
      data: {
        totalXP: newXP,
        currentLevel: newLevel,
      },
    });
  }

  /**
   * Calculate level from XP
   */
  private calculateLevel(xp: number): number {
    const levels = [
      { level: 1, minXP: 0 },
      { level: 2, minXP: 501 },
      { level: 3, minXP: 1501 },
      { level: 4, minXP: 3501 },
      { level: 5, minXP: 7001 },
      { level: 6, minXP: 12001 },
      { level: 7, minXP: 20001 },
    ];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (xp >= levels[i].minXP) {
        return levels[i].level;
      }
    }
    return 1;
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
