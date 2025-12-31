// Shared constants for gamification

// ============================================================================
// LEVEL SYSTEM
// ============================================================================

export interface LevelInfo {
  level: number;
  title: string;
  icon: string;
  minXP: number;
  maxXP: number;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Novice', icon: '🌱', minXP: 0, maxXP: 500 },
  { level: 2, title: 'Apprentice', icon: '🌿', minXP: 501, maxXP: 1500 },
  { level: 3, title: 'Journeyman', icon: '🌳', minXP: 1501, maxXP: 3500 },
  { level: 4, title: 'Expert', icon: '⚔️', minXP: 3501, maxXP: 7000 },
  { level: 5, title: 'Master', icon: '🛡️', minXP: 7001, maxXP: 12000 },
  { level: 6, title: 'Grandmaster', icon: '👑', minXP: 12001, maxXP: 20000 },
  { level: 7, title: 'Legend', icon: '🏆', minXP: 20001, maxXP: Infinity },
];

// ============================================================================
// POINT VALUES
// ============================================================================

export const GOAL_BASE_POINTS: Record<string, number> = {
  SHORT_TERM: 100,
  MID_TERM: 250,
  LONG_TERM: 500,
};

export const PRIORITY_MULTIPLIERS: Record<string, number> = {
  HIGH: 1.5,
  MEDIUM: 1.0,
  LOW: 0.75,
};

export const BUCKET_POINTS: Record<string, number> = {
  EASY: 50,
  MEDIUM: 100,
  HARD: 200,
  EPIC: 500,
};

export const HABIT_POINTS = {
  DAILY_COMPLETION: 5,
  STREAK_7_DAYS: 25,
  STREAK_30_DAYS: 100,
  STREAK_100_DAYS: 500,
  PERFECT_WEEK: 50,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function calculateGoalPoints(timeline: string, priority: string): number {
  const basePoints = GOAL_BASE_POINTS[timeline] || 100;
  const multiplier = PRIORITY_MULTIPLIERS[priority] || 1.0;
  return Math.round(basePoints * multiplier);
}

export function getLevelFromXP(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getXPProgress(xp: number): {
  current: number;
  required: number;
  percentage: number;
} {
  const level = getLevelFromXP(xp);
  const nextLevel = LEVELS.find((l) => l.level === level.level + 1);

  if (!nextLevel) {
    return { current: xp - level.minXP, required: 0, percentage: 100 };
  }

  const xpInCurrentLevel = xp - level.minXP;
  const xpRequiredForLevel = nextLevel.minXP - level.minXP;
  const percentage = Math.round((xpInCurrentLevel / xpRequiredForLevel) * 100);

  return {
    current: xpInCurrentLevel,
    required: xpRequiredForLevel,
    percentage,
  };
}
