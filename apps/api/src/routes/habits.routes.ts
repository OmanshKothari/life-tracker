import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { idParamSchema, paginationSchema } from '@life-tracker/shared';
import {
  listHabits,
  getHabit,
  getHabitLogs,
  getTodayStatus,
  getHabitsStats,
  createHabit,
  updateHabit,
  logHabit,
  deleteHabit,
} from '../controllers/habits.controller';
import { z } from 'zod';

const router: Router = Router();

// Habit schemas
const createHabitSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['BINARY', 'NUMERIC']),
  unit: z.string().max(50).optional(),
  dailyTarget: z.coerce.number().int().min(1).default(1),
  pointsPerDay: z.coerce.number().int().min(1).max(100).default(5),
});

const updateHabitSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(['BINARY', 'NUMERIC']).optional(),
  unit: z.string().max(50).optional().nullable(),
  dailyTarget: z.coerce.number().int().min(1).optional(),
  pointsPerDay: z.coerce.number().int().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

const logHabitSchema = z.object({
  date: z.string(),
  completed: z.boolean(),
  value: z.coerce.number().optional(),
});

router.get('/', validateRequest({ query: paginationSchema }), listHabits);
router.get('/today', getTodayStatus);
router.get('/stats', getHabitsStats);
router.get('/:id', validateRequest({ params: idParamSchema }), getHabit);
router.get('/:id/logs', validateRequest({ params: idParamSchema }), getHabitLogs);
router.post('/', validateRequest({ body: createHabitSchema }), createHabit);
router.patch(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateHabitSchema }),
  updateHabit
);
router.post('/:id/log', validateRequest({ params: idParamSchema, body: logHabitSchema }), logHabit);
router.delete('/:id', validateRequest({ params: idParamSchema }), deleteHabit);

export default router;
