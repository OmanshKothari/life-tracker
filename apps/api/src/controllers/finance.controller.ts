import { Request, Response, NextFunction } from 'express';
import { financeService } from '../services/finance.service';
import { profileService } from '../services';
import { sendSuccess, sendCreated, sendDeleted, sendPaginated } from '../utils/response';

// ============ EXPENSES ============

export async function listExpenses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const { page = 1, limit = 20, categoryId, startDate, endDate } = req.query as any;

    const result = await financeService.getExpenses(userId, {
      page: Number(page),
      limit: Number(limit),
      categoryId,
      startDate,
      endDate,
    });

    sendPaginated(res, result.data, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
    });
  } catch (error) {
    next(error);
  }
}

export async function getExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const expense = await financeService.getExpenseById(req.params.id, userId);
    sendSuccess(res, expense);
  } catch (error) {
    next(error);
  }
}

export async function createExpense(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const expense = await financeService.createExpense(userId, req.body);
    sendCreated(res, expense);
  } catch (error) {
    next(error);
  }
}

export async function updateExpense(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const expense = await financeService.updateExpense(req.params.id, userId, req.body);
    sendSuccess(res, expense);
  } catch (error) {
    next(error);
  }
}

export async function deleteExpense(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    await financeService.deleteExpense(req.params.id, userId);
    sendDeleted(res, req.params.id);
  } catch (error) {
    next(error);
  }
}

export async function getExpenseCategories(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const categories = await financeService.getExpenseCategories(userId);
    sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
}

export async function getExpenseSummary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const { year, month } = req.query as any;
    const now = new Date();
    const summary = await financeService.getExpenseSummary(
      userId,
      Number(year) || now.getFullYear(),
      Number(month) || now.getMonth() + 1
    );
    sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
}

// ============ INCOME ============

export async function listIncomes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const { page = 1, limit = 20, startDate, endDate } = req.query as any;

    const result = await financeService.getIncomes(userId, {
      page: Number(page),
      limit: Number(limit),
      startDate,
      endDate,
    });

    sendPaginated(res, result.data, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
    });
  } catch (error) {
    next(error);
  }
}

export async function getIncome(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const income = await financeService.getIncomeById(req.params.id, userId);
    sendSuccess(res, income);
  } catch (error) {
    next(error);
  }
}

export async function createIncome(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const income = await financeService.createIncome(userId, req.body);
    sendCreated(res, income);
  } catch (error) {
    next(error);
  }
}

export async function updateIncome(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const income = await financeService.updateIncome(req.params.id, userId, req.body);
    sendSuccess(res, income);
  } catch (error) {
    next(error);
  }
}

export async function deleteIncome(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    await financeService.deleteIncome(req.params.id, userId);
    sendDeleted(res, req.params.id);
  } catch (error) {
    next(error);
  }
}

// ============ BUDGETS ============

export async function getBudgets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const { year, month } = req.query as any;
    const now = new Date();
    const budgets = await financeService.getBudgets(
      userId,
      Number(year) || now.getFullYear(),
      Number(month) || now.getMonth() + 1
    );
    sendSuccess(res, budgets);
  } catch (error) {
    next(error);
  }
}

export async function setBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const budget = await financeService.setBudget(userId, req.body);
    sendSuccess(res, budget);
  } catch (error) {
    next(error);
  }
}

export async function deleteBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    await financeService.deleteBudget(req.params.id, userId);
    sendDeleted(res, req.params.id);
  } catch (error) {
    next(error);
  }
}

export async function getBudgetVsActual(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const { year, month } = req.query as any;
    const now = new Date();
    const comparison = await financeService.getBudgetVsActual(
      userId,
      Number(year) || now.getFullYear(),
      Number(month) || now.getMonth() + 1
    );
    sendSuccess(res, comparison);
  } catch (error) {
    next(error);
  }
}

// ============ SAVINGS GOALS ============

export async function listSavingsGoals(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const { page = 1, limit = 20 } = req.query as any;

    const result = await financeService.getSavingsGoals(userId, {
      page: Number(page),
      limit: Number(limit),
    });

    sendPaginated(res, result.data, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSavingsGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const goal = await financeService.getSavingsGoalById(req.params.id, userId);
    sendSuccess(res, goal);
  } catch (error) {
    next(error);
  }
}

export async function createSavingsGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const { goal, achievements } = await financeService.createSavingsGoal(userId, req.body);
    sendCreated(res, { ...goal, achievements });
  } catch (error) {
    next(error);
  }
}

export async function updateSavingsGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const goal = await financeService.updateSavingsGoal(req.params.id, userId, req.body);
    sendSuccess(res, goal);
  } catch (error) {
    next(error);
  }
}

export async function addToSavings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const { amount } = req.body as { amount: number };
    const { goal, achievements } = await financeService.addToSavings(req.params.id, userId, amount);
    sendSuccess(res, { ...goal, achievements });
  } catch (error) {
    next(error);
  }
}

export async function deleteSavingsGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    await financeService.deleteSavingsGoal(req.params.id, userId);
    sendDeleted(res, req.params.id);
  } catch (error) {
    next(error);
  }
}

export async function getSavingsStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const stats = await financeService.getSavingsStats(userId);
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}

// ============ DASHBOARD ============

export async function getFinanceDashboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = await profileService.getCurrentUserId();
    const { year, month } = req.query as any;
    const now = new Date();
    const dashboard = await financeService.getFinanceDashboard(
      userId,
      Number(year) || now.getFullYear(),
      Number(month) || now.getMonth() + 1
    );
    sendSuccess(res, dashboard);
  } catch (error) {
    next(error);
  }
}
