import { useEffect, useState } from 'react';
import { useHabitsStore, useProfileStore } from '@/stores';
import { Habit, CreateHabitData } from '@/services';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  ConfirmDialog,
} from '@/components/ui';
import { HabitForm, HabitTodayCard, HabitLogHistory } from '@/components/habits';
import { toast } from '@/hooks/useToast';
import { Plus, Flame, Repeat } from 'lucide-react';

export function Habits() {
  const {
    habits,
    todayStatus,
    stats,
    isLoading,
    createHabit,
    updateHabit,
    logHabit,
    deleteHabit,
    refreshAll,
  } = useHabitsStore();
  const { fetchProfile } = useProfileStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  const [logHistoryOpen, setLogHistoryOpen] = useState(false);
  const [viewingHabit, setViewingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleFormSubmit = async (data: CreateHabitData) => {
    setIsSubmitting(true);
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, data);
        toast({ title: 'Habit updated', description: 'Your habit has been updated.' });
      } else {
        await createHabit(data);
        toast({
          title: 'Habit created! ✅',
          description: 'Start building your new habit today!',
          variant: 'success',
        });
      }
      setIsFormOpen(false);
      setEditingHabit(null);
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

  const handleToggle = async (habit: Habit, completed: boolean, value?: number) => {
    const today = new Date().toISOString().split('T')[0];
    const { pointsEarned, isNewCompletion } = await logHabit(habit.id, {
      date: today,
      completed,
      value,
    });

    if (isNewCompletion && pointsEarned > 0) {
      await fetchProfile();
      toast({
        title: 'Habit completed! 🎉',
        description: `+${pointsEarned} XP`,
        variant: 'success',
      });
    }
  };

  const handleToggleActive = async (habit: Habit) => {
    try {
      await updateHabit(habit.id, { isActive: !habit.isActive });
      toast({ title: habit.isActive ? 'Habit paused' : 'Habit resumed' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update habit', variant: 'destructive' });
    }
  };

  const handleViewLogs = (habit: Habit) => {
    setViewingHabit(habit);
    setLogHistoryOpen(true);
  };

  const handleDeleteClick = (habit: Habit) => {
    setHabitToDelete(habit);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!habitToDelete) return;
    try {
      await deleteHabit(habitToDelete.id);
      toast({ title: 'Habit deleted' });
      setDeleteConfirmOpen(false);
      setHabitToDelete(null);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const completedToday = todayStatus.filter((s) => s.completed).length;
  const totalActive = todayStatus.length;

  if (isLoading && habits.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh]">
        <div className="text-center">
          <div className="text-4xl animate-pulse">✅</div>
          <p className="mt-2 text-muted-foreground">Loading habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Habits</h1>
          <p className="text-muted-foreground">Build habits, earn XP daily</p>
        </div>
        <Button
          onClick={() => {
            setEditingHabit(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Habit
        </Button>
      </div>

      {/* Today's Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Today's Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {completedToday}/{totalActive}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            {stats && stats.bestStreak > 0 && (
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 flex items-center justify-center gap-1">
                  <Flame className="w-6 h-6" />
                  {stats.bestStreak}
                </div>
                <div className="text-sm text-muted-foreground">Best Streak</div>
              </div>
            )}
            {stats && (
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">⚡ {stats.totalPoints}</div>
                <div className="text-sm text-muted-foreground">Total XP</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Habits List */}
      {todayStatus.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Repeat className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No habits yet</h3>
            <p className="text-muted-foreground text-center mt-1">
              Create your first habit to start tracking!
            </p>
            <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Active Habits</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {todayStatus.map((status) => (
              <HabitTodayCard
                key={status.habit.id}
                status={status}
                onToggle={handleToggle}
                onEdit={(h) => {
                  setEditingHabit(h);
                  setIsFormOpen(true);
                }}
                onDelete={handleDeleteClick}
                onToggleActive={handleToggleActive}
                onViewLogs={handleViewLogs}
              />
            ))}
          </div>
        </div>
      )}

      {/* Streak Leaders */}
      {stats && stats.currentStreaks.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Current Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.currentStreaks.map((s, i) => (
                <Badge key={i} variant="outline" className="text-sm py-1 px-3">
                  {s.name}: {s.streak} 🔥
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <HabitForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        habit={editingHabit}
        isLoading={isSubmitting}
      />

      <HabitLogHistory
        open={logHistoryOpen}
        onOpenChange={setLogHistoryOpen}
        habit={viewingHabit}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Habit"
        description={`Are you sure you want to delete "${habitToDelete?.name}"? All logs will be lost.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
