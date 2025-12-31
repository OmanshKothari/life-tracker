import { create } from 'zustand';
import { goalsApi, Goal, GoalFilters, CreateGoalData, UpdateGoalData } from '@/services';

interface GoalStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  onHold: number;
  completionRate: number;
  totalPoints: number;
}

interface GoalsState {
  goals: Goal[];
  selectedGoal: Goal | null;
  stats: GoalStats | null;
  pagination: { total: number; page: number; limit: number; hasMore: boolean };
  filters: GoalFilters;
  isLoading: boolean;
  error: string | null;

  fetchGoals: (filters?: GoalFilters) => Promise<void>;
  fetchGoalById: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  createGoal: (data: CreateGoalData) => Promise<Goal>;
  updateGoal: (id: string, data: UpdateGoalData) => Promise<void>;
  updateProgress: (id: string, progress: number) => Promise<void>;
  completeGoal: (id: string) => Promise<{ pointsAwarded: number }>;
  deleteGoal: (id: string) => Promise<void>;
  restoreGoal: (id: string) => Promise<void>;
  setFilters: (filters: GoalFilters) => void;
  clearSelectedGoal: () => void;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  selectedGoal: null,
  stats: null,
  pagination: { total: 0, page: 1, limit: 20, hasMore: false },
  filters: {},
  isLoading: false,
  error: null,

  fetchGoals: async (filters?: GoalFilters) => {
    const activeFilters = filters || get().filters;
    set({ isLoading: true, error: null, filters: activeFilters });

    try {
      const response = await goalsApi.getAll(activeFilters);
      set({ goals: response.data, pagination: response.meta, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch goals',
        isLoading: false,
      });
    }
  },

  fetchGoalById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const goal = await goalsApi.getById(id);
      set({ selectedGoal: goal, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch goal',
        isLoading: false,
      });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await goalsApi.getStats();
      set({ stats });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  createGoal: async (data: CreateGoalData) => {
    set({ isLoading: true, error: null });
    try {
      const goal = await goalsApi.create(data);
      // Add to list and refresh stats
      set((state) => ({
        goals: [goal, ...state.goals],
        isLoading: false,
      }));
      await get().fetchStats();
      return goal;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create goal',
        isLoading: false,
      });
      throw error;
    }
  },

  updateGoal: async (id: string, data: UpdateGoalData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await goalsApi.update(id, data);
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? updated : g)),
        selectedGoal: state.selectedGoal?.id === id ? updated : state.selectedGoal,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update goal',
        isLoading: false,
      });
      throw error;
    }
  },

  updateProgress: async (id: string, progress: number) => {
    // Optimistic update - don't set isLoading to avoid UI flicker
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id
          ? { ...g, progress, status: progress > 0 && progress < 100 ? 'IN_PROGRESS' : g.status }
          : g
      ),
    }));

    try {
      const updated = await goalsApi.updateProgress(id, progress);
      // Update with server response
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? updated : g)),
      }));
    } catch (error) {
      // Revert on error - fetch fresh data
      await get().fetchGoals();
      throw error;
    }
  },

  completeGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { pointsAwarded, ...completedGoal } = await goalsApi.complete(id);
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === id ? { ...g, ...completedGoal, status: 'COMPLETED', progress: 100 } : g
        ),
        isLoading: false,
      }));
      await get().fetchStats();
      return { pointsAwarded };
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to complete goal',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await goalsApi.delete(id);
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
        selectedGoal: state.selectedGoal?.id === id ? null : state.selectedGoal,
        isLoading: false,
      }));
      await get().fetchStats();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete goal',
        isLoading: false,
      });
      throw error;
    }
  },

  restoreGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const restored = await goalsApi.restore(id);
      set((state) => ({
        goals: [restored, ...state.goals],
        isLoading: false,
      }));
      await get().fetchStats();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to restore goal',
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters: GoalFilters) => {
    set({ filters });
    get().fetchGoals(filters);
  },

  clearSelectedGoal: () => set({ selectedGoal: null }),
}));
