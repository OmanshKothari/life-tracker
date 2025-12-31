import { useState, useEffect } from 'react';
import { Habit, TodayStatus } from '@/services';
import { Card, CardContent, Badge, Button, Input } from '@/components/ui';
import { Check, Flame, MoreHorizontal, Pencil, Trash2, Pause, Play, History } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HabitTodayCardProps {
  status: TodayStatus;
  onToggle: (habit: Habit, completed: boolean, value?: number) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  onToggleActive: (habit: Habit) => void;
  onViewLogs: (habit: Habit) => void;
}

export function HabitTodayCard({
  status,
  onToggle,
  onEdit,
  onDelete,
  onToggleActive,
  onViewLogs,
}: HabitTodayCardProps) {
  const { habit, completed, value } = status;
  const isNumeric = habit.type === 'NUMERIC';

  // Local state for optimistic updates
  const [localCompleted, setLocalCompleted] = useState(completed);
  const [localValue, setLocalValue] = useState(value || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync with props when they change from server
  useEffect(() => {
    setLocalCompleted(completed);
    setLocalValue(value || 0);
  }, [completed, value]);

  const handleToggle = async () => {
    if (isUpdating) return;

    const newCompleted = !localCompleted;
    setLocalCompleted(newCompleted);
    setIsUpdating(true);

    try {
      await onToggle(habit, newCompleted, isNumeric ? localValue : undefined);
    } catch {
      setLocalCompleted(!newCompleted);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNumericLog = async () => {
    if (isUpdating || localValue <= 0) return;

    const meetsTarget = localValue >= habit.dailyTarget;
    setLocalCompleted(meetsTarget);
    setIsUpdating(true);

    try {
      await onToggle(habit, meetsTarget, localValue);
    } catch {
      setLocalCompleted(completed);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className={`transition-all ${localCompleted ? 'bg-green-50 border-green-200' : ''}`}>
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className={`font-medium truncate ${localCompleted ? 'text-green-700' : ''}`}>
              {habit.name}
            </h3>
            {habit.currentStreak > 0 && (
              <Badge variant="outline" className="text-xs flex items-center gap-1 flex-shrink-0">
                <Flame className="w-3 h-3 text-orange-500" />
                {habit.currentStreak}
              </Badge>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(habit)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive(habit)}>
                {habit.isActive ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Habit
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Resume Habit
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(habit)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Action Area - Same layout for both types */}
        <div className="flex items-center gap-3">
          {/* Toggle/Status Button */}
          <button
            onClick={isNumeric ? undefined : handleToggle}
            disabled={isUpdating || isNumeric}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              localCompleted
                ? 'bg-green-500 text-white'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            } ${isUpdating ? 'opacity-50' : ''} ${!isNumeric ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {localCompleted ? <Check className="w-6 h-6" /> : <span className="text-xl">○</span>}
          </button>

          {/* Value Input / Info */}
          <div className="flex-1">
            {isNumeric ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={localValue || ''}
                  onChange={(e) => setLocalValue(parseInt(e.target.value) || 0)}
                  className="h-9 w-20 text-center"
                  placeholder="0"
                />
                <span className="text-sm text-muted-foreground">
                  / {habit.dailyTarget} {habit.unit}
                </span>
                <Button
                  size="sm"
                  onClick={handleNumericLog}
                  disabled={isUpdating || localValue <= 0}
                  className="ml-auto"
                >
                  Log
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {localCompleted ? 'Completed today!' : 'Tap circle to complete'}
                </span>
                <span className="text-sm text-purple-600 font-medium">
                  ⚡ {habit.pointsPerDay} XP
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer - XP for numeric & History button */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            {isNumeric && (
              <span className="text-sm text-purple-600 font-medium">
                ⚡ {habit.pointsPerDay} XP
              </span>
            )}
            {habit.bestStreak > 0 && (
              <span className="text-xs text-muted-foreground">Best: {habit.bestStreak} 🔥</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => onViewLogs(habit)}
          >
            <History className="w-3 h-3 mr-1" />
            History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
