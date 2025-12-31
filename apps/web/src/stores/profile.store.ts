import { create } from 'zustand';
import { profileApi, ProfileData, LevelProgress } from '@/services';

interface ProfileState {
  // Data
  profile: ProfileData | null;
  levelProgress: LevelProgress | null;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  fetchLevelProgress: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  // Initial state
  profile: null,
  levelProgress: null,
  isLoading: false,
  error: null,

  // Fetch profile data
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await profileApi.getProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
        isLoading: false,
      });
    }
  },

  // Fetch level progress
  fetchLevelProgress: async () => {
    try {
      const levelProgress = await profileApi.getLevelProgress();
      set({ levelProgress });
    } catch (error) {
      console.error('Failed to fetch level progress:', error);
    }
  },

  // Update profile
  updateProfile: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await profileApi.updateProfile({ name });
      set({ profile, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update profile',
        isLoading: false,
      });
      throw error;
    }
  },

  // Refresh all profile data
  refreshAll: async () => {
    await Promise.all([get().fetchProfile(), get().fetchLevelProgress()]);
  },
}));
