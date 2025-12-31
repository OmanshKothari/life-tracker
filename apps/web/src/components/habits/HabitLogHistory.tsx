import { useState, useEffect } from 'react';
import { Habit, HabitLog, habitsApi } from '@/services';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui';
import { Check, X, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui';

interface HabitLogHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit | null;
}

export function HabitLogHistory({ open, onOpenChange, habit }: HabitLogHistoryProps) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    if (open && habit) {
      fetchLogs();
    }
  }, [open, habit, year, month]);

  const fetchLogs = async () => {
    if (!habit) return;
    setIsLoading(true);
    try {
      const data = await habitsApi.getLogs(habit.id, year, month);
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const getDaysInMonth = () => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(year, month - 1, 1).getDay();
  };

  const getLogForDay = (day: number): HabitLog | undefined => {
    // Create target date string in YYYY-MM-DD format
    const targetDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return logs.find((log) => {
      // Extract date portion from log.date (could be ISO string or Date)
      const logDateStr = new Date(log.date).toISOString().split('T')[0];
      return logDateStr === targetDateStr;
    });
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth();
  const firstDay = getFirstDayOfMonth();
  const completedDays = logs.filter((l) => l.completed).length;
  const totalPoints = logs.reduce((sum, l) => sum + l.pointsEarned, 0);

  // Get today's date string for comparison
  const todayStr = new Date().toISOString().split('T')[0];
  const [todayYear, todayMonth, todayDay] = todayStr.split('-').map(Number);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{habit?.name}</DialogTitle>
          <DialogDescription>Habit history and streaks</DialogDescription>
        </DialogHeader>

        {/* Stats */}
        <div className="flex justify-around py-3 border-b">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedDays}</div>
            <div className="text-xs text-muted-foreground">Days this month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5" />
              {habit?.currentStreak || 0}
            </div>
            <div className="text-xs text-muted-foreground">Current streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
            <div className="text-xs text-muted-foreground">XP this month</div>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between py-2">
          <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">{monthName}</span>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Day headers */}
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-xs text-muted-foreground py-1">
                {d}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const log = getLogForDay(day);
              const isToday = year === todayYear && month === todayMonth && day === todayDay;

              return (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-full text-sm ${
                    isToday ? 'ring-2 ring-primary ring-offset-1' : ''
                  } ${
                    log?.completed
                      ? 'bg-green-500 text-white'
                      : log
                        ? 'bg-red-100 text-red-600'
                        : 'bg-muted/50'
                  }`}
                >
                  {log?.completed ? (
                    <Check className="w-3 h-3" />
                  ) : log ? (
                    <X className="w-3 h-3" />
                  ) : (
                    <span className="text-xs text-muted-foreground">{day}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex justify-center gap-4 pt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-red-100" />
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-muted/50" />
            <span>No data</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
