import { useEffect, useState } from 'react';
import { useAchievementsStore } from '@/stores';
import { Card, CardContent, Badge, Progress } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { AchievementCard } from '@/components/achievements';
import { Trophy, Filter } from 'lucide-react';

export function Achievements() {
  const { achievements, stats, isLoading, fetchAchievements, fetchStats } = useAchievementsStore();
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchAchievements();
    fetchStats();
  }, [fetchAchievements, fetchStats]);

  const filteredAchievements = achievements.filter((a) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'unlocked') return a.unlockedAt !== null;
    if (categoryFilter === 'locked') return a.unlockedAt === null;
    return a.category === categoryFilter;
  });

  const unlockedCount = achievements.filter((a) => a.unlockedAt !== null).length;
  const progressPercent =
    achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0;

  if (isLoading && achievements.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh]">
        <div className="text-center">
          <div className="text-4xl animate-pulse">🏆</div>
          <p className="mt-2 text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Achievements</h1>
          <p className="text-muted-foreground">Track your milestones and earn bonus XP</p>
        </div>
      </div>

      {/* Stats Overview */}
      <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🏆</div>
              <div>
                <div className="text-sm opacity-90">Total Unlocked</div>
                <div className="text-2xl font-bold">
                  {unlockedCount} / {achievements.length}
                </div>
                <div className="text-sm opacity-90">{stats?.totalPoints || 0} Bonus XP Earned</div>
              </div>
            </div>
            <div className="flex-1 max-w-xs">
              <div className="flex justify-between text-sm mb-1">
                <span>Completion</span>
                <span>{progressPercent}%</span>
              </div>
              <Progress
                value={progressPercent}
                className="h-3 bg-white/20"
                indicatorClassName="bg-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary" className="text-sm py-1 px-3">
          Total: {achievements.length}
        </Badge>
        <Badge variant="success" className="text-sm py-1 px-3">
          Unlocked: {unlockedCount}
        </Badge>
        <Badge variant="outline" className="text-sm py-1 px-3">
          Locked: {achievements.length - unlockedCount}
        </Badge>
        <Badge variant="outline" className="text-sm py-1 px-3">
          ⚡ {stats?.totalPoints || 0} XP
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="unlocked">✅ Unlocked</SelectItem>
            <SelectItem value="locked">🔒 Locked</SelectItem>
            <SelectItem value="GOALS">🎯 Goals</SelectItem>
            <SelectItem value="HABITS">🔁 Habits</SelectItem>
            <SelectItem value="FINANCE">💰 Finance</SelectItem>
            <SelectItem value="BUCKET_LIST">🪣 Bucket List</SelectItem>
            <SelectItem value="OVERALL">🌟 Overall</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Achievements Grid */}
      {filteredAchievements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No achievements found</h3>
            <p className="text-muted-foreground text-center mt-1">Try changing your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      )}
    </div>
  );
}
