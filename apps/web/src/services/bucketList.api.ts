import api, { ApiResponse } from './api';

export interface BucketItem {
  id: string;
  userId: string;
  title: string;
  category: 'TRAVEL' | 'SKILLS' | 'EXPERIENCES' | 'MILESTONES';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
  estimatedCost: string;
  isCompleted: boolean;
  completedAt: string | null;
  pointsEarned: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BucketListFilters {
  category?: string;
  difficulty?: string;
  isCompleted?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateBucketItemData {
  title: string;
  category: 'TRAVEL' | 'SKILLS' | 'EXPERIENCES' | 'MILESTONES';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
  estimatedCost?: number;
  notes?: string | null;
}

export interface BucketListStats {
  total: number;
  completed: number;
  pending: number;
  totalPoints: number;
  byCategory: Record<string, number>;
}

export const bucketListApi = {
  async getAll(filters: BucketListFilters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.isCompleted !== undefined)
      params.append('isCompleted', String(filters.isCompleted));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await api.get<ApiResponse<BucketItem[]>>(`/bucket-list?${params}`);
    return {
      data: response.data.data,
      meta: response.data.meta || { total: 0, page: 1, limit: 20, hasMore: false },
    };
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<BucketItem>>(`/bucket-list/${id}`);
    return response.data.data;
  },

  async create(data: CreateBucketItemData) {
    const response = await api.post<ApiResponse<BucketItem>>('/bucket-list', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateBucketItemData>) {
    const response = await api.patch<ApiResponse<BucketItem>>(`/bucket-list/${id}`, data);
    return response.data.data;
  },

  async complete(id: string, notes?: string) {
    const response = await api.patch<
      ApiResponse<
        BucketItem & {
          pointsAwarded: number;
          achievements?: Array<{
            code: string;
            name: string;
            description: string;
            icon: string;
            pointsAwarded: number;
          }>;
        }
      >
    >(`/bucket-list/${id}/complete`, { notes });
    return response.data.data;
  },

  async delete(id: string) {
    await api.delete(`/bucket-list/${id}`);
  },

  async getStats() {
    const response = await api.get<ApiResponse<BucketListStats>>('/bucket-list/stats');
    return response.data.data;
  },
};
