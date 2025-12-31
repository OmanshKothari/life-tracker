import { Goal, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { CreateGoalInput, UpdateGoalInput } from '@life-tracker/shared';

export interface GoalFilters {
  userId: string;
  status?: string;
  category?: string;
  timeline?: string;
  priority?: string;
  includeDeleted?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class GoalsRepository extends BaseRepository {
  /**
   * Find all goals for a user with filters and pagination
   */
  async findAll(
    filters: GoalFilters,
    pagination: { page: number; limit: number }
  ): Promise<PaginatedResult<Goal>> {
    const { userId, status, category, timeline, priority, includeDeleted } = filters;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.GoalWhereInput = {
      userId,
      ...this.includeDeleted(includeDeleted || false),
      ...(status && { status: status as Goal['status'] }),
      ...(category && { category: category as Goal['category'] }),
      ...(timeline && { timeline: timeline as Goal['timeline'] }),
      ...(priority && { priority: priority as Goal['priority'] }),
    };

    const [data, total] = await Promise.all([
      this.prisma.goal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.goal.count({ where }),
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
   * Find a single goal by ID
   */
  async findById(id: string, userId: string): Promise<Goal | null> {
    return this.prisma.goal.findFirst({
      where: {
        id,
        userId,
        ...this.notDeleted,
      },
    });
  }

  /**
   * Create a new goal
   */
  async create(userId: string, data: CreateGoalInput): Promise<Goal> {
    return this.prisma.goal.create({
      data: {
        userId,
        title: data.title,
        category: data.category,
        timeline: data.timeline,
        priority: data.priority,
        startDate: data.startDate,
        targetDate: data.targetDate,
        notes: data.notes,
        status: 'NOT_STARTED',
        progress: 0,
        pointsEarned: 0,
      },
    });
  }

  /**
   * Update a goal
   */
  async update(id: string, userId: string, data: UpdateGoalInput): Promise<Goal | null> {
    // First check if goal exists and belongs to user
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    return this.prisma.goal.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Update goal progress
   */
  async updateProgress(id: string, userId: string, progress: number): Promise<Goal | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    // Auto-update status based on progress
    let status = existing.status;
    if (progress === 0 && status === 'IN_PROGRESS') {
      status = 'NOT_STARTED';
    } else if (progress > 0 && progress < 100 && status === 'NOT_STARTED') {
      status = 'IN_PROGRESS';
    }

    return this.prisma.goal.update({
      where: { id },
      data: {
        progress,
        status,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Mark goal as completed and calculate points
   */
  async complete(id: string, userId: string): Promise<Goal | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;
    if (existing.status === 'COMPLETED') return existing;

    const points = this.calculatePoints(existing.timeline, existing.priority);

    return this.prisma.goal.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        progress: 100,
        pointsEarned: points,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Soft delete a goal
   */
  async softDelete(id: string, userId: string): Promise<Goal | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    return this.prisma.goal.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Restore a soft-deleted goal
   */
  async restore(id: string, userId: string): Promise<Goal | null> {
    const existing = await this.prisma.goal.findFirst({
      where: {
        id,
        userId,
        deletedAt: { not: null },
      },
    });
    if (!existing) return null;

    return this.prisma.goal.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });
  }

  /**
   * Count completed goals for a user
   */
  async countCompleted(userId: string): Promise<number> {
    return this.prisma.goal.count({
      where: {
        userId,
        status: 'COMPLETED',
        ...this.notDeleted,
      },
    });
  }

  /**
   * Get total points earned from goals
   */
  async getTotalPoints(userId: string): Promise<number> {
    const result = await this.prisma.goal.aggregate({
      where: {
        userId,
        ...this.notDeleted,
      },
      _sum: {
        pointsEarned: true,
      },
    });
    return result._sum.pointsEarned || 0;
  }

  /**
   * Calculate points for a goal based on timeline and priority
   */
  private calculatePoints(timeline: string, priority: string): number {
    const basePoints: Record<string, number> = {
      SHORT_TERM: 100,
      MID_TERM: 250,
      LONG_TERM: 500,
    };

    const multipliers: Record<string, number> = {
      HIGH: 1.5,
      MEDIUM: 1.0,
      LOW: 0.75,
    };

    const base = basePoints[timeline] || 100;
    const multiplier = multipliers[priority] || 1.0;

    return Math.round(base * multiplier);
  }
}

// Export singleton instance
export const goalsRepository = new GoalsRepository();
