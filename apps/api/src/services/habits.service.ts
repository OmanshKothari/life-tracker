import { Habit, HabitLog } from '@prisma/client';
import { profileService } from './profile.service';
import { achievementsService, UnlockedAchievement } from './achievements.service';
import { ApiError } from '../middlewares/errorHandler';
import { habitsRepository } from '../repositories';
import { PaginatedResult } from '../repositories/goals.repository';
import { HabitWithLogs } from '../repositories/habits.repository';

export interface HabitsQueryInput {
  page: number;
  limit: number;
  isActive?: boolean;
}

export interface CreateHabitInput {
  name: string;
  type: 'BINARY' | 'NUMERIC';
  unit?: string;
  dailyTarget?: number;
  pointsPerDay?: number;
}

export interface UpdateHabitInput {
  name?: string;
  type?: 'BINARY' | 'NUMERIC';
  unit?: string;
  dailyTarget?: number;
  pointsPerDay?: number;
  isActive?: boolean;
}

export interface LogHabitInput {
  date: string; // "YYYY-MM-DD" format
  completed: boolean;
  value?: number;
}

class HabitsService {
  /**
   * Get all habits
   */
  async getAll(userId: string, query: HabitsQueryInput): Promise<PaginatedResult<Habit>> {
    return habitsRepository.findAll(
      { userId, isActive: query.isActive },
      { page: query.page, limit: query.limit }
    );
  }

  /**
   * Get habit by ID with logs
   */
  async getById(id: string, userId: string): Promise<HabitWithLogs> {
    const habit = await habitsRepository.findById(id, userId);
    if (!habit) {
      throw ApiError.notFound('Habit');
    }
    return habit;
  }

  /**
   * Create a new habit
   */
  async create(userId: string, data: CreateHabitInput): Promise<Habit> {
    return habitsRepository.create(userId, data);
  }

  /**
   * Update a habit
   */
  async update(id: string, userId: string, data: UpdateHabitInput): Promise<Habit> {
    const habit = await habitsRepository.update(id, userId, data);
    if (!habit) {
      throw ApiError.notFound('Habit');
    }
    return habit;
  }

  /**
   * Log habit completion for a date
   * Points are only awarded ONCE per day - toggling off doesn't give points back
   */
  async logHabit(
    id: string,
    userId: string,
    data: LogHabitInput
  ): Promise<{
    log: HabitLog;
    pointsEarned: number;
    isNewCompletion: boolean;
    achievements: UnlockedAchievement[];
  }> {
    const habit = await habitsRepository.findById(id, userId);
    if (!habit) {
      throw ApiError.notFound('Habit');
    }

    // Parse date string to UTC - keep as string for repository
    const dateStr = data.date; // "YYYY-MM-DD"
    const utcDate = new Date(dateStr + 'T00:00:00.000Z');

    // Check existing log for this date
    const existingLogs = await habitsRepository.getLogsInRange(id, utcDate, utcDate);
    const existingLog = existingLogs[0];

    // Points are only awarded if:
    // 1. This is a new completion (completed=true)
    // 2. No points were previously earned for this date
    const wasCompletedBefore = existingLog?.completed || false;
    const pointsAlreadyEarned = existingLog?.pointsEarned || 0;
    const isNewCompletion = data.completed && !wasCompletedBefore && pointsAlreadyEarned === 0;

    // For numeric habits, check if target is met
    let meetsTarget = data.completed;
    if (habit.type === 'NUMERIC' && data.value !== undefined) {
      meetsTarget = data.value >= habit.dailyTarget;
    }

    // Pass the date string to repository - it will handle UTC conversion
    const log = await habitsRepository.logHabit(
      id,
      dateStr, // Pass string, not Date
      data.completed,
      data.value,
      // Only award points if new completion AND (binary OR meets numeric target)
      isNewCompletion && meetsTarget ? habit.pointsPerDay : pointsAlreadyEarned
    );

    // Award XP only for genuinely new completions
    const pointsToAward = isNewCompletion && meetsTarget ? habit.pointsPerDay : 0;
    if (pointsToAward > 0) {
      await profileService.addXP(pointsToAward);
    }

    // Check for achievements if this was a new completion
    let achievements: UnlockedAchievement[] = [];
    if (isNewCompletion && meetsTarget) {
      // Get updated habit with streak
      const updatedHabit = await habitsRepository.findById(id, userId);
      const totalCompletions = await habitsRepository.countCompleted(userId);

      achievements = await achievementsService.checkHabitAchievements(
        userId,
        totalCompletions,
        updatedHabit?.currentStreak || 0
      );
    }

    return {
      log,
      pointsEarned: pointsToAward,
      isNewCompletion: isNewCompletion && meetsTarget,
      achievements,
    };
  }

  /**
   * Get habit logs for a month
   */
  async getMonthLogs(id: string, userId: string, year: number, month: number): Promise<HabitLog[]> {
    const habit = await habitsRepository.findById(id, userId);
    if (!habit) {
      throw ApiError.notFound('Habit');
    }

    // Create UTC dates for start and end of month
    const startDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const startDate = new Date(startDateStr + 'T00:00:00.000Z');

    // Last day of month
    const lastDay = new Date(year, month, 0).getDate();
    const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const endDate = new Date(endDateStr + 'T23:59:59.999Z');

    return habitsRepository.getLogsInRange(id, startDate, endDate);
  }

  /**
   * Get today's status for all habits
   */
  async getTodayStatus(
    userId: string
  ): Promise<Array<{ habit: Habit; completed: boolean; value?: number }>> {
    const { data: habits } = await habitsRepository.findAll(
      { userId, isActive: true },
      { page: 1, limit: 100 }
    );

    // Get today's date string
    const todayStr = new Date().toISOString().split('T')[0];
    const todayStart = new Date(todayStr + 'T00:00:00.000Z');
    const todayEnd = new Date(todayStr + 'T23:59:59.999Z');

    const statuses = await Promise.all(
      habits.map(async (habit) => {
        const logs = await habitsRepository.getLogsInRange(habit.id, todayStart, todayEnd);
        const log = logs[0];
        return {
          habit,
          completed: log?.completed || false,
          value: log?.value || undefined,
        };
      })
    );

    return statuses;
  }

  /**
   * Delete a habit
   */
  async delete(id: string, userId: string): Promise<Habit> {
    const habit = await habitsRepository.softDelete(id, userId);
    if (!habit) {
      throw ApiError.notFound('Habit');
    }
    return habit;
  }

  /**
   * Get habits statistics
   */
  async getStats(userId: string): Promise<{
    totalHabits: number;
    activeHabits: number;
    totalCompletions: number;
    totalPoints: number;
    bestStreak: number;
    currentStreaks: Array<{ name: string; streak: number }>;
  }> {
    const [all, totalCompletions, totalPoints] = await Promise.all([
      habitsRepository.findAll({ userId }, { page: 1, limit: 100 }),
      habitsRepository.countCompleted(userId),
      habitsRepository.getTotalPoints(userId),
    ]);

    const habits = all.data;
    const activeHabits = habits.filter((h) => h.isActive).length;
    const bestStreak = Math.max(...habits.map((h) => h.bestStreak), 0);

    const currentStreaks = habits
      .filter((h) => h.isActive && h.currentStreak > 0)
      .map((h) => ({ name: h.name, streak: h.currentStreak }))
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5);

    return {
      totalHabits: habits.length,
      activeHabits,
      totalCompletions,
      totalPoints,
      bestStreak,
      currentStreaks,
    };
  }
}

export const habitsService = new HabitsService();
