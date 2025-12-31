// Profile controller
export { getProfile, updateProfile, getProfileStats, getLevelProgress } from './profile.controller';

// Goals controller
export {
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  updateGoalProgress,
  completeGoal,
  deleteGoal,
  restoreGoal,
  getGoalsStats,
} from './goals.controller';

// Bucket List controller
export {
  listBucketItems,
  getBucketItem,
  createBucketItem,
  updateBucketItem,
  completeBucketItem,
  deleteBucketItem,
  getBucketListStats,
} from './bucketList.controller';

// Habits controller
export {
  listHabits,
  getHabit,
  getHabitLogs,
  getTodayStatus,
  getHabitsStats,
  createHabit,
  updateHabit,
  logHabit,
  deleteHabit,
} from './habits.controller';

// Finance controller
export * from './finance.controller';
