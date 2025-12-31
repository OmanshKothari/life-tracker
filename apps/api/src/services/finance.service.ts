import { Income, Budget, SavingsGoal, ExpenseCategory, IncomeCategory } from '@prisma/client';
import {
  expenseRepository,
  incomeRepository,
  budgetRepository,
  savingsGoalRepository,
  ExpenseWithCategory,
  BudgetWithCategory,
  PaginatedResult,
} from '../repositories';
import { profileService } from './profile.service';
import { ApiError } from '../middlewares/errorHandler';

// ============ EXPENSE SERVICE ============

export interface ExpenseQueryInput {
  page: number;
  limit: number;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

class FinanceService {
  // -------- Expenses --------

  async getExpenses(
    userId: string,
    query: ExpenseQueryInput
  ): Promise<PaginatedResult<ExpenseWithCategory>> {
    return expenseRepository.findAll(
      {
        userId,
        categoryId: query.categoryId,
        startDate: query.startDate ? new Date(query.startDate + 'T00:00:00.000Z') : undefined,
        endDate: query.endDate ? new Date(query.endDate + 'T23:59:59.999Z') : undefined,
      },
      { page: query.page, limit: query.limit }
    );
  }

  async getExpenseById(id: string, userId: string): Promise<ExpenseWithCategory> {
    const expense = await expenseRepository.findById(id, userId);
    if (!expense) throw ApiError.notFound('Expense');
    return expense;
  }

  async createExpense(
    userId: string,
    data: {
      amount: number;
      description: string;
      categoryId: string;
      date: string;
      paymentMethod?: string;
      notes?: string | null;
    }
  ): Promise<ExpenseWithCategory> {
    return expenseRepository.create(userId, data as any);
  }

  async updateExpense(
    id: string,
    userId: string,
    data: {
      amount?: number;
      description?: string;
      categoryId?: string;
      date?: string;
      paymentMethod?: string;
      notes?: string | null;
    }
  ): Promise<ExpenseWithCategory> {
    const expense = await expenseRepository.update(id, userId, data as any);
    if (!expense) throw ApiError.notFound('Expense');
    return expense;
  }

  async deleteExpense(id: string, userId: string): Promise<void> {
    const expense = await expenseRepository.softDelete(id, userId);
    if (!expense) throw ApiError.notFound('Expense');
  }

  async getExpenseCategories(userId: string): Promise<ExpenseCategory[]> {
    return expenseRepository.getCategories(userId);
  }

  async getExpenseSummary(userId: string, year: number, month: number) {
    return expenseRepository.getMonthlySummary(userId, year, month);
  }

  // -------- Income --------

  async getIncomes(
    userId: string,
    query: { page: number; limit: number; startDate?: string; endDate?: string }
  ): Promise<PaginatedResult<Income>> {
    return incomeRepository.findAll(
      {
        userId,
        startDate: query.startDate ? new Date(query.startDate + 'T00:00:00.000Z') : undefined,
        endDate: query.endDate ? new Date(query.endDate + 'T23:59:59.999Z') : undefined,
      },
      { page: query.page, limit: query.limit }
    );
  }

  async getIncomeById(id: string, userId: string): Promise<Income> {
    const income = await incomeRepository.findById(id, userId);
    if (!income) throw ApiError.notFound('Income');
    return income;
  }

  async createIncome(
    userId: string,
    data: {
      amount: number;
      description: string;
      category: IncomeCategory;
      date: string;
      notes?: string | null;
    }
  ): Promise<Income> {
    return incomeRepository.create(userId, data);
  }

  async updateIncome(
    id: string,
    userId: string,
    data: {
      amount?: number;
      description?: string;
      category?: IncomeCategory;
      date?: string;
      notes?: string | null;
    }
  ): Promise<Income> {
    const income = await incomeRepository.update(id, userId, data);
    if (!income) throw ApiError.notFound('Income');
    return income;
  }

  async deleteIncome(id: string, userId: string): Promise<void> {
    const income = await incomeRepository.softDelete(id, userId);
    if (!income) throw ApiError.notFound('Income');
  }

  async getIncomeSummary(userId: string, year: number, month: number) {
    return incomeRepository.getMonthlySummary(userId, year, month);
  }

  // -------- Budgets --------

  async getBudgets(userId: string, year: number, month: number): Promise<BudgetWithCategory[]> {
    return budgetRepository.findByMonth(userId, year, month);
  }

  async setBudget(
    userId: string,
    data: { categoryId: string; amount: number; year: number; month: number }
  ): Promise<BudgetWithCategory> {
    return budgetRepository.upsert(userId, data);
  }

  async deleteBudget(id: string, userId: string): Promise<void> {
    const budget = await budgetRepository.delete(id, userId);
    if (!budget) throw ApiError.notFound('Budget');
  }

  async getBudgetVsActual(userId: string, year: number, month: number) {
    return budgetRepository.getBudgetVsActual(userId, year, month);
  }

  // -------- Savings Goals --------

  async getSavingsGoals(
    userId: string,
    query: { page: number; limit: number }
  ): Promise<PaginatedResult<SavingsGoal>> {
    return savingsGoalRepository.findAll({ userId }, { page: query.page, limit: query.limit });
  }

  async getSavingsGoalById(id: string, userId: string): Promise<SavingsGoal> {
    const goal = await savingsGoalRepository.findById(id, userId);
    if (!goal) throw ApiError.notFound('Savings goal');
    return goal;
  }

  async createSavingsGoal(
    userId: string,
    data: {
      name: string;
      targetAmount: number;
      currentAmount?: number;
      startDate: string;
      targetDate: string;
      priority?: string;
      notes?: string | null;
    }
  ): Promise<SavingsGoal> {
    const goal = await savingsGoalRepository.create(userId, data as any);
    await this.updateProfileTotalSaved(userId);
    return goal;
  }

  async updateSavingsGoal(
    id: string,
    userId: string,
    data: {
      name?: string;
      targetAmount?: number;
      currentAmount?: number;
      targetDate?: string;
      priority?: string;
      notes?: string | null;
    }
  ): Promise<SavingsGoal> {
    const goal = await savingsGoalRepository.update(id, userId, data as any);
    if (!goal) throw ApiError.notFound('Savings goal');
    await this.updateProfileTotalSaved(userId);
    return goal;
  }

  async addToSavings(id: string, userId: string, amount: number): Promise<SavingsGoal> {
    const goal = await savingsGoalRepository.addAmount(id, userId, amount);
    if (!goal) throw ApiError.notFound('Savings goal');
    await this.updateProfileTotalSaved(userId);
    return goal;
  }

  async deleteSavingsGoal(id: string, userId: string): Promise<void> {
    const goal = await savingsGoalRepository.softDelete(id, userId);
    if (!goal) throw ApiError.notFound('Savings goal');
    await this.updateProfileTotalSaved(userId);
  }

  async getSavingsStats(userId: string) {
    return savingsGoalRepository.getStats(userId);
  }

  // -------- Dashboard Stats --------

  async getFinanceDashboard(userId: string, year: number, month: number) {
    const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const [
      totalExpenses,
      totalIncome,
      expenseSummary,
      incomeSummary,
      budgetVsActual,
      savingsStats,
    ] = await Promise.all([
      expenseRepository.getTotalForPeriod(userId, startDate, endDate),
      incomeRepository.getTotalForPeriod(userId, startDate, endDate),
      expenseRepository.getMonthlySummary(userId, year, month),
      incomeRepository.getMonthlySummary(userId, year, month),
      budgetRepository.getBudgetVsActual(userId, year, month),
      savingsGoalRepository.getStats(userId),
    ]);

    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round((netIncome / totalIncome) * 100) : 0;

    return {
      month: { year, month },
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate,
      expensesByCategory: expenseSummary,
      incomeBySource: incomeSummary,
      budgetVsActual,
      savings: savingsStats,
    };
  }

  // -------- Helper --------

  private async updateProfileTotalSaved(userId: string): Promise<void> {
    const totalSaved = await savingsGoalRepository.getTotalSaved(userId);
    await profileService.updateTotalSaved(totalSaved);
  }
}

export const financeService = new FinanceService();
