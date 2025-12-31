import { create } from 'zustand';
import {
  habitsApi,
  Habit,
  TodayStatus,
  HabitsStats,
  CreateHabitData,
  LogHabitData,
} from '@/services';

interface HabitsState {
  habits: Habit[];
  todayStatus: TodayStatus[];
  stats: HabitsStats | null;
  pagination: { total: number; page: number; limit: number; hasMore: boolean };
  isLoading: boolean;
  error: string | null;

  fetchHabits: (filters?: { isActive?: boolean }) => Promise<void>;
  fetchTodayStatus: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createHabit: (data: CreateHabitData) => Promise<Habit>;
  updateHabit: (
    id: string,
    data: Partial<CreateHabitData & { isActive: boolean }>
  ) => Promise<void>;
  logHabit: (
    id: string,
    data: LogHabitData
  ) => Promise<{ pointsEarned: number; isNewCompletion: boolean }>;
  deleteHabit: (id: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  todayStatus: [],
  stats: null,
  pagination: { total: 0, page: 1, limit: 20, hasMore: false },
  isLoading: false,
  error: null,

  fetchHabits: async (filters?: { isActive?: boolean }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await habitsApi.getAll(filters);
      set({ habits: response.data, pagination: response.meta, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch habits',
        isLoading: false,
      });
    }
  },

  fetchTodayStatus: async () => {
    try {
      const statuses = await habitsApi.getTodayStatus();
      set({ todayStatus: statuses });
    } catch (error) {
      console.error('Failed to fetch today status:', error);
    }
  },

  fetchStats: async () => {
    try {
      const stats = await habitsApi.getStats();
      set({ stats });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  createHabit: async (data: CreateHabitData) => {
    set({ isLoading: true, error: null });
    try {
      const habit = await habitsApi.create(data);
      await get().refreshAll();
      set({ isLoading: false });
      return habit;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create habit',
        isLoading: false,
      });
      throw error;
    }
  },

  updateHabit: async (id: string, data: Partial<CreateHabitData & { isActive: boolean }>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await habitsApi.update(id, data);
      set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? updated : h)),
        todayStatus: state.todayStatus.map((s) =>
          s.habit.id === id ? { ...s, habit: updated } : s
        ),
        isLoading: false,
      }));
      // Refresh today status if active status changed
      if (data.isActive !== undefined) {
        await get().fetchTodayStatus();
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update habit',
        isLoading: false,
      });
      throw error;
    }
  },

  logHabit: async (id: string, data: LogHabitData) => {
    // Optimistic update for today status
    set((state) => ({
      todayStatus: state.todayStatus.map((s) =>
        s.habit.id === id ? { ...s, completed: data.completed, value: data.value } : s
      ),
    }));

    try {
      const result = await habitsApi.log(id, data);

      // Update habit streaks in local state
      if (result.isNewCompletion) {
        const habit = await habitsApi.getById(id);
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id
              ? { ...h, currentStreak: habit.currentStreak, bestStreak: habit.bestStreak }
              : h
          ),
          todayStatus: state.todayStatus.map((s) =>
            s.habit.id === id
              ? {
                  ...s,
                  habit: {
                    ...s.habit,
                    currentStreak: habit.currentStreak,
                    bestStreak: habit.bestStreak,
                  },
                }
              : s
          ),
        }));
        await get().fetchStats();
      }

      return { pointsEarned: result.pointsEarned, isNewCompletion: result.isNewCompletion };
    } catch (error) {
      // Revert on error
      await get().fetchTodayStatus();
      throw error;
    }
  },

  deleteHabit: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await habitsApi.delete(id);
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
        todayStatus: state.todayStatus.filter((s) => s.habit.id !== id),
        isLoading: false,
      }));
      await get().fetchStats();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete habit',
        isLoading: false,
      });
      throw error;
    }
  },

  refreshAll: async () => {
    await Promise.all([
      get().fetchHabits({ isActive: true }),
      get().fetchTodayStatus(),
      get().fetchStats(),
    ]);
  },
}));
