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
import { Goal, CreateGoalData, UpdateGoalData } from '@/services';
import { GoalCategory, Timeline, Priority } from '@life-tracker/shared';

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateGoalData | UpdateGoalData) => Promise<void>;
  goal?: Goal | null;
  isLoading?: boolean;
}

const CATEGORIES: { value: GoalCategory; label: string; icon: string }[] = [
  { value: GoalCategory.CAREER, label: 'Career', icon: '💼' },
  { value: GoalCategory.HEALTH, label: 'Health', icon: '🏃' },
  { value: GoalCategory.LEARNING, label: 'Learning', icon: '📚' },
  { value: GoalCategory.RELATIONSHIPS, label: 'Relationships', icon: '❤️' },
  { value: GoalCategory.FINANCE, label: 'Finance', icon: '💰' },
  { value: GoalCategory.PERSONAL_GROWTH, label: 'Personal Growth', icon: '🌱' },
  { value: GoalCategory.OTHER, label: 'Other', icon: '📌' },
];

const TIMELINES: { value: Timeline; label: string; description: string }[] = [
  { value: Timeline.SHORT_TERM, label: 'Short Term', description: '< 3 months' },
  { value: Timeline.MID_TERM, label: 'Mid Term', description: '3-12 months' },
  { value: Timeline.LONG_TERM, label: 'Long Term', description: '> 1 year' },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: Priority.HIGH, label: 'High', color: 'text-red-600' },
  { value: Priority.MEDIUM, label: 'Medium', color: 'text-yellow-600' },
  { value: Priority.LOW, label: 'Low', color: 'text-green-600' },
];

export function GoalForm({ open, onOpenChange, onSubmit, goal, isLoading }: GoalFormProps) {
  const isEditing = !!goal;

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>(GoalCategory.PERSONAL_GROWTH);
  const [timeline, setTimeline] = useState<Timeline>(Timeline.SHORT_TERM);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes or goal changes
  useEffect(() => {
    if (open) {
      if (goal) {
        setTitle(goal.title);
        setCategory(goal.category as GoalCategory);
        setTimeline(goal.timeline as Timeline);
        setPriority(goal.priority as Priority);
        setStartDate(goal.startDate.split('T')[0]);
        setTargetDate(goal.targetDate.split('T')[0]);
        setNotes(goal.notes || '');
      } else {
        // Default values for new goal
        setTitle('');
        setCategory(GoalCategory.PERSONAL_GROWTH);
        setTimeline(Timeline.SHORT_TERM);
        setPriority(Priority.MEDIUM);
        setStartDate(new Date().toISOString().split('T')[0]);
        setTargetDate('');
        setNotes('');
      }
      setErrors({});
    }
  }, [open, goal]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!targetDate) {
      newErrors.targetDate = 'Target date is required';
    } else if (new Date(targetDate) <= new Date(startDate)) {
      newErrors.targetDate = 'Target date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data: CreateGoalData = {
      title: title.trim(),
      category,
      timeline,
      priority,
      startDate,
      targetDate,
      notes: notes.trim() || null,
    };

    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your goal details below.'
              : 'Set a new goal to track your progress and earn XP!'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Learn TypeScript, Run a marathon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as GoalCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timeline & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Timeline */}
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline</Label>
              <Select value={timeline} onValueChange={(v) => setTimeline(v as Timeline)}>
                <SelectTrigger id="timeline">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMELINES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex flex-col">
                        <span>{t.label}</span>
                        <span className="text-xs text-muted-foreground">{t.description}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className={p.color}>{p.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={errors.startDate ? 'border-destructive' : ''}
              />
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <Label htmlFor="targetDate">
                Target Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={startDate}
                className={errors.targetDate ? 'border-destructive' : ''}
              />
              {errors.targetDate && <p className="text-sm text-destructive">{errors.targetDate}</p>}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details or milestones..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Points Preview */}
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Potential XP on completion:</span>
              <span className="font-semibold text-purple-600">
                ⚡ {calculatePoints(timeline, priority)} XP
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
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {isEditing ? 'Saving...' : 'Creating...'}
                </span>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Create Goal'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to calculate points
function calculatePoints(timeline: Timeline, priority: Priority): number {
  const basePoints: Record<Timeline, number> = {
    SHORT_TERM: 100,
    MID_TERM: 250,
    LONG_TERM: 500,
  };

  const multipliers: Record<Priority, number> = {
    HIGH: 1.5,
    MEDIUM: 1.0,
    LOW: 0.75,
  };

  return Math.round(basePoints[timeline] * multipliers[priority]);
}
