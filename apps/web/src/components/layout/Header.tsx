import { useProfileStore } from '@/stores';
import { Badge, Avatar, AvatarFallback } from '@/components/ui';
import { Progress } from '@/components/ui';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { profile } = useProfileStore();

  const initials =
    profile?.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'LT';

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-md hover:bg-accent"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <span className="text-xl">🚀</span>
          <span className="font-bold">Life Tracker</span>
        </div>

        {/* Desktop spacer */}
        <div className="hidden lg:block" />

        {/* Right side - XP and Avatar */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* XP Badge with mini progress */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <Badge variant="xp" className="text-xs md:text-sm">
              {profile?.profile.levelIcon} {profile?.profile.levelTitle} • ⚡{' '}
              {profile?.profile.totalXP.toLocaleString() || 0} XP
            </Badge>
            <Progress
              value={profile?.profile.levelProgress || 0}
              className="h-1 w-24"
              indicatorClassName="bg-purple-500"
            />
          </div>

          {/* Mobile XP (simplified) */}
          <Badge variant="xp" className="text-xs sm:hidden">
            ⚡ {profile?.profile.totalXP.toLocaleString() || 0}
          </Badge>

          {/* Avatar */}
          <Avatar className="h-9 w-9 md:h-10 md:w-10">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
