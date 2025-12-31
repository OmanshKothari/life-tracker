import { Expense, ExpenseCategory, PaymentMethod, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { PaginatedResult } from './goals.repository';

export interface ExpenseFilters {
  userId: string;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  includeDeleted?: boolean;
}

export interface CreateExpenseData {
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  paymentMethod?: PaymentMethod;
  notes?: string | null;
}

export interface UpdateExpenseData {
  amount?: number;
  description?: string;
  categoryId?: string;
  date?: string;
  paymentMethod?: PaymentMethod;
  notes?: string | null;
}

export type ExpenseWithCategory = Expense & {
  category: ExpenseCategory;
};

export class ExpenseRepository extends BaseRepository {
  /**
   * Find all expenses with filters and pagination
   */
  async findAll(
    filters: ExpenseFilters,
    pagination: { page: number; limit: number }
  ): Promise<PaginatedResult<ExpenseWithCategory>> {
    const { userId, categoryId, startDate, endDate, includeDeleted } = filters;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.ExpenseWhereInput = {
      userId,
      ...this.includeDeleted(includeDeleted || false),
      ...(categoryId && { categoryId }),
      ...(startDate &&
        endDate && {
          date: { gte: startDate, lte: endDate },
        }),
    };

    const [data, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      hasMore: skip + data.length < total,
    };
  }

  /**
   * Find expense by ID
   */
  async findById(id: string, userId: string): Promise<ExpenseWithCategory | null> {
    return this.prisma.expense.findFirst({
      where: { id, userId, ...this.notDeleted },
      include: { category: true },
    });
  }

  /**
   * Create a new expense
   */
  async create(userId: string, data: CreateExpenseData): Promise<ExpenseWithCategory> {
    return this.prisma.expense.create({
      data: {
        userId,
        amount: data.amount,
        description: data.description,
        categoryId: data.categoryId,
        date: new Date(data.date + 'T00:00:00.000Z'),
        paymentMethod: data.paymentMethod || 'UPI',
        notes: data.notes,
      },
      include: { category: true },
    });
  }

  /**
   * Update an expense
   */
  async update(
    id: string,
    userId: string,
    data: UpdateExpenseData
  ): Promise<ExpenseWithCategory | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    return this.prisma.expense.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.date !== undefined && { date: new Date(data.date + 'T00:00:00.000Z') }),
        ...(data.paymentMethod !== undefined && { paymentMethod: data.paymentMethod }),
        ...(data.notes !== undefined && { notes: data.notes }),
        updatedAt: new Date(),
      },
      include: { category: true },
    });
  }

  /**
   * Soft delete an expense
   */
  async softDelete(id: string, userId: string): Promise<Expense | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    return this.prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Get monthly summary by category
   */
  async getMonthlySummary(
    userId: string,
    year: number,
    month: number
  ): Promise<
    Array<{
      categoryId: string;
      categoryName: string;
      categoryIcon: string;
      total: number;
      count: number;
    }>
  > {
    const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
        ...this.notDeleted,
      },
      include: { category: true },
    });

    // Group by category
    const categoryMap = new Map<
      string,
      { categoryName: string; categoryIcon: string; total: number; count: number }
    >();

    for (const expense of expenses) {
      const existing = categoryMap.get(expense.categoryId) || {
        categoryName: expense.category.name,
        categoryIcon: expense.category.icon,
        total: 0,
        count: 0,
      };
      existing.total += Number(expense.amount);
      existing.count += 1;
      categoryMap.set(expense.categoryId, existing);
    }

    return Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
      categoryId,
      ...data,
    }));
  }

  /**
   * Get total expenses for a period
   */
  async getTotalForPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await this.prisma.expense.aggregate({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
        ...this.notDeleted,
      },
      _sum: { amount: true },
    });
    return Number(result._sum.amount) || 0;
  }

  /**
   * Get all categories for a user
   */
  async getCategories(userId: string): Promise<ExpenseCategory[]> {
    return this.prisma.expenseCategory.findMany({
      where: {
        OR: [{ userId }, { isDefault: true }],
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
  }
}

export const expenseRepository = new ExpenseRepository();
