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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { Habit, CreateHabitData } from '@/services';

interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateHabitData) => Promise<void>;
  habit?: Habit | null;
  isLoading?: boolean;
}

export function HabitForm({ open, onOpenChange, onSubmit, habit, isLoading }: HabitFormProps) {
  const isEditing = !!habit;

  const [name, setName] = useState('');
  const [type, setType] = useState<'BINARY' | 'NUMERIC'>('BINARY');
  const [unit, setUnit] = useState('');
  const [dailyTarget, setDailyTarget] = useState('1');
  const [pointsPerDay, setPointsPerDay] = useState('5');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (habit) {
        setName(habit.name);
        setType(habit.type);
        setUnit(habit.unit || '');
        setDailyTarget(String(habit.dailyTarget));
        setPointsPerDay(String(habit.pointsPerDay));
      } else {
        setName('');
        setType('BINARY');
        setUnit('');
        setDailyTarget('1');
        setPointsPerDay('5');
      }
      setErrors({});
    }
  }, [open, habit]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (type === 'NUMERIC' && !unit.trim()) newErrors.unit = 'Unit is required for numeric habits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      name: name.trim(),
      type,
      unit: type === 'NUMERIC' ? unit.trim() : undefined,
      dailyTarget: parseInt(dailyTarget),
      pointsPerDay: parseInt(pointsPerDay),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your habit details.' : 'Build a new habit and earn XP daily!'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Habit Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Drink water, Read, Exercise"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'BINARY' | 'NUMERIC')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BINARY">✓ Yes/No (Did I do it?)</SelectItem>
                <SelectItem value="NUMERIC">🔢 Numeric (How much?)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'NUMERIC' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">
                  Unit <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="unit"
                  placeholder="e.g., glasses, pages, mins"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className={errors.unit ? 'border-destructive' : ''}
                />
                {errors.unit && <p className="text-sm text-destructive">{errors.unit}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Daily Target</Label>
                <Input
                  id="target"
                  type="number"
                  min="1"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="points">Points per Day (1-100)</Label>
            <Input
              id="points"
              type="number"
              min="1"
              max="100"
              value={pointsPerDay}
              onChange={(e) => setPointsPerDay(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Higher points for harder habits. Default is 5 XP.
            </p>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Daily XP:</span>
              <span className="font-semibold text-purple-600">⚡ {pointsPerDay} XP</span>
            </div>
          </div>

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
              {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Habit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
