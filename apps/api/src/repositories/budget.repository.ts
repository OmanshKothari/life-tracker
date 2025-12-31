import { Budget, ExpenseCategory } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface CreateBudgetData {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export interface UpdateBudgetData {
  amount?: number;
}

export type BudgetWithCategory = Budget & {
  category: ExpenseCategory;
};

export class BudgetRepository extends BaseRepository {
  /**
   * Find all budgets for a month
   */
  async findByMonth(userId: string, year: number, month: number): Promise<BudgetWithCategory[]> {
    return this.prisma.budget.findMany({
      where: { userId, year, month },
      include: { category: true },
      orderBy: { category: { name: 'asc' } },
    });
  }

  /**
   * Find budget by category for a month
   */
  async findByCategoryAndMonth(
    userId: string,
    categoryId: string,
    year: number,
    month: number
  ): Promise<BudgetWithCategory | null> {
    return this.prisma.budget.findFirst({
      where: { userId, categoryId, year, month },
      include: { category: true },
    });
  }

  /**
   * Create or update budget (upsert)
   */
  async upsert(userId: string, data: CreateBudgetData): Promise<BudgetWithCategory> {
    return this.prisma.budget.upsert({
      where: {
        userId_categoryId_year_month: {
          userId,
          categoryId: data.categoryId,
          year: data.year,
          month: data.month,
        },
      },
      update: { amount: data.amount, updatedAt: new Date() },
      create: {
        userId,
        categoryId: data.categoryId,
        amount: data.amount,
        year: data.year,
        month: data.month,
      },
      include: { category: true },
    });
  }

  /**
   * Delete a budget
   */
  async delete(id: string, userId: string): Promise<Budget | null> {
    const existing = await this.prisma.budget.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    return this.prisma.budget.delete({ where: { id } });
  }

  /**
   * Get budget vs actual spending for a month
   */
  async getBudgetVsActual(
    userId: string,
    year: number,
    month: number
  ): Promise<
    Array<{
      categoryId: string;
      categoryName: string;
      categoryIcon: string;
      budgeted: number;
      spent: number;
      remaining: number;
      percentUsed: number;
    }>
  > {
    const budgets = await this.findByMonth(userId, year, month);

    const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get expenses grouped by category
    const expenses = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      _sum: { amount: true },
    });

    const expenseMap = new Map(expenses.map((e) => [e.categoryId, Number(e._sum.amount) || 0]));

    return budgets.map((budget) => {
      const spent = expenseMap.get(budget.categoryId) || 0;
      const budgeted = Number(budget.amount);
      const remaining = budgeted - spent;
      const percentUsed = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;

      return {
        categoryId: budget.categoryId,
        categoryName: budget.category.name,
        categoryIcon: budget.category.icon,
        budgeted,
        spent,
        remaining,
        percentUsed,
      };
    });
  }
}

export const budgetRepository = new BudgetRepository();
