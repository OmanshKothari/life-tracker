import api, { ApiResponse } from './api';

// ============ TYPES ============

export interface ExpenseCategory {
  id: string;
  userId: string;
  name: string;
  icon: string;
  budgetLimit: string | null;
  isDefault: boolean;
}

export interface Expense {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: string;
  categoryId: string;
  paymentMethod: 'CASH' | 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER';
  notes: string | null;
  category: ExpenseCategory;
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: string;
  category: 'SALARY' | 'FREELANCE' | 'INVESTMENTS' | 'GIFTS' | 'BONUS' | 'OTHER';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: string;
  month: number;
  year: number;
  category: ExpenseCategory;
}

export interface BudgetComparison {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentUsed: number;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  startDate: string;
  targetDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceDashboard {
  month: { year: number; month: number };
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  expensesByCategory: Array<{
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    total: number;
    count: number;
  }>;
  incomeBySource: Array<{
    category: string;
    total: number;
    count: number;
  }>;
  budgetVsActual: BudgetComparison[];
  savings: {
    totalGoals: number;
    completedGoals: number;
    totalTarget: number;
    totalSaved: number;
    progressPercent: number;
  };
}

// ============ CREATE TYPES ============

export interface CreateExpenseData {
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  paymentMethod: 'CASH' | 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER';
  notes?: string | null;
}

export interface CreateIncomeData {
  amount: number;
  description: string;
  category: string;
  date: string;
  notes?: string | null;
}

export interface CreateBudgetData {
  categoryId: string;
  amount: number;
  year: number;
  month: number;
}

export interface CreateSavingsGoalData {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  startDate: string;
  targetDate: string;
  priority?: string;
  notes?: string | null;
}

// ============ API ============

export const financeApi = {
  // Dashboard
  async getDashboard(year?: number, month?: number) {
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (month) params.append('month', String(month));
    const response = await api.get<ApiResponse<FinanceDashboard>>(`/finance/dashboard?${params}`);
    return response.data.data;
  },

  // Categories
  async getCategories() {
    const response = await api.get<ApiResponse<ExpenseCategory[]>>('/finance/categories');
    return response.data.data;
  },

  // Expenses
  async getExpenses(
    filters: {
      page?: number;
      limit?: number;
      categoryId?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    const response = await api.get<ApiResponse<Expense[]>>(`/finance/expenses?${params}`);
    return { data: response.data.data, meta: response.data.meta };
  },

  async createExpense(data: CreateExpenseData) {
    const response = await api.post<ApiResponse<Expense>>('/finance/expenses', data);
    return response.data.data;
  },

  async updateExpense(id: string, data: Partial<CreateExpenseData>) {
    const response = await api.patch<ApiResponse<Expense>>(`/finance/expenses/${id}`, data);
    return response.data.data;
  },

  async deleteExpense(id: string) {
    await api.delete(`/finance/expenses/${id}`);
  },

  // Income
  async getIncomes(
    filters: { page?: number; limit?: number; startDate?: string; endDate?: string } = {}
  ) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    const response = await api.get<ApiResponse<Income[]>>(`/finance/income?${params}`);
    return { data: response.data.data, meta: response.data.meta };
  },

  async createIncome(data: CreateIncomeData) {
    const response = await api.post<ApiResponse<Income>>('/finance/income', data);
    return response.data.data;
  },

  async updateIncome(id: string, data: Partial<CreateIncomeData>) {
    const response = await api.patch<ApiResponse<Income>>(`/finance/income/${id}`, data);
    return response.data.data;
  },

  async deleteIncome(id: string) {
    await api.delete(`/finance/income/${id}`);
  },

  // Budgets
  async getBudgets(year?: number, month?: number) {
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (month) params.append('month', String(month));
    const response = await api.get<ApiResponse<Budget[]>>(`/finance/budgets?${params}`);
    return response.data.data;
  },

  async getBudgetComparison(year?: number, month?: number) {
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (month) params.append('month', String(month));
    const response = await api.get<ApiResponse<BudgetComparison[]>>(
      `/finance/budgets/comparison?${params}`
    );
    return response.data.data;
  },

  async setBudget(data: CreateBudgetData) {
    const response = await api.post<ApiResponse<Budget>>('/finance/budgets', data);
    return response.data.data;
  },

  async deleteBudget(id: string) {
    await api.delete(`/finance/budgets/${id}`);
  },

  // Savings Goals
  async getSavingsGoals(filters: { page?: number; limit?: number } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    const response = await api.get<ApiResponse<SavingsGoal[]>>(`/finance/savings?${params}`);
    return { data: response.data.data, meta: response.data.meta };
  },

  async getSavingsStats() {
    const response =
      await api.get<ApiResponse<FinanceDashboard['savings']>>('/finance/savings/stats');
    return response.data.data;
  },

  async createSavingsGoal(data: CreateSavingsGoalData) {
    const response = await api.post<ApiResponse<SavingsGoal>>('/finance/savings', data);
    return response.data.data;
  },

  async updateSavingsGoal(id: string, data: Partial<CreateSavingsGoalData>) {
    const response = await api.patch<ApiResponse<SavingsGoal>>(`/finance/savings/${id}`, data);
    return response.data.data;
  },

  async addToSavings(id: string, amount: number) {
    const response = await api.post<ApiResponse<SavingsGoal>>(`/finance/savings/${id}/add`, {
      amount,
    });
    return response.data.data;
  },

  async deleteSavingsGoal(id: string) {
    await api.delete(`/finance/savings/${id}`);
  },
};
