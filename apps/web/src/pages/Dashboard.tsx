import { useEffect, useState } from 'react';
import {
  useProfileStore,
  useGoalsStore,
  useHabitsStore,
  useFinanceStore,
  useBucketListStore,
} from '@/stores';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Progress,
  Badge,
} from '@/components/ui';
import { GoalForm } from '@/components/goals';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  ArrowRight,
  Target,
  Flame,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle2,
  Calendar,
  Trophy,
  Sparkles,
  ListChecks,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CreateGoalData } from '@/services';

export function Dashboard() {
  const { profile, isLoading: profileLoading, fetchProfile } = useProfileStore();
  const {
    stats: goalsStats,
    isLoading: goalsLoading,
    fetchStats: fetchGoalsStats,
    createGoal,
  } = useGoalsStore();
  const {
    todayStatus,
    stats: habitsStats,
    fetchTodayStatus,
    fetchStats: fetchHabitsStats,
  } = useHabitsStore();
  const {
    dashboard: financeDashboard,
    savingsGoals,
    fetchDashboard,
    fetchSavingsGoals,
  } = useFinanceStore();
  const { stats: bucketStats, fetchStats: fetchBucketStats } = useBucketListStore();

  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchGoalsStats();
    fetchTodayStatus();
    fetchHabitsStats();
    fetchDashboard();
    fetchSavingsGoals();
    fetchBucketStats();
  }, []);

  const isLoading = profileLoading || goalsLoading;

  // Calculate today's habits progress
  const completedHabitsToday = todayStatus.filter((h) => h.completed).length;
  const totalHabitsToday = todayStatus.length;
  const habitsProgress =
    totalHabitsToday > 0 ? Math.round((completedHabitsToday / totalHabitsToday) * 100) : 0;

  // Get best current streak
  const bestStreak = habitsStats?.currentStreaks?.[0];

  // Active savings goals
  const activeSavingsGoals = savingsGoals
    .filter((g) => parseFloat(g.currentAmount) < parseFloat(g.targetAmount))
    .slice(0, 3);

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh]">
        <div className="text-center">
          <div className="text-4xl animate-pulse">🚀</div>
          <p className="mt-2 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Welcome back, {profile?.name}! 👋</h1>
          <p className="text-muted-foreground">Here's your life progress overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Badge>
        </div>
      </div>

      {/* Level Card - Featured */}
      <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{profile?.profile.levelIcon}</div>
              <div>
                <div className="text-sm opacity-90">Level {profile?.profile.currentLevel}</div>
                <div className="text-2xl font-bold">{profile?.profile.levelTitle}</div>
                <div className="text-sm opacity-90">
                  {profile?.profile.totalXP.toLocaleString()} XP Total
                </div>
              </div>
            </div>
            <div className="flex-1 max-w-xs">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress to next level</span>
                <span>{profile?.profile.levelProgress}%</span>
              </div>
              <Progress
                value={profile?.profile.levelProgress || 0}
                className="h-3 bg-white/20"
                indicatorClassName="bg-white"
              />
              <div className="text-xs mt-1 opacity-90">
                {profile?.profile.xpToNextLevel.toLocaleString()} XP to go
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setIsGoalFormOpen(true)}>
              <Target className="w-4 h-4 mr-2" />
              New Goal
            </Button>
            <Button variant="outline" asChild>
              <Link to="/habits">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Log Habits
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/finance">
                <Wallet className="w-4 h-4 mr-2" />
                Add Expense
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/savings">
                <PiggyBank className="w-4 h-4 mr-2" />
                Add Savings
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/bucket-list">
                <ListChecks className="w-4 h-4 mr-2" />
                Bucket List
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Goals */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">Goals</p>
                <p className="text-xl font-bold">{goalsStats?.total || 0}</p>
              </div>
            </div>
            <div className="mt-2 flex gap-1 flex-wrap">
              {(goalsStats?.completed || 0) > 0 && (
                <Badge variant="success" className="text-xs">
                  {goalsStats?.completed} done
                </Badge>
              )}
              {(goalsStats?.inProgress || 0) > 0 && (
                <Badge variant="warning" className="text-xs">
                  {goalsStats?.inProgress} active
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Habits */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">Today's Habits</p>
                <p className="text-xl font-bold">
                  {completedHabitsToday}/{totalHabitsToday}
                </p>
              </div>
            </div>
            {totalHabitsToday > 0 && (
              <Progress
                value={habitsProgress}
                className="mt-2 h-2"
                indicatorClassName="bg-green-500"
              />
            )}
          </CardContent>
        </Card>

        {/* Bucket List */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <ListChecks className="w-5 h-5 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">Bucket List</p>
                <p className="text-xl font-bold">{bucketStats?.completed || 0}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {bucketStats?.total || 0} total items
            </p>
          </CardContent>
        </Card>

        {/* Savings */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-full">
                <PiggyBank className="w-5 h-5 text-pink-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">Total Saved</p>
                <p className="text-lg font-bold truncate">
                  {formatCurrency(profile?.profile.totalSaved || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Habits Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Today's Habits
                </CardTitle>
                <CardDescription>
                  {completedHabitsToday === totalHabitsToday && totalHabitsToday > 0
                    ? '🎉 All done for today!'
                    : `${totalHabitsToday - completedHabitsToday} remaining`}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/habits">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todayStatus.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-3">No habits tracked yet</p>
                <Button size="sm" asChild>
                  <Link to="/habits">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Habit
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayStatus.slice(0, 5).map(({ habit, completed }) => (
                  <div
                    key={habit.id}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      completed ? 'bg-green-50' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${completed ? 'bg-green-500' : 'bg-gray-300'}`}
                      />
                      <span className={completed ? 'line-through text-muted-foreground' : ''}>
                        {habit.name}
                      </span>
                    </div>
                    {habit.currentStreak > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Flame className="w-3 h-3 mr-1 text-orange-500" />
                        {habit.currentStreak}
                      </Badge>
                    )}
                  </div>
                ))}
                {todayStatus.length > 5 && (
                  <Button variant="link" size="sm" className="w-full" asChild>
                    <Link to="/habits">View all {todayStatus.length} habits</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Finance Overview */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  This Month
                </CardTitle>
                <CardDescription>Financial overview</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/finance">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {financeDashboard ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(financeDashboard.totalIncome)}
                    </div>
                    <div className="text-xs text-muted-foreground">Income</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-red-600">
                      {formatCurrency(financeDashboard.totalExpenses)}
                    </div>
                    <div className="text-xs text-muted-foreground">Expenses</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Net this month</span>
                  <span
                    className={`font-bold ${financeDashboard.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(financeDashboard.netIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Savings rate</span>
                  <Badge variant={financeDashboard.savingsRate >= 20 ? 'success' : 'warning'}>
                    {financeDashboard.savingsRate}%
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-3">Start tracking your finances</p>
                <Button size="sm" asChild>
                  <Link to="/finance">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals & Streaks Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Savings Goals */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PiggyBank className="w-5 h-5" />
                  Savings Goals
                </CardTitle>
                <CardDescription>{savingsGoals.length} total goals</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/savings">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeSavingsGoals.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-3">No active savings goals</p>
                <Button size="sm" asChild>
                  <Link to="/savings">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Goal
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSavingsGoals.map((goal) => {
                  const current = parseFloat(goal.currentAmount);
                  const target = parseFloat(goal.targetAmount);
                  const progress = Math.round((current / target) * 100);
                  return (
                    <div key={goal.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium truncate">{goal.name}</span>
                        <span className="text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(current)}</span>
                        <span>{formatCurrency(target)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Streaks & Achievements */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Achievements
                </CardTitle>
                <CardDescription>Your progress highlights</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Best Streak */}
              {bestStreak && (
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="font-medium">{bestStreak.streak} day streak!</div>
                    <div className="text-sm text-muted-foreground">{bestStreak.name}</div>
                  </div>
                </div>
              )}

              {/* Stats Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {profile?.profile.goalsCompleted || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Goals Completed</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {habitsStats?.totalCompletions || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Habits Logged</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {profile?.profile.bucketCompleted || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Bucket Items</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {goalsStats?.totalPoints || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Total XP</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goal Form Modal */}
      <GoalForm
        open={isGoalFormOpen}
        onOpenChange={setIsGoalFormOpen}
        onSubmit={async (data) => {
          if (!data) return;
          await createGoal(data as CreateGoalData);
          setIsGoalFormOpen(false);
        }}
      />
    </div>
  );
}
