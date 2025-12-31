import { useState, useEffect } from 'react';
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
  Textarea,
} from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { SavingsGoal, CreateSavingsGoalData } from '@/services';

interface SavingsGoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSavingsGoalData) => Promise<void>;
  goal?: SavingsGoal | null;
  isLoading?: boolean;
}

const PRIORITIES = [
  { value: 'HIGH', label: '🔴 High' },
  { value: 'MEDIUM', label: '🟡 Medium' },
  { value: 'LOW', label: '🟢 Low' },
];

export function SavingsGoalForm({
  open,
  onOpenChange,
  onSubmit,
  goal,
  isLoading,
}: SavingsGoalFormProps) {
  const isEditing = !!goal;

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (goal) {
        setName(goal.name);
        setTargetAmount(String(parseFloat(goal.targetAmount)));
        setCurrentAmount(String(parseFloat(goal.currentAmount)));
        setStartDate(goal.startDate.split('T')[0]);
        setTargetDate(goal.targetDate.split('T')[0]);
        setPriority(goal.priority);
        setNotes(goal.notes || '');
      } else {
        setName('');
        setTargetAmount('');
        setCurrentAmount('0');
        setStartDate(new Date().toISOString().split('T')[0]);
        setTargetDate('');
        setPriority('MEDIUM');
        setNotes('');
      }
      setErrors({});
    }
  }, [open, goal]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!targetAmount || parseFloat(targetAmount) <= 0)
      newErrors.targetAmount = 'Target amount is required';
    if (!targetDate) newErrors.targetDate = 'Target date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      startDate,
      targetDate,
      priority,
      notes: notes.trim() || null,
    });
  };

  const progressPercent =
    targetAmount && parseFloat(targetAmount) > 0
      ? Math.round((parseFloat(currentAmount || '0') / parseFloat(targetAmount)) * 100)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Savings Goal' : 'New Savings Goal'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your savings goal.' : 'Create a new savings goal to track.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Goal Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Emergency Fund, Vacation, New Laptop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">
                Target Amount (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="targetAmount"
                type="number"
                min="0"
                step="1"
                placeholder="100000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className={errors.targetAmount ? 'border-destructive' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentAmount">Current Saved (₹)</Label>
              <Input
                id="currentAmount"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">
                Target Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={errors.targetDate ? 'border-destructive' : ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {targetAmount && parseFloat(targetAmount) > 0 && (
            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-semibold">{progressPercent}%</span>
              </div>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
