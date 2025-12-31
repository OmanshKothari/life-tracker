import { z } from 'zod';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================================================
// GOAL SCHEMAS
// ============================================================================

export const goalCategorySchema = z.enum([
  'CAREER',
  'HEALTH',
  'LEARNING',
  'RELATIONSHIPS',
  'FINANCE',
  'PERSONAL_GROWTH',
  'OTHER',
]);

export const timelineSchema = z.enum(['SHORT_TERM', 'MID_TERM', 'LONG_TERM']);

export const prioritySchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);

export const goalStatusSchema = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']);

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  category: goalCategorySchema,
  timeline: timelineSchema,
  priority: prioritySchema,
  startDate: z.coerce.date(),
  targetDate: z.coerce.date(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  category: goalCategorySchema.optional(),
  timeline: timelineSchema.optional(),
  priority: prioritySchema.optional(),
  startDate: z.coerce.date().optional(),
  targetDate: z.coerce.date().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  status: goalStatusSchema.optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateProgressSchema = z.object({
  progress: z.number().int().min(0).max(100),
});

export const goalsQuerySchema = paginationSchema.extend({
  status: goalStatusSchema.optional(),
  category: goalCategorySchema.optional(),
  timeline: timelineSchema.optional(),
  priority: prioritySchema.optional(),
  includeDeleted: z.coerce.boolean().default(false),
});

// ============================================================================
// BUCKET LIST SCHEMAS
// ============================================================================

export const bucketCategorySchema = z.enum(['TRAVEL', 'SKILLS', 'EXPERIENCES', 'MILESTONES']);

export const difficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD', 'EPIC']);

export const createBucketItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  category: bucketCategorySchema,
  difficulty: difficultySchema,
  estimatedCost: z.coerce.number().min(0).default(0),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateBucketItemSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  category: bucketCategorySchema.optional(),
  difficulty: difficultySchema.optional(),
  estimatedCost: z.coerce.number().min(0).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export const completeBucketItemSchema = z.object({
  notes: z.string().max(1000).optional(),
});

// ============================================================================
// FINANCE SCHEMAS
// ============================================================================

export const incomeCategorySchema = z.enum([
  'SALARY',
  'FREELANCE',
  'INVESTMENTS',
  'GIFTS',
  'BONUS',
  'OTHER',
]);

export const paymentMethodSchema = z.enum([
  'CASH',
  'UPI',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'BANK_TRANSFER',
]);

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)');

export const createIncomeSchema = z.object({
  date: dateStringSchema,
  description: z.string().min(1, 'Description is required').max(255),
  amount: z.coerce.number().positive('Amount must be positive'),
  category: incomeCategorySchema,
  notes: z.string().max(1000).optional().nullable(),
});

export const updateIncomeSchema = z.object({
  date: z.coerce.date().optional(),
  description: z.string().min(1).max(255).optional(),
  amount: z.coerce.number().positive().optional(),
  category: incomeCategorySchema.optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export const createExpenseSchema = z.object({
  date: dateStringSchema,
  description: z.string().min(1, 'Description is required').max(255),
  amount: z.coerce.number().positive('Amount must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  paymentMethod: paymentMethodSchema,
  notes: z.string().max(1000).optional().nullable(),
});

export const updateExpenseSchema = z.object({
  date: z.coerce.date().optional(),
  description: z.string().min(1).max(255).optional(),
  amount: z.coerce.number().positive().optional(),
  categoryId: z.string().min(1).optional(),
  paymentMethod: paymentMethodSchema.optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export const financeQuerySchema = paginationSchema.extend({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
});

// ============================================================================
// SAVINGS GOAL SCHEMAS
// ============================================================================

export const createSavingsGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  targetAmount: z.coerce.number().positive('Target must be positive'),
  currentAmount: z.coerce.number().min(0).default(0),
  startDate: dateStringSchema,
  targetDate: dateStringSchema,
  priority: prioritySchema,
  notes: z.string().max(1000).optional().nullable(),
});

export const updateSavingsGoalSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  targetAmount: z.coerce.number().positive().optional(),
  currentAmount: z.coerce.number().min(0).optional(),
  startDate: z.coerce.date().optional(),
  targetDate: z.coerce.date().optional(),
  priority: prioritySchema.optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export const addFundsSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
});

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

// ============================================================================
// TYPE EXPORTS (inferred from schemas)
// ============================================================================

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type GoalsQueryInput = z.infer<typeof goalsQuerySchema>;

export type CreateBucketItemInput = z.infer<typeof createBucketItemSchema>;
export type UpdateBucketItemInput = z.infer<typeof updateBucketItemSchema>;

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>;
export type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalSchema>;

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
