import { BucketItem, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { PaginatedResult } from './goals.repository';

export interface BucketListFilters {
  userId: string;
  category?: string;
  difficulty?: string;
  isCompleted?: boolean;
  includeDeleted?: boolean;
}

export interface CreateBucketItemData {
  title: string;
  category: 'TRAVEL' | 'SKILLS' | 'EXPERIENCES' | 'MILESTONES';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
  estimatedCost?: number;
  notes?: string | null;
}

export interface UpdateBucketItemData {
  title?: string;
  category?: 'TRAVEL' | 'SKILLS' | 'EXPERIENCES' | 'MILESTONES';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
  estimatedCost?: number;
  notes?: string | null;
}

export class BucketListRepository extends BaseRepository {
  /**
   * Find all bucket items for a user with filters and pagination
   */
  async findAll(
    filters: BucketListFilters,
    pagination: { page: number; limit: number }
  ): Promise<PaginatedResult<BucketItem>> {
    const { userId, category, difficulty, isCompleted, includeDeleted } = filters;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.BucketItemWhereInput = {
      userId,
      ...this.includeDeleted(includeDeleted || false),
      ...(category && { category: category as BucketItem['category'] }),
      ...(difficulty && { difficulty: difficulty as BucketItem['difficulty'] }),
      ...(isCompleted !== undefined && { isCompleted }),
    };

    const [data, total] = await Promise.all([
      this.prisma.bucketItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.bucketItem.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      hasMore: skip + data.length < total,
    };
  }

  /**
   * Find a single bucket item by ID
   */
  async findById(id: string, userId: string): Promise<BucketItem | null> {
    return this.prisma.bucketItem.findFirst({
      where: {
        id,
        userId,
        ...this.notDeleted,
      },
    });
  }

  /**
   * Create a new bucket item
   */
  async create(userId: string, data: CreateBucketItemData): Promise<BucketItem> {
    return this.prisma.bucketItem.create({
      data: {
        userId,
        title: data.title,
        category: data.category,
        difficulty: data.difficulty,
        estimatedCost: data.estimatedCost || 0,
        notes: data.notes,
        isCompleted: false,
        pointsEarned: 0,
      },
    });
  }

  /**
   * Update a bucket item
   */
  async update(id: string, userId: string, data: UpdateBucketItemData): Promise<BucketItem | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    return this.prisma.bucketItem.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Mark bucket item as completed and calculate points
   */
  async complete(id: string, userId: string, notes?: string): Promise<BucketItem | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;
    if (existing.isCompleted) return existing;

    const points = this.calculatePoints(existing.difficulty);

    return this.prisma.bucketItem.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        pointsEarned: points,
        notes: notes || existing.notes,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Soft delete a bucket item
   */
  async softDelete(id: string, userId: string): Promise<BucketItem | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    return this.prisma.bucketItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Count completed bucket items for a user
   */
  async countCompleted(userId: string): Promise<number> {
    return this.prisma.bucketItem.count({
      where: {
        userId,
        isCompleted: true,
        ...this.notDeleted,
      },
    });
  }

  /**
   * Get total points earned from bucket items
   */
  async getTotalPoints(userId: string): Promise<number> {
    const result = await this.prisma.bucketItem.aggregate({
      where: {
        userId,
        ...this.notDeleted,
      },
      _sum: { pointsEarned: true },
    });
    return result._sum.pointsEarned || 0;
  }

  /**
   * Calculate points based on difficulty
   */
  private calculatePoints(difficulty: string): number {
    const points: Record<string, number> = {
      EASY: 50,
      MEDIUM: 100,
      HARD: 200,
      EPIC: 500,
    };
    return points[difficulty] || 50;
  }
}

export const bucketListRepository = new BucketListRepository();
