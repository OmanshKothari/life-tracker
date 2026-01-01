import api, { ApiResponse } from './api';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  category: string;
  timeline: string;
  priority: string;
  status: string;
  startDate: string;
  targetDate: string;
  progress: number;
  pointsEarned: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoalFilters {
  status?: string;
  category?: string;
  timeline?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export interface CreateGoalData {
  title: string;
  category: string;
  timeline: string;
  priority: string;
  startDate: string;
  targetDate: string;
  notes?: string | null;
}

export interface UpdateGoalData extends Partial<CreateGoalData> {
  progress?: number;
  status?: string;
}

export interface GoalsListResponse {
  data: Goal[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface CompleteGoalResponse extends Goal {
  pointsAwarded: number;
  achievements?: Array<{
    code: string;
    name: string;
    description: string;
    icon: string;
    pointsAwarded: number;
  }>;
}

export const goalsApi = {
  async getAll(filters: GoalFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await api.get<ApiResponse<Goal[]>>(`/goals?${params}`);
    return {
      data: response.data.data,
      meta: response.data.meta || { total: 0, page: 1, limit: 20, hasMore: false },
    };
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<Goal>>(`/goals/${id}`);
    return response.data.data;
  },

  async create(data: CreateGoalData) {
    const response = await api.post<ApiResponse<Goal>>('/goals', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateGoalData) {
    const response = await api.patch<ApiResponse<Goal>>(`/goals/${id}`, data);
    return response.data.data;
  },

  async updateProgress(id: string, progress: number) {
    const response = await api.patch<ApiResponse<Goal>>(`/goals/${id}/progress`, { progress });
    return response.data.data;
  },

  async complete(id: string) {
    const response = await api.patch<ApiResponse<CompleteGoalResponse>>(`/goals/${id}/complete`);
    return response.data.data;
  },

  async delete(id: string) {
    await api.delete(`/goals/${id}`);
  },

  async restore(id: string) {
    const response = await api.patch<ApiResponse<Goal>>(`/goals/${id}/restore`);
    return response.data.data;
  },

  async getStats() {
    const response = await api.get<
      ApiResponse<{
        total: number;
        completed: number;
        inProgress: number;
        notStarted: number;
        onHold: number;
        completionRate: number;
        totalPoints: number;
      }>
    >('/goals/stats');
    return response.data.data;
  },
};
