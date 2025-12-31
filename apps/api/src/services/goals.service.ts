import { Goal } from '@prisma/client';
import { goalsRepository } from '../repositories';
import { profileService } from './profile.service';
import { ApiError } from '../middlewares/errorHandler';
import { CreateGoalInput, UpdateGoalInput, GoalsQueryInput } from '@life-tracker/shared';
import { PaginatedResult } from '../repositories/goals.repository';

export interface GoalWithMeta extends Goal {
  potentialPoints?: number;
}

class GoalsService {
  /**
   * Get all goals with filters and pagination
   */
  async getAll(userId: string, query: GoalsQueryInput): Promise<PaginatedResult<Goal>> {
    return goalsRepository.findAll(
      {
        userId,
        status: query.status,
        category: query.category,
        timeline: query.timeline,
        priority: query.priority,
        includeDeleted: query.includeDeleted,
      },
      {
        page: query.page,
        limit: query.limit,
      }
    );
  }

  /**
   * Get a single goal by ID
   */
  async getById(id: string, userId: string): Promise<Goal> {
    const goal = await goalsRepository.findById(id, userId);

    if (!goal) {
      throw ApiError.notFound('Goal');
    }

    return goal;
  }

  /**
   * Create a new goal
   */
  async create(userId: string, data: CreateGoalInput): Promise<Goal> {
    // Validate dates
    if (data.targetDate <= data.startDate) {
      throw ApiError.badRequest('Target date must be after start date');
    }

    return goalsRepository.create(userId, data);
  }

  /**
   * Update a goal
   */
  async update(id: string, userId: string, data: UpdateGoalInput): Promise<Goal> {
    const goal = await goalsRepository.update(id, userId, data);

    if (!goal) {
      throw ApiError.notFound('Goal');
    }

    return goal;
  }

  /**
   * Update goal progress
   */
  async updateProgress(id: string, userId: string, progress: number): Promise<Goal> {
    const goal = await goalsRepository.updateProgress(id, userId, progress);

    if (!goal) {
      throw ApiError.notFound('Goal');
    }

    return goal;
  }

  /**
   * Complete a goal - awards points and updates stats
   */
  async complete(id: string, userId: string): Promise<{ goal: Goal; pointsAwarded: number }> {
    // Get goal before completing to check status
    const existing = await goalsRepository.findById(id, userId);

    if (!existing) {
      throw ApiError.notFound('Goal');
    }

    if (existing.status === 'COMPLETED') {
      throw ApiError.badRequest('Goal is already completed');
    }

    // Complete the goal (calculates points internally)
    const goal = await goalsRepository.complete(id, userId);

    if (!goal) {
      throw ApiError.internal('Failed to complete goal');
    }

    const pointsAwarded = goal.pointsEarned;

    // Update user stats
    await profileService.addXP(pointsAwarded);
    await profileService.incrementGoalsCompleted();

    // TODO: Check for achievements

    return { goal, pointsAwarded };
  }

  /**
   * Soft delete a goal
   */
  async delete(id: string, userId: string): Promise<Goal> {
    const goal = await goalsRepository.softDelete(id, userId);

    if (!goal) {
      throw ApiError.notFound('Goal');
    }

    return goal;
  }

  /**
   * Restore a deleted goal
   */
  async restore(id: string, userId: string): Promise<Goal> {
    const goal = await goalsRepository.restore(id, userId);

    if (!goal) {
      throw ApiError.notFound('Goal');
    }

    return goal;
  }

  /**
   * Get goals statistics for a user
   */
  async getStats(userId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    completionRate: number;
    totalPoints: number;
  }> {
    const [all, totalPoints] = await Promise.all([
      goalsRepository.findAll({ userId }, { page: 1, limit: 1000 }),
      goalsRepository.getTotalPoints(userId),
    ]);

    const goals = all.data;
    const completed = goals.filter((g) => g.status === 'COMPLETED').length;
    const inProgress = goals.filter((g) => g.status === 'IN_PROGRESS').length;
    const notStarted = goals.filter((g) => g.status === 'NOT_STARTED').length;

    return {
      total: goals.length,
      completed,
      inProgress,
      notStarted,
      completionRate: goals.length > 0 ? Math.round((completed / goals.length) * 100) : 0,
      totalPoints,
    };
  }
}

export const goalsService = new GoalsService();
