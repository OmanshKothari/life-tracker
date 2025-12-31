import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createGoalSchema,
  updateGoalSchema,
  updateProgressSchema,
  goalsQuerySchema,
  idParamSchema,
} from '@life-tracker/shared';
import {
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  updateGoalProgress,
  completeGoal,
  deleteGoal,
  restoreGoal,
  getGoalsStats,
} from '../controllers';

const router: Router = Router();

/**
 * GET /api/v1/goals
 * List all goals with optional filters
 */
router.get('/', validateRequest({ query: goalsQuerySchema }), listGoals);

/**
 * GET /api/v1/goals/stats
 * Get goals statistics (must be before /:id route)
 */
router.get('/stats', getGoalsStats);

/**
 * GET /api/v1/goals/:id
 * Get a single goal
 */
router.get('/:id', validateRequest({ params: idParamSchema }), getGoal);

/**
 * POST /api/v1/goals
 * Create a new goal
 */
router.post('/', validateRequest({ body: createGoalSchema }), createGoal);

/**
 * PATCH /api/v1/goals/:id
 * Update a goal
 */
router.patch(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateGoalSchema }),
  updateGoal
);

/**
 * PATCH /api/v1/goals/:id/progress
 * Update goal progress only
 */
router.patch(
  '/:id/progress',
  validateRequest({ params: idParamSchema, body: updateProgressSchema }),
  updateGoalProgress
);

/**
 * PATCH /api/v1/goals/:id/complete
 * Mark goal as completed
 */
router.patch('/:id/complete', validateRequest({ params: idParamSchema }), completeGoal);

/**
 * DELETE /api/v1/goals/:id
 * Soft delete a goal
 */
router.delete('/:id', validateRequest({ params: idParamSchema }), deleteGoal);

/**
 * POST /api/v1/goals/:id/restore
 * Restore a deleted goal
 */
router.post('/:id/restore', validateRequest({ params: idParamSchema }), restoreGoal);

export default router;
