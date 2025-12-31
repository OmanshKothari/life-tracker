import { useState } from 'react';
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
import { SavingsGoal } from '@/services';
import { formatCurrency } from '@/lib/utils';

interface AddToSavingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: SavingsGoal | null;
  onConfirm: (amount: number) => Promise<void>;
  isLoading?: boolean;
}

export function AddToSavingsDialog({
  open,
  onOpenChange,
  goal,
  onConfirm,
  isLoading,
}: AddToSavingsDialogProps) {
  const [amount, setAmount] = useState('');

  const handleConfirm = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    await onConfirm(numAmount);
    setAmount('');
  };

  if (!goal) return null;

  const currentAmount = parseFloat(goal.currentAmount);
  const targetAmount = parseFloat(goal.targetAmount);
  const remaining = targetAmount - currentAmount;
  const newAmount = currentAmount + (parseFloat(amount) || 0);
  const newProgress = Math.min(100, Math.round((newAmount / targetAmount) * 100));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Add to Savings</DialogTitle>
          <DialogDescription>Add money to "{goal.name}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center space-y-1">
            <div className="text-sm text-muted-foreground">Current Progress</div>
            <div className="text-2xl font-bold">
              {formatCurrency(currentAmount)} / {formatCurrency(targetAmount)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(remaining)} remaining
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Add (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="rounded-lg bg-green-50 p-3 border border-green-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700">New progress:</span>
                <span className="font-bold text-green-700">{newProgress}%</span>
              </div>
              <div className="text-xs text-green-600 mt-1">
                {formatCurrency(newAmount)} / {formatCurrency(targetAmount)}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            variant="success"
          >
            {isLoading ? 'Adding...' : 'Add Savings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
