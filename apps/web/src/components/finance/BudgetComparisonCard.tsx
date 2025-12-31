import { BudgetComparison, Budget } from '@/services';
import { Card, CardContent, Button, Progress } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Pencil, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BudgetComparisonCardProps {
  comparison: BudgetComparison;
  budget?: Budget;
  onEdit?: (budget: Budget) => void;
  onDelete?: (budget: Budget) => void;
}

/**
 * Get status color and icon based on budget usage percentage
 */
function getBudgetStatus(percentUsed: number) {
  if (percentUsed >= 100) {
    return {
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      progressColor: 'bg-red-500',
      icon: AlertTriangle,
      label: 'Over Budget',
    };
  } else if (percentUsed >= 80) {
    return {
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      progressColor: 'bg-amber-500',
      icon: AlertTriangle,
      label: 'Near Limit',
    };
  } else {
    return {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      progressColor: 'bg-green-500',
      icon: CheckCircle2,
      label: 'On Track',
    };
  }
}

export function BudgetComparisonCard({
  comparison,
  budget,
  onEdit,
  onDelete,
}: BudgetComparisonCardProps) {
  const status = getBudgetStatus(comparison.percentUsed);
  const StatusIcon = status.icon;

  return (
    <Card className={`transition-all hover:shadow-md ${status.bgColor}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{comparison.categoryIcon}</span>
            <div>
              <h3 className="font-semibold">{comparison.categoryName}</h3>
              <div className="flex items-center gap-1 text-xs">
                <StatusIcon className={`w-3 h-3 ${status.color}`} />
                <span className={status.color}>{status.label}</span>
              </div>
            </div>
          </div>

          {budget && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit?.(budget)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onDelete?.(budget)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress
            value={Math.min(comparison.percentUsed, 100)}
            className="h-3"
            indicatorClassName={status.progressColor}
          />
          <div className="flex justify-between text-sm">
            <span className={`font-medium ${status.color}`}>
              {formatCurrency(comparison.spent)} spent
            </span>
            <span className="text-muted-foreground">
              {formatCurrency(comparison.budgeted)} budget
            </span>
          </div>
        </div>

        {/* Remaining */}
        <div className="mt-3 pt-3 border-t flex justify-between text-sm">
          <span className="text-muted-foreground">Remaining</span>
          <span
            className={`font-semibold ${comparison.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {comparison.remaining >= 0
              ? formatCurrency(comparison.remaining)
              : `-${formatCurrency(Math.abs(comparison.remaining))}`}
          </span>
        </div>

        {/* Percentage */}
        <div className="mt-1 text-center">
          <span className={`text-2xl font-bold ${status.color}`}>{comparison.percentUsed}%</span>
          <span className="text-xs text-muted-foreground ml-1">used</span>
        </div>
      </CardContent>
    </Card>
  );
}
