import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import {
  idParamSchema,
  paginationSchema,
  createExpenseSchema,
  updateExpenseSchema,
  createIncomeSchema,
  updateIncomeSchema,
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
  addFundsSchema,
} from '@life-tracker/shared';
import { z } from 'zod';
import {
  // Expenses
  listExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseCategories,
  getExpenseSummary,
  // Income
  listIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
  // Budgets
  getBudgets,
  setBudget,
  deleteBudget,
  getBudgetVsActual,
  // Savings
  listSavingsGoals,
  getSavingsGoal,
  createSavingsGoal,
  updateSavingsGoal,
  addToSavings,
  deleteSavingsGoal,
  getSavingsStats,
  // Dashboard
  getFinanceDashboard,
} from '../controllers/finance.controller';

const router: Router = Router();

// Budget schema (not in shared yet)
const setBudgetSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.coerce.number().positive(),
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

// Dashboard
router.get('/dashboard', getFinanceDashboard);

// Expense Categories
router.get('/categories', getExpenseCategories);

// Expenses
router.get('/expenses', validateRequest({ query: paginationSchema }), listExpenses);
router.get('/expenses/summary', getExpenseSummary);
router.get('/expenses/:id', validateRequest({ params: idParamSchema }), getExpense);
router.post('/expenses', validateRequest({ body: createExpenseSchema }), createExpense);
router.patch(
  '/expenses/:id',
  validateRequest({ params: idParamSchema, body: updateExpenseSchema }),
  updateExpense
);
router.delete('/expenses/:id', validateRequest({ params: idParamSchema }), deleteExpense);

// Income
router.get('/income', validateRequest({ query: paginationSchema }), listIncomes);
router.get('/income/:id', validateRequest({ params: idParamSchema }), getIncome);
router.post('/income', validateRequest({ body: createIncomeSchema }), createIncome);
router.patch(
  '/income/:id',
  validateRequest({ params: idParamSchema, body: updateIncomeSchema }),
  updateIncome
);
router.delete('/income/:id', validateRequest({ params: idParamSchema }), deleteIncome);

// Budgets
router.get('/budgets', getBudgets);
router.get('/budgets/comparison', getBudgetVsActual);
router.post('/budgets', validateRequest({ body: setBudgetSchema }), setBudget);
router.delete('/budgets/:id', validateRequest({ params: idParamSchema }), deleteBudget);

// Savings Goals
router.get('/savings', validateRequest({ query: paginationSchema }), listSavingsGoals);
router.get('/savings/stats', getSavingsStats);
router.get('/savings/:id', validateRequest({ params: idParamSchema }), getSavingsGoal);
router.post('/savings', validateRequest({ body: createSavingsGoalSchema }), createSavingsGoal);
router.patch(
  '/savings/:id',
  validateRequest({ params: idParamSchema, body: updateSavingsGoalSchema }),
  updateSavingsGoal
);
router.post(
  '/savings/:id/add',
  validateRequest({ params: idParamSchema, body: addFundsSchema }),
  addToSavings
);
router.delete('/savings/:id', validateRequest({ params: idParamSchema }), deleteSavingsGoal);

export default router;
