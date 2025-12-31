import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
} from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { ExpenseCategory, Budget, CreateBudgetData } from '@/services';
import { formatCurrency } from '@/lib/utils';

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateBudgetData) => Promise<void>;
  categories: ExpenseCategory[];
  existingBudgets: Budget[];
  year: number;
  month: number;
  editingBudget?: Budget | null;
  isLoading?: boolean;
}

export function BudgetForm({
  open,
  onOpenChange,
  onSubmit,
  categories,
  existingBudgets,
  year,
  month,
  editingBudget,
  isLoading,
}: BudgetFormProps) {
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get categories that don't have budgets yet (unless editing)
  const availableCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (editingBudget && cat.id === editingBudget.categoryId) return true;
      return !existingBudgets.some((b) => b.categoryId === cat.id);
    });
  }, [categories, existingBudgets, editingBudget]);

  useEffect(() => {
    if (!open) return;

    if (editingBudget) {
      setCategoryId(editingBudget.categoryId);
      setAmount(String(parseFloat(editingBudget.amount)));
    } else {
      setCategoryId(availableCategories[0]?.id || '');
      setAmount('');
    }

    setErrors({});
  }, [open, editingBudget]);

  useEffect(() => {
    if (open && !editingBudget && !categoryId) {
      setCategoryId(availableCategories[0]?.id || '');
    }
  }, [open, availableCategories]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!categoryId) newErrors.categoryId = 'Category is required';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      categoryId,
      amount: parseFloat(amount),
      year,
      month,
    });
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const monthName = new Date(year, month - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{editingBudget ? 'Edit Budget' : 'Set Budget'}</DialogTitle>
          <DialogDescription>Set a spending limit for {monthName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={!!editingBudget}>
              <SelectTrigger className={errors.categoryId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
            {availableCategories.length === 0 && !editingBudget && (
              <p className="text-xs text-muted-foreground">All categories have budgets set</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Budget Amount (₹) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="100"
              placeholder="e.g., 10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={errors.amount ? 'border-destructive' : ''}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
          </div>

          {selectedCategory?.budgetLimit && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              💡 Category default limit: {formatCurrency(parseFloat(selectedCategory.budgetLimit))}
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (availableCategories.length === 0 && !editingBudget)}
            >
              {isLoading ? 'Saving...' : editingBudget ? 'Update Budget' : 'Set Budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
