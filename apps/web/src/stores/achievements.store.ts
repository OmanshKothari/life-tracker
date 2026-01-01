import { create } from 'zustand';
import { achievementsApi, Achievement, AchievementStats } from '@/services';

interface AchievementsState {
  achievements: Achievement[];
  stats: AchievementStats | null;
  isLoading: boolean;
  error: string | null;

  fetchAchievements: () => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useAchievementsStore = create<AchievementsState>((set) => ({
  achievements: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchAchievements: async () => {
    set({ isLoading: true, error: null });
    try {
      const achievements = await achievementsApi.getAll();
      set({ achievements, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch achievements',
        isLoading: false,
      });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await achievementsApi.getStats();
      set({ stats });
    } catch (error) {
      console.error('Failed to fetch achievement stats:', error);
    }
  },
}));
