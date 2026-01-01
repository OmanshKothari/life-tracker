import { BucketItem } from '@prisma/client';
import { bucketListRepository } from '../repositories';
import { profileService } from './profile.service';
import { achievementsService, UnlockedAchievement } from './achievements.service';
import { ApiError } from '../middlewares/errorHandler';
import { PaginatedResult } from '../repositories/goals.repository';

export interface BucketListQueryInput {
  page: number;
  limit: number;
  category?: string;
  difficulty?: string;
  isCompleted?: boolean;
}

export interface CreateBucketItemInput {
  title: string;
  category: 'TRAVEL' | 'SKILLS' | 'EXPERIENCES' | 'MILESTONES';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
  estimatedCost?: number;
  notes?: string | null;
}

export interface UpdateBucketItemInput {
  title?: string;
  category?: 'TRAVEL' | 'SKILLS' | 'EXPERIENCES' | 'MILESTONES';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
  estimatedCost?: number;
  notes?: string | null;
}

class BucketListService {
  /**
   * Get all bucket items with filters and pagination
   */
  async getAll(userId: string, query: BucketListQueryInput): Promise<PaginatedResult<BucketItem>> {
    return bucketListRepository.findAll(
      {
        userId,
        category: query.category,
        difficulty: query.difficulty,
        isCompleted: query.isCompleted,
      },
      { page: query.page, limit: query.limit }
    );
  }

  /**
   * Get a single bucket item by ID
   */
  async getById(id: string, userId: string): Promise<BucketItem> {
    const item = await bucketListRepository.findById(id, userId);
    if (!item) {
      throw ApiError.notFound('Bucket item');
    }
    return item;
  }

  /**
   * Create a new bucket item
   */
  async create(userId: string, data: CreateBucketItemInput): Promise<BucketItem> {
    return bucketListRepository.create(userId, data);
  }

  /**
   * Update a bucket item
   */
  async update(id: string, userId: string, data: UpdateBucketItemInput): Promise<BucketItem> {
    const item = await bucketListRepository.update(id, userId, data);
    if (!item) {
      throw ApiError.notFound('Bucket item');
    }
    return item;
  }

  /**
   * Complete a bucket item - awards points
   */
  async complete(
    id: string,
    userId: string,
    notes?: string
  ): Promise<{ item: BucketItem; pointsAwarded: number; achievements: UnlockedAchievement[] }> {
    const existing = await bucketListRepository.findById(id, userId);
    if (!existing) {
      throw ApiError.notFound('Bucket item');
    }
    if (existing.isCompleted) {
      throw ApiError.badRequest('Bucket item is already completed');
    }

    const item = await bucketListRepository.complete(id, userId, notes);
    if (!item) {
      throw ApiError.internal('Failed to complete bucket item');
    }

    const pointsAwarded = item.pointsEarned;

    // Update user stats
    await profileService.addXP(pointsAwarded);
    await profileService.incrementBucketCompleted();

    // Get updated count and check achievements
    const profile = await profileService.getProfile();
    const achievements = await achievementsService.checkBucketAchievements(
      userId,
      profile.profile.bucketCompleted
    );

    return { item, pointsAwarded, achievements };
  }

  /**
   * Delete a bucket item
   */
  async delete(id: string, userId: string): Promise<BucketItem> {
    const item = await bucketListRepository.softDelete(id, userId);
    if (!item) {
      throw ApiError.notFound('Bucket item');
    }
    return item;
  }

  /**
   * Get bucket list statistics
   */
  async getStats(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    totalPoints: number;
    byCategory: Record<string, number>;
  }> {
    const [all, totalPoints] = await Promise.all([
      bucketListRepository.findAll({ userId }, { page: 1, limit: 1000 }),
      bucketListRepository.getTotalPoints(userId),
    ]);

    const items = all.data;
    const completed = items.filter((i) => i.isCompleted).length;

    const byCategory = items.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: items.length,
      completed,
      pending: items.length - completed,
      totalPoints,
      byCategory,
    };
  }
}

export const bucketListService = new BucketListService();
