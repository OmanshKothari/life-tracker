import { Budget, BudgetComparison, ExpenseCategory, CreateBudgetData } from '@/services';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Progress,
  ConfirmDialog,
} from '@/components/ui';
import { BudgetForm } from './BudgetForm';
import { BudgetComparisonCard } from './BudgetComparisonCard';
import { formatCurrency } from '@/lib/utils';
import { Plus, PieChart, TrendingUp, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface BudgetOverviewProps {
  budgets: Budget[];
  budgetComparison: BudgetComparison[];
  categories: ExpenseCategory[];
  year: number;
  month: number;
  onSetBudget: (data: CreateBudgetData) => Promise<void>;
  onDeleteBudget: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function BudgetOverview({
  budgets,
  budgetComparison,
  categories,
  year,
  month,
  onSetBudget,
  onDeleteBudget,
  isLoading,
}: BudgetOverviewProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  // Calculate totals
  const totalBudgeted = budgetComparison.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = budgetComparison.reduce((sum, b) => sum + b.spent, 0);
  const overallPercent = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;
  const overBudgetCount = budgetComparison.filter((b) => b.percentUsed >= 100).length;
  const nearLimitCount = budgetComparison.filter(
    (b) => b.percentUsed >= 80 && b.percentUsed < 100
  ).length;

  const handleSubmit = async (data: CreateBudgetData) => {
    await onSetBudget(data);
    setFormOpen(false);
    setEditingBudget(null);
  };

  const handleDelete = async () => {
    if (!budgetToDelete) return;
    await onDeleteBudget(budgetToDelete.id);
    setDeleteOpen(false);
    setBudgetToDelete(null);
  };

  const monthName = new Date(year, month - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Budget for {monthName}</h2>
          <p className="text-sm text-muted-foreground">{budgets.length} categories budgeted</p>
        </div>
        <Button
          onClick={() => {
            setEditingBudget(null);
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Set Budget
        </Button>
      </div>

      {/* Summary Cards */}
      {budgets.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Total Budget */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <PieChart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-xl font-bold">{formatCurrency(totalBudgeted)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${overallPercent >= 100 ? 'bg-red-100' : overallPercent >= 80 ? 'bg-amber-100' : 'bg-green-100'}`}
                >
                  <TrendingUp
                    className={`w-5 h-5 ${overallPercent >= 100 ? 'text-red-600' : overallPercent >= 80 ? 'text-amber-600' : 'text-green-600'}`}
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Used</p>
                  <p
                    className={`text-xl font-bold ${overallPercent >= 100 ? 'text-red-600' : overallPercent >= 80 ? 'text-amber-600' : 'text-green-600'}`}
                  >
                    {overallPercent}%
                  </p>
                </div>
              </div>
              <Progress
                value={Math.min(overallPercent, 100)}
                className="mt-2 h-2"
                indicatorClassName={
                  overallPercent >= 100
                    ? 'bg-red-500'
                    : overallPercent >= 80
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                }
              />
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${overBudgetCount > 0 ? 'bg-red-100' : 'bg-green-100'}`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 ${overBudgetCount > 0 ? 'text-red-600' : 'text-green-600'}`}
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alerts</p>
                  {overBudgetCount > 0 ? (
                    <p className="text-sm font-medium text-red-600">
                      {overBudgetCount} over budget
                    </p>
                  ) : nearLimitCount > 0 ? (
                    <p className="text-sm font-medium text-amber-600">
                      {nearLimitCount} near limit
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-green-600">All on track!</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Cards */}
      {budgetComparison.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <span className="text-4xl mb-4">📊</span>
            <h3 className="text-lg font-semibold mb-2">No Budgets Set</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Set spending limits for each category to track your expenses and stay on budget.
            </p>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Set Your First Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgetComparison.map((comparison) => {
            const budget = budgets.find((b) => b.categoryId === comparison.categoryId);
            return (
              <BudgetComparisonCard
                key={comparison.categoryId}
                comparison={comparison}
                budget={budget}
                onEdit={(b) => {
                  setEditingBudget(b);
                  setFormOpen(true);
                }}
                onDelete={(b) => {
                  setBudgetToDelete(b);
                  setDeleteOpen(true);
                }}
              />
            );
          })}
        </div>
      )}

      {/* Quick Add for Unbudgeted Categories */}
      {budgets.length > 0 && budgets.length < categories.length && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unbudgeted Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter((cat) => !budgets.some((b) => b.categoryId === cat.id))
                .map((cat) => (
                  <Button
                    key={cat.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingBudget(null);
                      setFormOpen(true);
                    }}
                  >
                    {cat.icon} {cat.name}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <BudgetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        categories={categories}
        existingBudgets={budgets}
        year={year}
        month={month}
        editingBudget={editingBudget}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Budget"
        description={`Remove budget for "${budgetToDelete?.category?.name || 'this category'}"? You can always set it again later.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
