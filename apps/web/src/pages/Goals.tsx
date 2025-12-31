import { useEffect, useState } from 'react';
import { useGoalsStore, useProfileStore } from '@/stores';
import { Goal, CreateGoalData, UpdateGoalData } from '@/services';
import { Card, CardContent, Button, Badge, ConfirmDialog } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { GoalForm, GoalCard } from '@/components/goals';
import { toast } from '@/hooks/useToast';
import { Plus, Target, Filter } from 'lucide-react';

export function Goals() {
  const {
    goals,
    stats,
    isLoading,
    fetchGoals,
    fetchStats,
    createGoal,
    updateGoal,
    updateProgress,
    completeGoal,
    deleteGoal,
    setFilters,
    filters,
  } = useGoalsStore();

  const { fetchProfile } = useProfileStore();

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchGoals();
    fetchStats();
  }, [fetchGoals, fetchStats]);

  // Handle filter changes
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setFilters({
      ...filters,
      status: value === 'all' ? undefined : (value as any),
    });
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    setFilters({
      ...filters,
      category: value === 'all' ? undefined : (value as any),
    });
  };

  // Handle create/edit
  const handleOpenCreate = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateGoalData | UpdateGoalData) => {
    setIsSubmitting(true);
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, data as UpdateGoalData);
        toast({
          title: 'Goal updated',
          description: 'Your goal has been updated successfully.',
        });
      } else {
        await createGoal(data as CreateGoalData);
        toast({
          title: 'Goal created! 🎯',
          description: 'Your new goal has been added. Start making progress!',
          variant: 'success',
        });
      }
      setIsFormOpen(false);
      setEditingGoal(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle complete
  const handleComplete = async (goal: Goal) => {
    try {
      const { pointsAwarded } = await completeGoal(goal.id);
      await fetchProfile(); // Refresh XP in header
      toast({
        title: 'Goal completed! 🎉',
        description: `Congratulations! You earned ${pointsAwarded} XP!`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to complete goal',
        variant: 'destructive',
      });
    }
  };

  // Handle delete - open confirmation
  const handleDeleteClick = (goal: Goal) => {
    setGoalToDelete(goal);
    setDeleteConfirmOpen(true);
  };

  // Handle delete - confirmed
  const handleDeleteConfirm = async () => {
    if (!goalToDelete) return;

    setIsDeleting(true);
    try {
      await deleteGoal(goalToDelete.id);
      toast({
        title: 'Goal deleted',
        description: 'The goal has been removed.',
      });
      setDeleteConfirmOpen(false);
      setGoalToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete goal',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle progress update
  const handleUpdateProgress = async (goal: Goal, progress: number) => {
    try {
      await updateProgress(goal.id, progress);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive',
      });
    }
  };

  if (isLoading && goals.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh]">
        <div className="text-center">
          <div className="text-4xl animate-pulse">🎯</div>
          <p className="mt-2 text-muted-foreground">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Goals</h1>
          <p className="text-muted-foreground">Track and manage your life goals</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="text-sm py-1 px-3">
            Total: {stats.total}
          </Badge>
          <Badge variant="success" className="text-sm py-1 px-3">
            Completed: {stats.completed}
          </Badge>
          <Badge variant="warning" className="text-sm py-1 px-3">
            In Progress: {stats.inProgress}
          </Badge>
          <Badge variant="outline" className="text-sm py-1 px-3">
            ⚡ {stats.totalPoints} XP earned
          </Badge>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="NOT_STARTED">Not Started</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="ON_HOLD">On Hold</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="CAREER">💼 Career</SelectItem>
            <SelectItem value="HEALTH">🏃 Health</SelectItem>
            <SelectItem value="LEARNING">📚 Learning</SelectItem>
            <SelectItem value="RELATIONSHIPS">❤️ Relationships</SelectItem>
            <SelectItem value="FINANCE">💰 Finance</SelectItem>
            <SelectItem value="PERSONAL_GROWTH">🌱 Personal Growth</SelectItem>
            <SelectItem value="OTHER">📌 Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No goals found</h3>
            <p className="text-muted-foreground text-center mt-1">
              {statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try changing your filters or create a new goal.'
                : 'Create your first goal to start tracking your progress!'}
            </p>
            <Button className="mt-4" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteClick}
              onComplete={handleComplete}
              onUpdateProgress={handleUpdateProgress}
            />
          ))}
        </div>
      )}

      {/* Goal Form Modal */}
      <GoalForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        goal={editingGoal}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Goal"
        description={`Are you sure you want to delete "${goalToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
