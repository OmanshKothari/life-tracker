import api, { ApiResponse } from './api';

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  requirement: string;
  bonusPoints: number;
  isSecret: boolean;
  unlockedAt: string | null;
  pointsAwarded: number | null;
}

export interface AchievementStats {
  total: number;
  unlocked: number;
  totalPoints: number;
  recentUnlock: Achievement | null;
}

export interface UnlockedAchievement {
  code: string;
  name: string;
  description: string;
  icon: string;
  pointsAwarded: number;
}

export const achievementsApi = {
  async getAll() {
    const response = await api.get<ApiResponse<Achievement[]>>('/achievements');
    return response.data.data;
  },

  async getUnlocked() {
    const response = await api.get<ApiResponse<Achievement[]>>('/achievements/unlocked');
    return response.data.data;
  },

  async getStats() {
    const response = await api.get<ApiResponse<AchievementStats>>('/achievements/stats');
    return response.data.data;
  },
};
