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
  Textarea,
} from '@/components/ui';
import { BucketItem } from '@/services';
import { formatCurrency } from '@/lib/utils';

interface BucketCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BucketItem | null;
  onConfirm: (notes: string, actualCost?: number) => Promise<void>;
  isLoading?: boolean;
}

export function BucketCompleteDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
  isLoading,
}: BucketCompleteDialogProps) {
  const [notes, setNotes] = useState('');
  const [actualCost, setActualCost] = useState('');

  const hasEstimatedCost = item && parseFloat(item.estimatedCost) > 0;

  const handleConfirm = async () => {
    await onConfirm(notes, actualCost ? parseFloat(actualCost) : undefined);
    setNotes('');
    setActualCost('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>🎉 Mark as Complete!</DialogTitle>
          <DialogDescription>Congratulations on completing "{item?.title}"!</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Review / Memory */}
          <div className="space-y-2">
            <Label htmlFor="notes">How was it? (Your review/memory)</Label>
            <Textarea
              id="notes"
              placeholder="Share your experience, what you learned, or a special memory..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actual Cost (if estimated cost was set) */}
          {hasEstimatedCost && (
            <div className="space-y-2">
              <Label htmlFor="actualCost">
                Actual Amount Spent (Estimated:{' '}
                {formatCurrency(parseFloat(item?.estimatedCost || '0'))})
              </Label>
              <Input
                id="actualCost"
                type="number"
                min="0"
                placeholder="Enter actual amount"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
              />
            </div>
          )}

          {/* XP Preview */}
          <div className="rounded-lg bg-green-50 p-3 border border-green-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">XP you'll earn:</span>
              <span className="font-bold text-green-700">
                ⚡ {item?.pointsEarned || getDifficultyPoints(item?.difficulty)} XP
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading} variant="success">
            {isLoading ? 'Completing...' : 'Complete & Earn XP!'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getDifficultyPoints(difficulty?: string): number {
  const points: Record<string, number> = {
    EASY: 50,
    MEDIUM: 100,
    HARD: 200,
    EPIC: 500,
  };
  return points[difficulty || 'MEDIUM'] || 100;
}
