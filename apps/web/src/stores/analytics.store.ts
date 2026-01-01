import { create } from 'zustand';
import {
  analyticsApi,
  ReportData,
  TrendData,
  WeeklyPeriod,
  MonthlyPeriod,
  ExportType,
  PeriodType,
} from '../services/analytics.api';

interface AnalyticsState {
  // Data
  weeklyReport: ReportData | null;
  monthlyReport: ReportData | null;
  trends: TrendData | null;

  // Loading states
  isLoadingWeekly: boolean;
  isLoadingMonthly: boolean;
  isLoadingTrends: boolean;
  isExporting: boolean;

  // Error
  error: string | null;

  // Actions
  fetchWeeklyReport: (period?: WeeklyPeriod) => Promise<void>;
  fetchMonthlyReport: (period?: MonthlyPeriod) => Promise<void>;
  fetchTrends: (type?: 'weekly' | 'monthly') => Promise<void>;
  exportCSV: (type?: ExportType) => Promise<void>;
  exportPDF: (period?: PeriodType) => Promise<void>;
  exportJSON: () => Promise<void>;
  clearError: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  // Initial state
  weeklyReport: null,
  monthlyReport: null,
  trends: null,
  isLoadingWeekly: false,
  isLoadingMonthly: false,
  isLoadingTrends: false,
  isExporting: false,
  error: null,

  /**
   * Fetch weekly report
   */
  fetchWeeklyReport: async (period: WeeklyPeriod = 'this_week') => {
    set({ isLoadingWeekly: true, error: null });
    try {
      const report = await analyticsApi.getWeeklyReport(period);
      set({ weeklyReport: report, isLoadingWeekly: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch weekly report',
        isLoadingWeekly: false,
      });
    }
  },

  /**
   * Fetch monthly report
   */
  fetchMonthlyReport: async (period: MonthlyPeriod = 'this_month') => {
    set({ isLoadingMonthly: true, error: null });
    try {
      const report = await analyticsApi.getMonthlyReport(period);
      set({ monthlyReport: report, isLoadingMonthly: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch monthly report',
        isLoadingMonthly: false,
      });
    }
  },

  /**
   * Fetch trend analysis
   */
  fetchTrends: async (type: 'weekly' | 'monthly' = 'weekly') => {
    set({ isLoadingTrends: true, error: null });
    try {
      const trends = await analyticsApi.getTrends(type);
      set({ trends, isLoadingTrends: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch trends',
        isLoadingTrends: false,
      });
    }
  },

  /**
   * Export data as CSV
   */
  exportCSV: async (type: ExportType = 'all') => {
    set({ isExporting: true, error: null });
    try {
      await analyticsApi.exportCSV(type);
      set({ isExporting: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to export CSV',
        isExporting: false,
      });
    }
  },

  /**
   * Export PDF report
   */
  exportPDF: async (period: PeriodType = 'this_week') => {
    set({ isExporting: true, error: null });
    try {
      const pdfData = await analyticsApi.getPDFReportData(period);

      // Use browser print functionality for PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(generatePDFHTML(pdfData));
        printWindow.document.close();
        printWindow.print();
      }

      set({ isExporting: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to export PDF',
        isExporting: false,
      });
    }
  },

  /**
   * Export all data as JSON
   */
  exportJSON: async () => {
    set({ isExporting: true, error: null });
    try {
      await analyticsApi.exportJSON();
      set({ isExporting: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to export JSON',
        isExporting: false,
      });
    }
  },

  /**
   * Clear error
   */
  clearError: () => set({ error: null }),
}));

/**
 * Generate HTML for PDF printing
 */
function generatePDFHTML(data: any): string {
  const { title, generatedAt, period, summary, details } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #1f2937; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; }
        h2 { color: #374151; margin-top: 30px; }
        .period { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
        .summary-card { background: #f9fafb; padding: 20px; border-radius: 8px; }
        .summary-value { font-size: 32px; font-weight: bold; color: #f59e0b; }
        .summary-label { color: #6b7280; font-size: 14px; }
        .section { margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px; }
        .highlight-good { color: #10b981; }
        .highlight-bad { color: #ef4444; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f3f4f6; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>📊 ${title}</h1>
      <p class="period">Period: ${period.label} | Generated: ${new Date(generatedAt).toLocaleString()}</p>
      
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-value">${summary.goalsCompleted}</div>
          <div class="summary-label">Goals Completed</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">${summary.habitsCompletionRate}%</div>
          <div class="summary-label">Habits Consistency</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">${summary.xpEarned}</div>
          <div class="summary-label">XP Earned</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">${summary.savingsRate}%</div>
          <div class="summary-label">Savings Rate</div>
        </div>
      </div>

      <h2>🎯 Goals</h2>
      <div class="section">
        <p>Created: ${details.goals.created} | Completed: ${details.goals.completed} | In Progress: ${details.goals.inProgress}</p>
        <p>Completion Rate: <strong>${details.goals.completionRate}%</strong> | Points Earned: <strong>${details.goals.pointsEarned} XP</strong></p>
      </div>

      <h2>🔁 Habits</h2>
      <div class="section">
        <p>Active Habits: ${details.habits.totalHabits} | Completions: ${details.habits.completionsCount}</p>
        <p>Consistency: <strong>${details.habits.completionRate}%</strong> | Best Streak: <strong>${details.habits.bestStreak} days</strong></p>
        ${
          details.habits.habitPerformance.length > 0
            ? `
          <table>
            <tr><th>Habit</th><th>Completion Rate</th><th>Current Streak</th></tr>
            ${details.habits.habitPerformance
              .slice(0, 5)
              .map(
                (h: any) => `
              <tr><td>${h.name}</td><td>${h.rate}%</td><td>${h.currentStreak} days</td></tr>
            `
              )
              .join('')}
          </table>
        `
            : ''
        }
      </div>

      <h2>💰 Finance</h2>
      <div class="section">
        <p>Income: ₹${details.finance.totalIncome.toLocaleString()} | Expenses: ₹${details.finance.totalExpenses.toLocaleString()}</p>
        <p>Net: <strong class="${details.finance.netIncome >= 0 ? 'highlight-good' : 'highlight-bad'}">₹${details.finance.netIncome.toLocaleString()}</strong></p>
        <p>Savings Rate: <strong>${details.finance.savingsRate}%</strong> | Budget Adherence: <strong>${details.finance.budgetAdherence}%</strong></p>
      </div>

      <h2>✨ Highlights</h2>
      <div class="section">
        ${
          details.highlights.bestPerforming.length > 0
            ? `
          <p class="highlight-good"><strong>Best Performing:</strong></p>
          <ul>${details.highlights.bestPerforming.map((h: string) => `<li>${h}</li>`).join('')}</ul>
        `
            : ''
        }
        ${
          details.highlights.needsAttention.length > 0
            ? `
          <p class="highlight-bad"><strong>Needs Attention:</strong></p>
          <ul>${details.highlights.needsAttention.map((h: string) => `<li>${h}</li>`).join('')}</ul>
        `
            : ''
        }
      </div>

      <div class="footer">
        <p>Life Tracker - Generated on ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;
}
