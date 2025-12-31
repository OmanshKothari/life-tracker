import { useState, useEffect, useRef, useCallback } from 'react';
import { Goal } from '@/services';
import { Card, CardContent, CardHeader, CardTitle, Badge, Progress, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { MoreHorizontal, Pencil, Trash2, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onComplete: (goal: Goal) => void;
  onUpdateProgress: (goal: Goal, progress: number) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  CAREER: '💼',
  HEALTH: '🏃',
  LEARNING: '📚',
  RELATIONSHIPS: '❤️',
  FINANCE: '💰',
  PERSONAL_GROWTH: '🌱',
  OTHER: '📌',
};

export function GoalCard({ goal, onEdit, onDelete, onComplete, onUpdateProgress }: GoalCardProps) {
  const isCompleted = goal.status === 'COMPLETED';
  const categoryIcon = CATEGORY_ICONS[goal.category] || '📌';

  // Local state for optimistic updates
  const [localProgress, setLocalProgress] = useState(goal.progress);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSentProgress = useRef(goal.progress);

  // Sync local state when goal.progress changes from server
  useEffect(() => {
    setLocalProgress(goal.progress);
    lastSentProgress.current = goal.progress;
  }, [goal.progress]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleProgressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newProgress = parseInt(e.target.value, 10);
      setLocalProgress(newProgress);

      // Clear existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Set new timer for API call
      debounceTimer.current = setTimeout(() => {
        if (newProgress !== lastSentProgress.current) {
          lastSentProgress.current = newProgress;
          onUpdateProgress(goal, newProgress);
        }
      }, 500);
    },
    [goal, onUpdateProgress]
  );

  return (
    <Card className={`transition-all hover:shadow-md ${isCompleted ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <span className="text-xl flex-shrink-0">{categoryIcon}</span>
            <CardTitle className="text-base line-clamp-2">{goal.title}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isCompleted && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(goal)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onComplete(goal)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Complete
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
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
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={
              goal.status === 'COMPLETED'
                ? 'success'
                : goal.status === 'IN_PROGRESS'
                  ? 'warning'
                  : 'secondary'
            }
            className="text-xs"
          >
            {goal.status.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {goal.priority}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {goal.timeline.replace('_', ' ')}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{localProgress}%</span>
          </div>
          {!isCompleted ? (
            <input
              type="range"
              min="0"
              max="100"
              value={localProgress}
              onChange={handleProgressChange}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
          ) : (
            <Progress value={100} className="h-2" indicatorClassName="bg-green-500" />
          )}
        </div>

        {/* Target Date */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Target</span>
          <span>{formatDate(goal.targetDate)}</span>
        </div>

        {/* Points */}
        {goal.pointsEarned > 0 && (
          <div className="pt-2 border-t">
            <span className="text-sm font-medium text-purple-600">
              ⚡ {goal.pointsEarned} XP earned
            </span>
          </div>
        )}

        {/* Notes Preview */}
        {goal.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2 pt-1">{goal.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
