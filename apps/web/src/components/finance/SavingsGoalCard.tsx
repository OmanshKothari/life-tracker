import { SavingsGoal } from '@/services';
import { Card, CardContent, Badge, Button, Progress } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MoreHorizontal, Pencil, Trash2, Plus, Target } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (goal: SavingsGoal) => void;
  onAddMoney: (goal: SavingsGoal) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-green-100 text-green-800',
};

export function SavingsGoalCard({ goal, onEdit, onDelete, onAddMoney }: SavingsGoalCardProps) {
  const currentAmount = parseFloat(goal.currentAmount);
  const targetAmount = parseFloat(goal.targetAmount);
  const progress = Math.round((currentAmount / targetAmount) * 100);
  const isCompleted = currentAmount >= targetAmount;

  return (
    <Card
      className={`transition-all hover:shadow-md ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}>
              <Target className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{goal.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs ${PRIORITY_COLORS[goal.priority]}`}>
                  {goal.priority}
                </Badge>
                {isCompleted && (
                  <Badge variant="success" className="text-xs">
                    ✓ Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isCompleted && (
                <DropdownMenuItem onClick={() => onAddMoney(goal)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Money
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(goal)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress */}
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{formatCurrency(currentAmount)}</span>
            <span className="text-muted-foreground">{formatCurrency(targetAmount)}</span>
          </div>
          <Progress
            value={Math.min(progress, 100)}
            className="h-2"
            indicatorClassName={isCompleted ? 'bg-green-500' : undefined}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress}% saved</span>
            <span>{formatCurrency(targetAmount - currentAmount)} to go</span>
          </div>
        </div>

        {/* Target Date */}
        <div className="text-xs text-muted-foreground">Target: {formatDate(goal.targetDate)}</div>

        {/* Notes */}
        {goal.notes && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{goal.notes}</p>
        )}

        {/* Add Money Button (mobile-friendly) */}
        {!isCompleted && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={() => onAddMoney(goal)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Money
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
