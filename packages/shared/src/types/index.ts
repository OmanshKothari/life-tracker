// Type definitions shared between frontend and backend

// ============================================================================
// ENUMS
// ============================================================================

export enum GoalCategory {
  CAREER = 'CAREER',
  HEALTH = 'HEALTH',
  LEARNING = 'LEARNING',
  RELATIONSHIPS = 'RELATIONSHIPS',
  FINANCE = 'FINANCE',
  PERSONAL_GROWTH = 'PERSONAL_GROWTH',
  OTHER = 'OTHER',
}

export enum Timeline {
  SHORT_TERM = 'SHORT_TERM',
  MID_TERM = 'MID_TERM',
  LONG_TERM = 'LONG_TERM',
}

export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum GoalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
}

export enum BucketCategory {
  TRAVEL = 'TRAVEL',
  SKILLS = 'SKILLS',
  EXPERIENCES = 'EXPERIENCES',
  MILESTONES = 'MILESTONES',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EPIC = 'EPIC',
}

export enum HabitType {
  BINARY = 'BINARY',
  NUMERIC = 'NUMERIC',
}

export enum IncomeCategory {
  SALARY = 'SALARY',
  FREELANCE = 'FREELANCE',
  INVESTMENTS = 'INVESTMENTS',
  GIFTS = 'GIFTS',
  BONUS = 'BONUS',
  OTHER = 'OTHER',
}

export enum PaymentMethod {
  CASH = 'CASH',
  UPI = 'UPI',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum AchievementCategory {
  GOALS = 'GOALS',
  HABITS = 'HABITS',
  FINANCE = 'FINANCE',
  BUCKET_LIST = 'BUCKET_LIST',
  OVERALL = 'OVERALL',
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
