import api, { ApiResponse } from './api';

// Types
export interface ProfileData {
  id: string;
  name: string;
  email: string;
  profile: {
    totalXP: number;
    currentLevel: number;
    levelTitle: string;
    levelIcon: string;
    xpToNextLevel: number;
    levelProgress: number;
    goalsCompleted: number;
    bucketCompleted: number;
    habitsCompleted: number;
    totalSaved: number;
  };
}

export interface LevelProgress {
  currentXP: number;
  currentLevel: number;
  levelTitle: string;
  levelIcon: string;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpToNextLevel: number;
  progressPercent: number;
}

// API Functions
export const profileApi = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<ProfileData> {
    const response = await api.get<ApiResponse<ProfileData>>('/profile');
    return response.data.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: { name: string }): Promise<ProfileData> {
    const response = await api.patch<ApiResponse<ProfileData>>('/profile', data);
    return response.data.data;
  },

  /**
   * Get level progression details
   */
  async getLevelProgress(): Promise<LevelProgress> {
    const response = await api.get<ApiResponse<LevelProgress>>('/profile/level-progress');
    return response.data.data;
  },
};
