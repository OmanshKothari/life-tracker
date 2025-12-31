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
  Textarea,
} from '@/components/ui';
import { BucketItem, CreateBucketItemData } from '@/services';

interface BucketItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateBucketItemData) => Promise<void>;
  item?: BucketItem | null;
  isLoading?: boolean;
}

const CATEGORIES = [
  { value: 'TRAVEL', label: 'Travel', icon: '✈️' },
  { value: 'SKILLS', label: 'Skills', icon: '🎯' },
  { value: 'EXPERIENCES', label: 'Experiences', icon: '🎭' },
  { value: 'MILESTONES', label: 'Milestones', icon: '🏆' },
] as const;

const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy', points: 50, color: 'text-green-600' },
  { value: 'MEDIUM', label: 'Medium', points: 100, color: 'text-yellow-600' },
  { value: 'HARD', label: 'Hard', points: 200, color: 'text-orange-600' },
  { value: 'EPIC', label: 'Epic', points: 500, color: 'text-red-600' },
] as const;

export function BucketItemForm({
  open,
  onOpenChange,
  onSubmit,
  item,
  isLoading,
}: BucketItemFormProps) {
  const isEditing = !!item;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CreateBucketItemData['category']>('EXPERIENCES');
  const [difficulty, setDifficulty] = useState<CreateBucketItemData['difficulty']>('MEDIUM');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (item) {
        setTitle(item.title);
        setCategory(item.category);
        setDifficulty(item.difficulty);
        setEstimatedCost(item.estimatedCost ? String(parseFloat(item.estimatedCost)) : '');
        setNotes(item.notes || '');
      } else {
        setTitle('');
        setCategory('EXPERIENCES');
        setDifficulty('MEDIUM');
        setEstimatedCost('');
        setNotes('');
      }
      setErrors({});
    }
  }, [open, item]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      title: title.trim(),
      category,
      difficulty,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
      notes: notes.trim() || null,
    });
  };

  const selectedDifficulty = DIFFICULTIES.find((d) => d.value === difficulty);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Bucket Item' : 'Add to Bucket List'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your dream.'
              : 'Add something you want to do before you kick the bucket! 🪣'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              What do you want to do? <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Visit the Northern Lights, Learn to surf"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as CreateBucketItemData['category'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as CreateBucketItemData['difficulty'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      <span className={d.color}>{d.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Estimated Cost (₹)</Label>
            <Input
              id="cost"
              type="number"
              min="0"
              placeholder="0"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any details, ideas, or plans..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">XP on completion:</span>
              <span className="font-semibold text-purple-600">
                ⚡ {selectedDifficulty?.points || 100} XP
              </span>
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
              {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add to List'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
