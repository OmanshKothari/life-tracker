import api from './api';

/**
 * Goals Analytics Data
 */
export interface GoalsAnalytics {
  created: number;
  completed: number;
  inProgress: number;
  completionRate: number;
  pointsEarned: number;
  byCategory: Array<{ category: string; count: number; completed: number }>;
  byPriority: Array<{ priority: string; count: number; completed: number }>;
}

/**
 * Habits Analytics Data
 */
export interface HabitsAnalytics {
  totalHabits: number;
  completionsCount: number;
  completionRate: number;
  pointsEarned: number;
  bestStreak: number;
  averageStreak: number;
  habitPerformance: Array<{
    id: string;
    name: string;
    completions: number;
    targetDays: number;
    rate: number;
    currentStreak: number;
  }>;
}

/**
 * Bucket List Analytics Data
 */
export interface BucketListAnalytics {
  total: number;
  completed: number;
  completionRate: number;
  pointsEarned: number;
  byDifficulty: Array<{ difficulty: string; count: number; completed: number }>;
  byCategory: Array<{ category: string; count: number; completed: number }>;
}

/**
 * Finance Analytics Data
 */
export interface FinanceAnalytics {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  totalSaved: number;
  expensesByCategory: Array<{ category: string; amount: number; percentage: number }>;
  incomeBySource: Array<{ category: string; amount: number; percentage: number }>;
  budgetAdherence: number;
  overBudgetCategories: Array<{
    category: string;
    budget: number;
    actual: number;
    overage: number;
  }>;
}

/**
 * Gamification Analytics Data
 */
export interface GamificationAnalytics {
  xpEarned: number;
  achievementsUnlocked: number;
  currentLevel: number;
  levelProgress: number;
}

/**
 * Complete Report Data
 */
export interface ReportData {
  period: {
    type: 'weekly' | 'monthly';
    startDate: string;
    endDate: string;
    label: string;
  };
  goals: GoalsAnalytics;
  habits: HabitsAnalytics;
  bucketList: BucketListAnalytics;
  finance: FinanceAnalytics;
  gamification: GamificationAnalytics;
  highlights: {
    bestPerforming: string[];
    needsAttention: string[];
  };
}

/**
 * Trend Comparison Data
 */
export interface TrendData {
  current: ReportData;
  previous: ReportData;
  comparison: {
    goalsCompletedChange: number;
    habitsCompletionRateChange: number;
    expensesChange: number;
    incomeChange: number;
    savingsRateChange: number;
    xpChange: number;
  };
}

/**
 * PDF Report Data
 */
export interface PDFReportData {
  title: string;
  generatedAt: string;
  period: ReportData['period'];
  summary: {
    goalsCompleted: number;
    habitsCompletionRate: number;
    xpEarned: number;
    savingsRate: number;
  };
  details: ReportData;
}

export type WeeklyPeriod = 'this_week' | 'last_week';
export type MonthlyPeriod = 'this_month' | 'last_month';
export type PeriodType = WeeklyPeriod | MonthlyPeriod;
export type ExportType = 'goals' | 'habits' | 'bucket_list' | 'expenses' | 'incomes' | 'all';

/**
 * Analytics API Service
 */
export const analyticsApi = {
  /**
   * Get weekly report
   */
  getWeeklyReport: async (period: WeeklyPeriod = 'this_week'): Promise<ReportData> => {
    const response = await api.get('/analytics/weekly', { params: { period } });
    return response.data.data;
  },

  /**
   * Get monthly report
   */
  getMonthlyReport: async (period: MonthlyPeriod = 'this_month'): Promise<ReportData> => {
    const response = await api.get('/analytics/monthly', { params: { period } });
    return response.data.data;
  },

  /**
   * Get trend analysis
   */
  getTrends: async (type: 'weekly' | 'monthly' = 'weekly'): Promise<TrendData> => {
    const response = await api.get('/analytics/trends', { params: { type } });
    return response.data.data;
  },

  /**
   * Export data as CSV (triggers download)
   */
  exportCSV: async (type: ExportType = 'all'): Promise<void> => {
    const response = await api.get('/analytics/export/csv', {
      params: { type },
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `life-tracker-export-${type}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Get PDF report data
   */
  getPDFReportData: async (period: PeriodType = 'this_week'): Promise<PDFReportData> => {
    const response = await api.get('/analytics/export/pdf', { params: { period } });
    return response.data.data;
  },

  /**
   * Export all data as JSON (triggers download)
   */
  exportJSON: async (): Promise<void> => {
    const response = await api.get('/analytics/export/json', {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `life-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
