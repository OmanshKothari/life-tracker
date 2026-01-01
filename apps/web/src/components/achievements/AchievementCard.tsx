import { Card, CardContent, Badge } from '@/components/ui';
import { Lock, Check } from 'lucide-react';
import { Achievement } from '@/services';

interface AchievementCardProps {
  achievement: Achievement;
}

const categoryColors: Record<string, string> = {
  GOALS: 'bg-blue-100 text-blue-700',
  HABITS: 'bg-green-100 text-green-700',
  FINANCE: 'bg-emerald-100 text-emerald-700',
  BUCKET_LIST: 'bg-amber-100 text-amber-700',
  OVERALL: 'bg-purple-100 text-purple-700',
};

export function AchievementCard({ achievement }: AchievementCardProps) {
  const isUnlocked = achievement.unlockedAt !== null;
  const unlockedDate = isUnlocked
    ? new Date(achievement.unlockedAt!).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Card
      className={`relative transition-all ${
        isUnlocked
          ? 'bg-gradient-to-br from-white to-amber-50 border-amber-200 shadow-sm hover:shadow-md'
          : 'bg-muted/30 opacity-70 hover:opacity-90'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`text-3xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
            {achievement.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold ${isUnlocked ? '' : 'text-muted-foreground'}`}>
                {achievement.name}
              </h3>
              {isUnlocked && <Check className="w-4 h-4 text-green-500" />}
            </div>
            <p
              className={`text-sm mt-1 ${isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}
            >
              {achievement.description}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge
                variant="secondary"
                className={`text-xs ${categoryColors[achievement.category] || ''}`}
              >
                {achievement.category.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                +{achievement.bonusPoints} XP
              </Badge>
            </div>
            {isUnlocked && unlockedDate && (
              <p className="text-xs text-muted-foreground mt-2">Unlocked on {unlockedDate}</p>
            )}
          </div>
          {!isUnlocked && <Lock className="w-5 h-5 text-muted-foreground/50" />}
        </div>
      </CardContent>
    </Card>
  );
}
