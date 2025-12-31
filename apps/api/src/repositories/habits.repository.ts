import { Habit, HabitLog, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { PaginatedResult } from './goals.repository';

export interface HabitFilters {
  userId: string;
  isActive?: boolean;
  includeDeleted?: boolean;
}

export interface CreateHabitData {
  name: string;
  type: 'BINARY' | 'NUMERIC';
  unit?: string;
  dailyTarget?: number;
  pointsPerDay?: number;
}

export interface UpdateHabitData {
  name?: string;
  type?: 'BINARY' | 'NUMERIC';
  unit?: string;
  dailyTarget?: number;
  pointsPerDay?: number;
  isActive?: boolean;
}

export type HabitWithLogs = Habit & {
  logs: HabitLog[];
};

export class HabitsRepository extends BaseRepository {
  /**
   * Find all habits for a user
   */
  async findAll(
    filters: HabitFilters,
    pagination: { page: number; limit: number }
  ): Promise<PaginatedResult<Habit>> {
    const { userId, isActive, includeDeleted } = filters;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.HabitWhereInput = {
      userId,
      ...this.includeDeleted(includeDeleted || false),
      ...(isActive !== undefined && { isActive }),
    };

    const [data, total] = await Promise.all([
      this.prisma.habit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.habit.count({ where }),
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
   * Find habit by ID with recent logs
   */
  async findById(id: string, userId: string): Promise<HabitWithLogs | null> {
    return this.prisma.habit.findFirst({
      where: {
        id,
        userId,
        ...this.notDeleted,
      },
      include: {
        logs: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });
  }

  /**
   * Find habit with logs for a date range
   */
  async findWithLogsInRange(
    id: string,
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<HabitWithLogs | null> {
    return this.prisma.habit.findFirst({
      where: {
        id,
        userId,
        ...this.notDeleted,
      },
      include: {
        logs: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
            deletedAt: null,
          },
          orderBy: { date: 'asc' },
        },
      },
    });
  }

  /**
   * Create a new habit
   */
  async create(userId: string, data: CreateHabitData): Promise<Habit> {
    return this.prisma.habit.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        unit: data.unit,
        dailyTarget: data.dailyTarget || 1,
        pointsPerDay: data.pointsPerDay || 5,
        isActive: true,
        currentStreak: 0,
        bestStreak: 0,
      },
    });
  }

  /**
   * Update a habit
   */
  async update(id: string, userId: string, data: UpdateHabitData): Promise<Habit | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    return this.prisma.habit.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Parse date string to UTC midnight
   * Handles "2025-12-31" -> 2025-12-31T00:00:00.000Z
   */
  private parseToUTCDate(dateString: string): Date {
    // Append time and Z to ensure UTC parsing
    return new Date(dateString + 'T00:00:00.000Z');
  }

  /**
   * Log habit for a specific date
   * Now accepts pointsEarned to preserve points even if toggled off
   */
  async logHabit(
    habitId: string,
    dateInput: Date | string,
    completed: boolean,
    value?: number,
    pointsEarned?: number
  ): Promise<HabitLog> {
    const habit = await this.prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit) throw new Error('Habit not found');

    // Ensure we have a proper UTC date at midnight
    let date: Date;
    if (typeof dateInput === 'string') {
      date = this.parseToUTCDate(dateInput);
    } else {
      // If it's already a Date, extract the date portion and create UTC midnight
      const dateStr = dateInput.toISOString().split('T')[0];
      date = this.parseToUTCDate(dateStr);
    }

    // Use provided points or calculate (for backward compatibility)
    const points = pointsEarned !== undefined ? pointsEarned : completed ? habit.pointsPerDay : 0;

    // Upsert the log
    const log = await this.prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId,
          date,
        },
      },
      update: {
        completed,
        value,
        pointsEarned: points,
      },
      create: {
        habitId,
        date,
        completed,
        value,
        pointsEarned: points,
      },
    });

    // Update streaks
    await this.updateStreaks(habitId);

    return log;
  }

  /**
   * Get logs for a habit in date range
   */
  async getLogsInRange(habitId: string, startDate: Date, endDate: Date): Promise<HabitLog[]> {
    return this.prisma.habitLog.findMany({
      where: {
        habitId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        deletedAt: null,
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Update streaks for a habit
   */
  private async updateStreaks(habitId: string): Promise<void> {
    const logs = await this.prisma.habitLog.findMany({
      where: { habitId, deletedAt: null },
      orderBy: { date: 'desc' },
    });

    let currentStreak = 0;

    // Get today's date in UTC at midnight
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const today = new Date(todayStr + 'T00:00:00.000Z');

    // Calculate current streak
    for (const log of logs) {
      const logDateStr = log.date.toISOString().split('T')[0];
      const logDate = new Date(logDateStr + 'T00:00:00.000Z');

      // Calculate days difference
      const diffTime = today.getTime() - logDate.getTime();
      const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (daysDiff === currentStreak && log.completed) {
        currentStreak++;
      } else if (daysDiff > currentStreak) {
        break;
      }
    }

    // Get current best streak
    const habit = await this.prisma.habit.findUnique({ where: { id: habitId } });
    const bestStreak = Math.max(habit?.bestStreak || 0, currentStreak);

    await this.prisma.habit.update({
      where: { id: habitId },
      data: { currentStreak, bestStreak },
    });
  }

  /**
   * Soft delete a habit
   */
  async softDelete(id: string, userId: string): Promise<Habit | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    return this.prisma.habit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Get total points earned from habits
   */
  async getTotalPoints(userId: string): Promise<number> {
    const habits = await this.prisma.habit.findMany({
      where: { userId, ...this.notDeleted },
      select: { id: true },
    });

    const habitIds = habits.map((h) => h.id);

    const result = await this.prisma.habitLog.aggregate({
      where: {
        habitId: { in: habitIds },
        deletedAt: null,
      },
      _sum: { pointsEarned: true },
    });

    return result._sum.pointsEarned || 0;
  }

  /**
   * Count total completed habit logs
   */
  async countCompleted(userId: string): Promise<number> {
    const habits = await this.prisma.habit.findMany({
      where: { userId, ...this.notDeleted },
      select: { id: true },
    });

    return this.prisma.habitLog.count({
      where: {
        habitId: { in: habits.map((h) => h.id) },
        completed: true,
        deletedAt: null,
      },
    });
  }
}

export const habitsRepository = new HabitsRepository();
