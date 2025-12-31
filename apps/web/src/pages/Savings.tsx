import { useEffect, useState } from 'react';
import { useFinanceStore, useProfileStore } from '@/stores';
import { SavingsGoal, CreateSavingsGoalData } from '@/services';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Progress,
  ConfirmDialog,
} from '@/components/ui';
import { SavingsGoalForm, SavingsGoalCard, AddToSavingsDialog } from '@/components/finance';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import { Plus, PiggyBank, Target, TrendingUp, Trophy } from 'lucide-react';

export function Savings() {
  const {
    savingsGoals,
    isLoading,
    fetchSavingsGoals,
    fetchDashboard,
    createSavingsGoal,
    updateSavingsGoal,
    addToSavings,
    deleteSavingsGoal,
  } = useFinanceStore();
  const { fetchProfile } = useProfileStore();

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [addSavingsOpen, setAddSavingsOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSavingsGoals();
    fetchDashboard();
  }, []);

  const handleSubmit = async (data: CreateSavingsGoalData) => {
    setIsSubmitting(true);
    try {
      if (editingGoal) {
        await updateSavingsGoal(editingGoal.id, data);
        toast({ title: 'Savings goal updated' });
      } else {
        await createSavingsGoal(data);
        toast({ title: 'Savings goal created!', variant: 'success' });
      }
      await fetchProfile();
      setFormOpen(false);
      setEditingGoal(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMoney = async (amount: number) => {
    if (!selectedGoal) return;
    setIsSubmitting(true);
    try {
      await addToSavings(selectedGoal.id, amount);
      await fetchProfile();
      toast({
        title: 'Money added!',
        description: `+${formatCurrency(amount)} to ${selectedGoal.name}`,
        variant: 'success',
      });
      setAddSavingsOpen(false);
      setSelectedGoal(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to add money', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!goalToDelete) return;
    try {
      await deleteSavingsGoal(goalToDelete.id);
      await fetchProfile();
      toast({ title: 'Goal deleted' });
      setDeleteOpen(false);
      setGoalToDelete(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  // Calculate stats
  const totalSaved = savingsGoals.reduce((sum, g) => sum + parseFloat(g.currentAmount), 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + parseFloat(g.targetAmount), 0);
  const completedGoals = savingsGoals.filter(
    (g) => parseFloat(g.currentAmount) >= parseFloat(g.targetAmount)
  ).length;
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const activeGoals = savingsGoals.filter(
    (g) => parseFloat(g.currentAmount) < parseFloat(g.targetAmount)
  );

  if (isLoading && savingsGoals.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh]">
        <div className="text-center">
          <div className="text-4xl animate-pulse">🐷</div>
          <p className="mt-2 text-muted-foreground">Loading savings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl flex items-center gap-2">
            <PiggyBank className="w-8 h-8 text-pink-500" />
            Savings
          </h1>
          <p className="text-muted-foreground">Track your savings goals and build wealth</p>
        </div>
        <Button
          onClick={() => {
            setEditingGoal(null);
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-full">
                <PiggyBank className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Saved</p>
                <p className="text-xl font-bold text-pink-600">{formatCurrency(totalSaved)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Target</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(totalTarget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-xl font-bold text-green-600">{overallProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-bold text-amber-600">
                  {completedGoals}/{savingsGoals.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      {savingsGoals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{formatCurrency(totalSaved)} saved</span>
                <span>{formatCurrency(totalTarget - totalSaved)} to go</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Goals ({activeGoals.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onEdit={(g) => {
                  setEditingGoal(g);
                  setFormOpen(true);
                }}
                onDelete={(g) => {
                  setGoalToDelete(g);
                  setDeleteOpen(true);
                }}
                onAddMoney={(g) => {
                  setSelectedGoal(g);
                  setAddSavingsOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Completed ({completedGoals})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savingsGoals
              .filter((g) => parseFloat(g.currentAmount) >= parseFloat(g.targetAmount))
              .map((goal) => (
                <SavingsGoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={(g) => {
                    setEditingGoal(g);
                    setFormOpen(true);
                  }}
                  onDelete={(g) => {
                    setGoalToDelete(g);
                    setDeleteOpen(true);
                  }}
                  onAddMoney={(g) => {
                    setSelectedGoal(g);
                    setAddSavingsOpen(true);
                  }}
                />
              ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {savingsGoals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">🐷</div>
            <h3 className="text-xl font-semibold mb-2">Start Saving Today!</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create your first savings goal and watch your money grow. Whether it's an emergency
              fund, vacation, or new gadget - we'll help you get there!
            </p>
            <Button size="lg" onClick={() => setFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Forms & Dialogs */}
      <SavingsGoalForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        goal={editingGoal}
        isLoading={isSubmitting}
      />

      <AddToSavingsDialog
        open={addSavingsOpen}
        onOpenChange={setAddSavingsOpen}
        goal={selectedGoal}
        onConfirm={handleAddMoney}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Savings Goal"
        description={`Are you sure you want to delete "${goalToDelete?.name}"? This cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
