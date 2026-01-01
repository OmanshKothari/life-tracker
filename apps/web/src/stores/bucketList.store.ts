import { create } from 'zustand';
import {
  bucketListApi,
  BucketItem,
  BucketListFilters,
  CreateBucketItemData,
  BucketListStats,
} from '@/services';

interface BucketListState {
  items: BucketItem[];
  stats: BucketListStats | null;
  pagination: { total: number; page: number; limit: number; hasMore: boolean };
  filters: BucketListFilters;
  isLoading: boolean;
  error: string | null;

  fetchItems: (filters?: BucketListFilters) => Promise<void>;
  fetchStats: () => Promise<void>;
  createItem: (data: CreateBucketItemData) => Promise<BucketItem>;
  updateItem: (id: string, data: Partial<CreateBucketItemData>) => Promise<void>;
  completeItem: (
    id: string,
    notes?: string
  ) => Promise<{
    pointsAwarded: number;
    achievements: Array<{
      code: string;
      name: string;
      description: string;
      icon: string;
      pointsAwarded: number;
    }>;
  }>;
  deleteItem: (id: string) => Promise<void>;
  setFilters: (filters: BucketListFilters) => void;
}

export const useBucketListStore = create<BucketListState>((set, get) => ({
  items: [],
  stats: null,
  pagination: { total: 0, page: 1, limit: 20, hasMore: false },
  filters: {},
  isLoading: false,
  error: null,

  fetchItems: async (filters?: BucketListFilters) => {
    const activeFilters = filters || get().filters;
    set({ isLoading: true, error: null, filters: activeFilters });

    try {
      const response = await bucketListApi.getAll(activeFilters);
      set({ items: response.data, pagination: response.meta, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch items',
        isLoading: false,
      });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await bucketListApi.getStats();
      set({ stats });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  createItem: async (data: CreateBucketItemData) => {
    set({ isLoading: true, error: null });
    try {
      const item = await bucketListApi.create(data);
      await Promise.all([get().fetchItems(), get().fetchStats()]);
      set({ isLoading: false });
      return item;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create item',
        isLoading: false,
      });
      throw error;
    }
  },

  updateItem: async (id: string, data: Partial<CreateBucketItemData>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await bucketListApi.update(id, data);
      set((state) => ({
        items: state.items.map((i) => (i.id === id ? updated : i)),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update item',
        isLoading: false,
      });
      throw error;
    }
  },

  completeItem: async (id: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bucketListApi.complete(id, notes);
      await Promise.all([get().fetchItems(), get().fetchStats()]);
      set({ isLoading: false });
      return { pointsAwarded: result.pointsAwarded, achievements: result.achievements || [] };
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to complete item',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteItem: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await bucketListApi.delete(id);
      set((state) => ({ items: state.items.filter((i) => i.id !== id), isLoading: false }));
      await get().fetchStats();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete item',
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters: BucketListFilters) => {
    set({ filters });
    get().fetchItems(filters);
  },
}));
