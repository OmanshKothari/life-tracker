import api, { ApiResponse } from './api';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  type: 'BINARY' | 'NUMERIC';
  unit: string | null;
  dailyTarget: number;
  pointsPerDay: number;
  isActive: boolean;
  currentStreak: number;
  bestStreak: number;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  value: number | null;
  pointsEarned: number;
  createdAt: string;
}

export interface HabitWithLogs extends Habit {
  logs: HabitLog[];
}

export interface TodayStatus {
  habit: Habit;
  completed: boolean;
  value?: number;
}

export interface HabitsStats {
  totalHabits: number;
  activeHabits: number;
  totalCompletions: number;
  totalPoints: number;
  bestStreak: number;
  currentStreaks: Array<{ name: string; streak: number }>;
}

export interface CreateHabitData {
  name: string;
  type: 'BINARY' | 'NUMERIC';
  unit?: string;
  dailyTarget?: number;
  pointsPerDay?: number;
}

export interface LogHabitData {
  date: string;
  completed: boolean;
  value?: number;
}

export const habitsApi = {
  async getAll(filters: { isActive?: boolean; page?: number; limit?: number } = {}) {
    const params = new URLSearchParams();
    if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await api.get<ApiResponse<Habit[]>>(`/habits?${params}`);
    return {
      data: response.data.data,
      meta: response.data.meta || { total: 0, page: 1, limit: 20, hasMore: false },
    };
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<HabitWithLogs>>(`/habits/${id}`);
    return response.data.data;
  },

  async getTodayStatus() {
    const response = await api.get<ApiResponse<TodayStatus[]>>('/habits/today');
    return response.data.data;
  },

  async getStats() {
    const response = await api.get<ApiResponse<HabitsStats>>('/habits/stats');
    return response.data.data;
  },

  async getLogs(id: string, year: number, month: number) {
    const response = await api.get<ApiResponse<HabitLog[]>>(
      `/habits/${id}/logs?year=${year}&month=${month}`
    );
    return response.data.data;
  },

  async create(data: CreateHabitData) {
    const response = await api.post<ApiResponse<Habit>>('/habits', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateHabitData & { isActive: boolean }>) {
    const response = await api.patch<ApiResponse<Habit>>(`/habits/${id}`, data);
    return response.data.data;
  },

  async log(id: string, data: LogHabitData) {
    const response = await api.post<
      ApiResponse<{ log: HabitLog; pointsEarned: number; isNewCompletion: boolean }>
    >(`/habits/${id}/log`, data);
    return response.data.data;
  },

  async delete(id: string) {
    await api.delete(`/habits/${id}`);
  },
};
