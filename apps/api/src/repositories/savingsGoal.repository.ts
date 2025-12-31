import { SavingsGoal, Priority, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { PaginatedResult } from './goals.repository';

export interface SavingsGoalFilters {
  userId: string;
  priority?: Priority;
  includeDeleted?: boolean;
}

export interface CreateSavingsGoalData {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  startDate: string;
  targetDate: string;
  priority?: Priority;
  notes?: string | null;
}

export interface UpdateSavingsGoalData {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string;
  priority?: Priority;
  notes?: string | null;
}

export class SavingsGoalRepository extends BaseRepository {
  /**
   * Find all savings goals
   */
  async findAll(
    filters: SavingsGoalFilters,
    pagination: { page: number; limit: number }
  ): Promise<PaginatedResult<SavingsGoal>> {
    const { userId, priority, includeDeleted } = filters;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.SavingsGoalWhereInput = {
      userId,
      ...this.includeDeleted(includeDeleted || false),
      ...(priority && { priority }),
    };

    const [data, total] = await Promise.all([
      this.prisma.savingsGoal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.savingsGoal.count({ where }),
    ]);

    return { data, total, page, limit, hasMore: skip + data.length < total };
  }

  /**
   * Find savings goal by ID
   */
  async findById(id: string, userId: string): Promise<SavingsGoal | null> {
    return this.prisma.savingsGoal.findFirst({
      where: { id, userId, ...this.notDeleted },
    });
  }

  /**
   * Create savings goal
   */
  async create(userId: string, data: CreateSavingsGoalData): Promise<SavingsGoal> {
    return this.prisma.savingsGoal.create({
      data: {
        userId,
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        startDate: new Date(data.startDate + 'T00:00:00.000Z'),
        targetDate: new Date(data.targetDate + 'T00:00:00.000Z'),
        priority: data.priority || 'MEDIUM',
        notes: data.notes,
      },
    });
  }

  /**
   * Update savings goal
   */
  async update(
    id: string,
    userId: string,
    data: UpdateSavingsGoalData
  ): Promise<SavingsGoal | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    return this.prisma.savingsGoal.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.targetAmount !== undefined && { targetAmount: data.targetAmount }),
        ...(data.currentAmount !== undefined && { currentAmount: data.currentAmount }),
        ...(data.targetDate !== undefined && {
          targetDate: new Date(data.targetDate + 'T00:00:00.000Z'),
        }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.notes !== undefined && { notes: data.notes }),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Add to savings
   */
  async addAmount(id: string, userId: string, amount: number): Promise<SavingsGoal | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const newAmount = Number(existing.currentAmount) + amount;

    return this.prisma.savingsGoal.update({
      where: { id },
      data: {
        currentAmount: newAmount,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Soft delete
   */
  async softDelete(id: string, userId: string): Promise<SavingsGoal | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    return this.prisma.savingsGoal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Get total saved across all goals
   */
  async getTotalSaved(userId: string): Promise<number> {
    const result = await this.prisma.savingsGoal.aggregate({
      where: { userId, ...this.notDeleted },
      _sum: { currentAmount: true },
    });
    return Number(result._sum.currentAmount) || 0;
  }

  /**
   * Get savings stats
   */
  async getStats(userId: string): Promise<{
    totalGoals: number;
    completedGoals: number;
    totalTarget: number;
    totalSaved: number;
    progressPercent: number;
  }> {
    const goals = await this.prisma.savingsGoal.findMany({
      where: { userId, ...this.notDeleted },
    });

    const totalGoals = goals.length;
    const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
    const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
    const completedGoals = goals.filter(
      (g) => Number(g.currentAmount) >= Number(g.targetAmount)
    ).length;
    const progressPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    return { totalGoals, completedGoals, totalTarget, totalSaved, progressPercent };
  }
}

export const savingsGoalRepository = new SavingsGoalRepository();
