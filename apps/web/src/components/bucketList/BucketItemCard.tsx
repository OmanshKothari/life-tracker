import { BucketItem } from '@/services';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MoreHorizontal, Pencil, Trash2, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BucketItemCardProps {
  item: BucketItem;
  onEdit: (item: BucketItem) => void;
  onDelete: (item: BucketItem) => void;
  onComplete: (item: BucketItem) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  TRAVEL: '✈️',
  SKILLS: '🎯',
  EXPERIENCES: '🎭',
  MILESTONES: '🏆',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-orange-100 text-orange-800',
  EPIC: 'bg-red-100 text-red-800',
};

export function BucketItemCard({ item, onEdit, onDelete, onComplete }: BucketItemCardProps) {
  const categoryIcon = CATEGORY_ICONS[item.category] || '📌';
  const isCompleted = item.isCompleted;

  return (
    <Card
      className={`transition-all hover:shadow-md ${isCompleted ? 'opacity-75 bg-muted/30' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-2xl flex-shrink-0">{categoryIcon}</span>
            <div className="min-w-0">
              <h3
                className={`font-semibold line-clamp-2 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
              >
                {item.title}
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant={isCompleted ? 'success' : 'secondary'} className="text-xs">
                  {isCompleted ? '✓ Done' : 'Pending'}
                </Badge>
                <Badge className={`text-xs ${DIFFICULTY_COLORS[item.difficulty]}`}>
                  {item.difficulty}
                </Badge>
              </div>
            </div>
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
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onComplete(item)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Complete
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(item)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {parseFloat(item.estimatedCost) > 0 && (
          <div className="mt-3 text-sm text-muted-foreground">
            💰 Est. cost: {formatCurrency(parseFloat(item.estimatedCost))}
          </div>
        )}

        {item.notes && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{item.notes}</p>
        )}

        {isCompleted && item.completedAt && (
          <div className="mt-3 pt-3 border-t flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Completed {formatDate(item.completedAt)}
            </span>
            <span className="text-sm font-medium text-purple-600">⚡ {item.pointsEarned} XP</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
