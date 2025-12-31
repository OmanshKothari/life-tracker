import { create } from 'zustand';
import {
  financeApi,
  ExpenseCategory,
  Expense,
  Income,
  Budget,
  BudgetComparison,
  SavingsGoal,
  FinanceDashboard,
  CreateExpenseData,
  CreateIncomeData,
  CreateBudgetData,
  CreateSavingsGoalData,
} from '@/services';

interface FinanceState {
  // Data
  dashboard: FinanceDashboard | null;
  categories: ExpenseCategory[];
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  budgetComparison: BudgetComparison[];
  savingsGoals: SavingsGoal[];

  // Selected month/year
  selectedYear: number;
  selectedMonth: number;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedPeriod: (year: number, month: number) => void;
  fetchDashboard: (year?: number, month?: number) => Promise<void>;
  fetchCategories: () => Promise<void>;

  // Expenses
  fetchExpenses: (year?: number, month?: number) => Promise<void>;
  createExpense: (data: CreateExpenseData) => Promise<Expense>;
  updateExpense: (id: string, data: Partial<CreateExpenseData>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Income
  fetchIncomes: (year?: number, month?: number) => Promise<void>;
  createIncome: (data: CreateIncomeData) => Promise<Income>;
  updateIncome: (id: string, data: Partial<CreateIncomeData>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;

  // Budgets
  fetchBudgets: (year?: number, month?: number) => Promise<void>;
  fetchBudgetComparison: (year?: number, month?: number) => Promise<void>;
  setBudget: (data: CreateBudgetData) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;

  // Savings
  fetchSavingsGoals: () => Promise<void>;
  createSavingsGoal: (data: CreateSavingsGoalData) => Promise<SavingsGoal>;
  updateSavingsGoal: (id: string, data: Partial<CreateSavingsGoalData>) => Promise<void>;
  addToSavings: (id: string, amount: number) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;

  // Refresh all
  refreshAll: () => Promise<void>;
}

const now = new Date();

export const useFinanceStore = create<FinanceState>((set, get) => ({
  dashboard: null,
  categories: [],
  expenses: [],
  incomes: [],
  budgets: [],
  budgetComparison: [],
  savingsGoals: [],
  selectedYear: now.getFullYear(),
  selectedMonth: now.getMonth() + 1,
  isLoading: false,
  error: null,

  setSelectedPeriod: async (year, month) => {
    set({ selectedYear: year, selectedMonth: month, isLoading: true });

    // Fetch all data for the new period
    try {
      const [dashboard, expenses, incomes, budgetComparison] = await Promise.all([
        financeApi.getDashboard(year, month),
        get().fetchExpensesForPeriod(year, month),
        get().fetchIncomesForPeriod(year, month),
        financeApi.getBudgetComparison(year, month),
      ]);

      set({
        dashboard,
        budgetComparison,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch data for period:', error);
      set({ isLoading: false });
    }
  },

  fetchDashboard: async (year?: number, month?: number) => {
    const { selectedYear, selectedMonth } = get();
    const y = year ?? selectedYear;
    const m = month ?? selectedMonth;
    try {
      const dashboard = await financeApi.getDashboard(y, m);
      set({ dashboard });
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await financeApi.getCategories();
      set({ categories });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },

  // Helper function for fetching expenses
  fetchExpensesForPeriod: async (year: number, month: number) => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    try {
      const { data } = await financeApi.getExpenses({ startDate, endDate, limit: 100 });
      set({ expenses: data });
      return data;
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      return [];
    }
  },

  // Expenses
  fetchExpenses: async (year?: number, month?: number) => {
    const { selectedYear, selectedMonth } = get();
    const y = year ?? selectedYear;
    const m = month ?? selectedMonth;

    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2, '0')}-${lastDay}`;

    try {
      const { data } = await financeApi.getExpenses({ startDate, endDate, limit: 100 });
      set({ expenses: data });
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  },

  createExpense: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const expense = await financeApi.createExpense(data);
      const { selectedYear, selectedMonth } = get();
      await Promise.all([
        get().fetchExpenses(selectedYear, selectedMonth),
        get().fetchDashboard(selectedYear, selectedMonth),
      ]);
      set({ isLoading: false });
      return expense;
    } catch (error) {
      set({ error: 'Failed to create expense', isLoading: false });
      throw error;
    }
  },

  updateExpense: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await financeApi.updateExpense(id, data);
      const { selectedYear, selectedMonth } = get();
      await Promise.all([
        get().fetchExpenses(selectedYear, selectedMonth),
        get().fetchDashboard(selectedYear, selectedMonth),
      ]);
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update expense', isLoading: false });
      throw error;
    }
  },

  deleteExpense: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await financeApi.deleteExpense(id);
      set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id), isLoading: false }));
      const { selectedYear, selectedMonth } = get();
      await get().fetchDashboard(selectedYear, selectedMonth);
    } catch (error) {
      set({ error: 'Failed to delete expense', isLoading: false });
      throw error;
    }
  },

  // Helper function for fetching incomes
  fetchIncomesForPeriod: async (year: number, month: number) => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    try {
      const { data } = await financeApi.getIncomes({ startDate, endDate, limit: 100 });
      set({ incomes: data });
      return data;
    } catch (error) {
      console.error('Failed to fetch incomes:', error);
      return [];
    }
  },

  // Income
  fetchIncomes: async (year?: number, month?: number) => {
    const { selectedYear, selectedMonth } = get();
    const y = year ?? selectedYear;
    const m = month ?? selectedMonth;

    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2, '0')}-${lastDay}`;

    try {
      const { data } = await financeApi.getIncomes({ startDate, endDate, limit: 100 });
      set({ incomes: data });
    } catch (error) {
      console.error('Failed to fetch incomes:', error);
    }
  },

  createIncome: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const income = await financeApi.createIncome(data);
      const { selectedYear, selectedMonth } = get();
      await Promise.all([
        get().fetchIncomes(selectedYear, selectedMonth),
        get().fetchDashboard(selectedYear, selectedMonth),
      ]);
      set({ isLoading: false });
      return income;
    } catch (error) {
      set({ error: 'Failed to create income', isLoading: false });
      throw error;
    }
  },

  updateIncome: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await financeApi.updateIncome(id, data);
      const { selectedYear, selectedMonth } = get();
      await Promise.all([
        get().fetchIncomes(selectedYear, selectedMonth),
        get().fetchDashboard(selectedYear, selectedMonth),
      ]);
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update income', isLoading: false });
      throw error;
    }
  },

  deleteIncome: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await financeApi.deleteIncome(id);
      set((state) => ({ incomes: state.incomes.filter((i) => i.id !== id), isLoading: false }));
      const { selectedYear, selectedMonth } = get();
      await get().fetchDashboard(selectedYear, selectedMonth);
    } catch (error) {
      set({ error: 'Failed to delete income', isLoading: false });
      throw error;
    }
  },

  // Budgets
  fetchBudgets: async (year?: number, month?: number) => {
    const { selectedYear, selectedMonth } = get();
    const y = year ?? selectedYear;
    const m = month ?? selectedMonth;
    try {
      const budgets = await financeApi.getBudgets(y, m);
      set({ budgets });
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
    }
  },

  fetchBudgetComparison: async (year?: number, month?: number) => {
    const { selectedYear, selectedMonth } = get();
    const y = year ?? selectedYear;
    const m = month ?? selectedMonth;
    try {
      const comparison = await financeApi.getBudgetComparison(y, m);
      set({ budgetComparison: comparison });
    } catch (error) {
      console.error('Failed to fetch budget comparison:', error);
    }
  },

  setBudget: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const budget = await financeApi.setBudget(data);
      const { selectedYear, selectedMonth } = get();
      await Promise.all([
        get().fetchBudgets(selectedYear, selectedMonth),
        get().fetchBudgetComparison(selectedYear, selectedMonth),
      ]);
      set({ isLoading: false });
      return budget;
    } catch (error) {
      set({ error: 'Failed to set budget', isLoading: false });
      throw error;
    }
  },

  deleteBudget: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await financeApi.deleteBudget(id);
      set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id), isLoading: false }));
      const { selectedYear, selectedMonth } = get();
      await get().fetchBudgetComparison(selectedYear, selectedMonth);
    } catch (error) {
      set({ error: 'Failed to delete budget', isLoading: false });
      throw error;
    }
  },

  // Savings (not month-dependent)
  fetchSavingsGoals: async () => {
    try {
      const { data } = await financeApi.getSavingsGoals({ limit: 100 });
      set({ savingsGoals: data });
    } catch (error) {
      console.error('Failed to fetch savings goals:', error);
    }
  },

  createSavingsGoal: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const goal = await financeApi.createSavingsGoal(data);
      await get().fetchSavingsGoals();
      const { selectedYear, selectedMonth } = get();
      await get().fetchDashboard(selectedYear, selectedMonth);
      set({ isLoading: false });
      return goal;
    } catch (error) {
      set({ error: 'Failed to create savings goal', isLoading: false });
      throw error;
    }
  },

  updateSavingsGoal: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await financeApi.updateSavingsGoal(id, data);
      await get().fetchSavingsGoals();
      const { selectedYear, selectedMonth } = get();
      await get().fetchDashboard(selectedYear, selectedMonth);
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update savings goal', isLoading: false });
      throw error;
    }
  },

  addToSavings: async (id, amount) => {
    set({ isLoading: true, error: null });
    try {
      await financeApi.addToSavings(id, amount);
      await get().fetchSavingsGoals();
      const { selectedYear, selectedMonth } = get();
      await get().fetchDashboard(selectedYear, selectedMonth);
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to add to savings', isLoading: false });
      throw error;
    }
  },

  deleteSavingsGoal: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await financeApi.deleteSavingsGoal(id);
      set((state) => ({
        savingsGoals: state.savingsGoals.filter((s) => s.id !== id),
        isLoading: false,
      }));
      const { selectedYear, selectedMonth } = get();
      await get().fetchDashboard(selectedYear, selectedMonth);
    } catch (error) {
      set({ error: 'Failed to delete savings goal', isLoading: false });
      throw error;
    }
  },

  refreshAll: async () => {
    const { selectedYear, selectedMonth } = get();
    set({ isLoading: true });
    await Promise.all([
      get().fetchDashboard(selectedYear, selectedMonth),
      get().fetchCategories(),
      get().fetchExpenses(selectedYear, selectedMonth),
      get().fetchIncomes(selectedYear, selectedMonth),
      get().fetchBudgets(selectedYear, selectedMonth),
      get().fetchBudgetComparison(selectedYear, selectedMonth),
      get().fetchSavingsGoals(),
    ]);
    set({ isLoading: false });
  },
}));
