import { useEffect, useState } from 'react';
import { useFinanceStore } from '@/stores';
import { Expense, Income, CreateExpenseData, CreateIncomeData, CreateBudgetData } from '@/services';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Progress,
  ConfirmDialog,
} from '@/components/ui';
import { ExpenseForm, IncomeForm, BudgetOverview } from '@/components/finance';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from 'lucide-react';

type TabType = 'overview' | 'expenses' | 'income' | 'budgets';

export function Finance() {
  const {
    dashboard,
    categories,
    expenses,
    incomes,
    budgets,
    budgetComparison,
    selectedYear,
    selectedMonth,
    isLoading,
    setSelectedPeriod,
    refreshAll,
    createExpense,
    updateExpense,
    deleteExpense,
    createIncome,
    updateIncome,
    deleteIncome,
    setBudget,
    deleteBudget,
  } = useFinanceStore();

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Form states
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  // Delete states
  const [deleteExpenseOpen, setDeleteExpenseOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [deleteIncomeOpen, setDeleteIncomeOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    refreshAll();
  }, []);

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const goToPrevMonth = () => {
    const newMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const newYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    setSelectedPeriod(newYear, newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
    const newYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
    setSelectedPeriod(newYear, newMonth);
  };

  // Expense handlers
  const handleExpenseSubmit = async (data: CreateExpenseData) => {
    setIsSubmitting(true);
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, data);
        toast({ title: 'Expense updated' });
      } else {
        await createExpense(data);
        toast({ title: 'Expense added', variant: 'success' });
      }
      setExpenseFormOpen(false);
      setEditingExpense(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to save expense', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      await deleteExpense(expenseToDelete.id);
      toast({ title: 'Expense deleted' });
      setDeleteExpenseOpen(false);
      setExpenseToDelete(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  // Income handlers
  const handleIncomeSubmit = async (data: CreateIncomeData) => {
    setIsSubmitting(true);
    try {
      if (editingIncome) {
        await updateIncome(editingIncome.id, data);
        toast({ title: 'Income updated' });
      } else {
        await createIncome(data);
        toast({ title: 'Income added', variant: 'success' });
      }
      setIncomeFormOpen(false);
      setEditingIncome(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to save income', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIncome = async () => {
    if (!incomeToDelete) return;
    try {
      await deleteIncome(incomeToDelete.id);
      toast({ title: 'Income deleted' });
      setDeleteIncomeOpen(false);
      setIncomeToDelete(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  // Budget handlers
  const handleSetBudget = async (data: CreateBudgetData) => {
    setIsSubmitting(true);
    try {
      await setBudget(data);
      toast({ title: 'Budget saved', variant: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save budget', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await deleteBudget(id);
      toast({ title: 'Budget removed' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete budget', variant: 'destructive' });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'expenses', label: 'Expenses', icon: '💸' },
    { id: 'income', label: 'Income', icon: '💰' },
    { id: 'budgets', label: 'Budgets', icon: '📋' },
  ] as const;

  if (isLoading && !dashboard) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh]">
        <div className="text-center">
          <div className="text-4xl animate-pulse">💰</div>
          <p className="mt-2 text-muted-foreground">Loading finances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Finance</h1>
          <p className="text-muted-foreground">Track your money flow</p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center font-medium">{monthName}</span>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboard && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Income</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(dashboard.totalIncome)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expenses</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(dashboard.totalExpenses)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Wallet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net</p>
                    <p
                      className={`text-xl font-bold ${dashboard.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatCurrency(dashboard.netIncome)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <PiggyBank className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Savings Rate</p>
                    <p className="text-xl font-bold text-purple-600">{dashboard.savingsRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expenses by Category */}
          {dashboard.expensesByCategory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.expensesByCategory.map((cat) => (
                  <div key={cat.categoryId} className="flex items-center gap-3">
                    <span className="text-xl">{cat.categoryIcon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{cat.categoryName}</span>
                        <span className="font-medium">{formatCurrency(cat.total)}</span>
                      </div>
                      <Progress
                        value={(cat.total / dashboard.totalExpenses) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Budget Status Preview */}
          {budgetComparison.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Budget Status</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('budgets')}>
                    View All →
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {budgetComparison.slice(0, 3).map((b) => {
                    const isOver = b.percentUsed >= 100;
                    const isNear = b.percentUsed >= 80;
                    return (
                      <div key={b.categoryId} className="flex items-center gap-3">
                        <span className="text-lg">{b.categoryIcon}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{b.categoryName}</span>
                            <span
                              className={`font-medium ${isOver ? 'text-red-600' : isNear ? 'text-amber-600' : 'text-green-600'}`}
                            >
                              {b.percentUsed}%
                            </span>
                          </div>
                          <Progress
                            value={Math.min(b.percentUsed, 100)}
                            className="h-2"
                            indicatorClassName={
                              isOver ? 'bg-red-500' : isNear ? 'bg-amber-500' : 'bg-green-500'
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={() => {
                setEditingExpense(null);
                setExpenseFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingIncome(null);
                setIncomeFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Income
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('budgets')}>
              📋 Manage Budgets
            </Button>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Expenses this month</h2>
            <Button
              onClick={() => {
                setEditingExpense(null);
                setExpenseFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>

          {expenses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <span className="text-4xl mb-4">💸</span>
                <p className="text-muted-foreground">No expenses this month</p>
                <Button className="mt-4" onClick={() => setExpenseFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Expense
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <Card key={expense.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{expense.category.icon}</span>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.category.name} • {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-red-600">
                        -{formatCurrency(parseFloat(expense.amount))}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingExpense(expense);
                          setExpenseFormOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => {
                          setExpenseToDelete(expense);
                          setDeleteExpenseOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Income Tab */}
      {activeTab === 'income' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Income this month</h2>
            <Button
              onClick={() => {
                setEditingIncome(null);
                setIncomeFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Income
            </Button>
          </div>

          {incomes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <span className="text-4xl mb-4">💰</span>
                <p className="text-muted-foreground">No income recorded this month</p>
                <Button className="mt-4" onClick={() => setIncomeFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Income
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {incomes.map((income) => (
                <Card key={income.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {income.category === 'SALARY'
                          ? '💼'
                          : income.category === 'FREELANCE'
                            ? '💻'
                            : income.category === 'INVESTMENTS'
                              ? '📈'
                              : income.category === 'GIFTS'
                                ? '🎁'
                                : income.category === 'BONUS'
                                  ? '🎉'
                                  : '📦'}
                      </span>
                      <div>
                        <p className="font-medium">{income.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {income.category} • {formatDate(income.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-600">
                        +{formatCurrency(parseFloat(income.amount))}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingIncome(income);
                          setIncomeFormOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => {
                          setIncomeToDelete(income);
                          setDeleteIncomeOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <BudgetOverview
          budgets={budgets}
          budgetComparison={budgetComparison}
          categories={categories}
          year={selectedYear}
          month={selectedMonth}
          onSetBudget={handleSetBudget}
          onDeleteBudget={handleDeleteBudget}
          isLoading={isSubmitting}
        />
      )}

      {/* Forms */}
      <ExpenseForm
        open={expenseFormOpen}
        onOpenChange={setExpenseFormOpen}
        onSubmit={handleExpenseSubmit}
        categories={categories}
        expense={editingExpense}
        isLoading={isSubmitting}
      />

      <IncomeForm
        open={incomeFormOpen}
        onOpenChange={setIncomeFormOpen}
        onSubmit={handleIncomeSubmit}
        income={editingIncome}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmations */}
      <ConfirmDialog
        open={deleteExpenseOpen}
        onOpenChange={setDeleteExpenseOpen}
        title="Delete Expense"
        description={`Delete expense "${expenseToDelete?.description}"?`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteExpense}
      />

      <ConfirmDialog
        open={deleteIncomeOpen}
        onOpenChange={setDeleteIncomeOpen}
        title="Delete Income"
        description={`Delete income "${incomeToDelete?.description}"?`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteIncome}
      />
    </div>
  );
}
