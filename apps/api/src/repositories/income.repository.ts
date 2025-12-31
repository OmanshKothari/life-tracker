import { Income, IncomeCategory, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { PaginatedResult } from './goals.repository';

export interface IncomeFilters {
  userId: string;
  category?: IncomeCategory;
  startDate?: Date;
  endDate?: Date;
  includeDeleted?: boolean;
}

export interface CreateIncomeData {
  amount: number;
  description: string;
  category: IncomeCategory;
  date: string;
  notes?: string | null;
}

export interface UpdateIncomeData {
  amount?: number;
  description?: string;
  category?: IncomeCategory;
  date?: string;
  notes?: string | null;
}

export class IncomeRepository extends BaseRepository {
  /**
   * Find all income records with filters
   */
  async findAll(
    filters: IncomeFilters,
    pagination: { page: number; limit: number }
  ): Promise<PaginatedResult<Income>> {
    const { userId, category, startDate, endDate, includeDeleted } = filters;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.IncomeWhereInput = {
      userId,
      ...this.includeDeleted(includeDeleted || false),
      ...(category && { category }),
      ...(startDate && endDate && { date: { gte: startDate, lte: endDate } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.income.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.income.count({ where }),
    ]);

    return { data, total, page, limit, hasMore: skip + data.length < total };
  }

  /**
   * Find income by ID
   */
  async findById(id: string, userId: string): Promise<Income | null> {
    return this.prisma.income.findFirst({
      where: { id, userId, ...this.notDeleted },
    });
  }

  /**
   * Create income record
   */
  async create(userId: string, data: CreateIncomeData): Promise<Income> {
    return this.prisma.income.create({
      data: {
        userId,
        amount: data.amount,
        description: data.description,
        category: data.category,
        date: new Date(data.date + 'T00:00:00.000Z'),
        notes: data.notes,
      },
    });
  }

  /**
   * Update income record
   */
  async update(id: string, userId: string, data: UpdateIncomeData): Promise<Income | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    return this.prisma.income.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.date !== undefined && { date: new Date(data.date + 'T00:00:00.000Z') }),
        ...(data.notes !== undefined && { notes: data.notes }),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Soft delete income
   */
  async softDelete(id: string, userId: string): Promise<Income | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    return this.prisma.income.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Get total income for period
   */
  async getTotalForPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await this.prisma.income.aggregate({
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
   * Get monthly income by category
   */
  async getMonthlySummary(
    userId: string,
    year: number,
    month: number
  ): Promise<Array<{ category: IncomeCategory; total: number; count: number }>> {
    const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const incomes = await this.prisma.income.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
        ...this.notDeleted,
      },
    });

    const categoryMap = new Map<IncomeCategory, { total: number; count: number }>();
    for (const income of incomes) {
      const existing = categoryMap.get(income.category) || { total: 0, count: 0 };
      existing.total += Number(income.amount);
      existing.count += 1;
      categoryMap.set(income.category, existing);
    }

    return Array.from(categoryMap.entries()).map(([category, data]) => ({ category, ...data }));
  }
}

export const incomeRepository = new IncomeRepository();
