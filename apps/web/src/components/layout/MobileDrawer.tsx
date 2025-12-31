import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useProfileStore } from '@/stores';
import { Avatar, AvatarFallback, Progress } from '@/components/ui';
import {
  LayoutDashboard,
  Target,
  ListTodo,
  Repeat,
  Wallet,
  PiggyBank,
  Trophy,
  Settings,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={20} /> },
  { label: 'Goals', href: '/goals', icon: <Target size={20} /> },
  { label: 'Bucket List', href: '/bucket-list', icon: <ListTodo size={20} /> },
  { label: 'Habits', href: '/habits', icon: <Repeat size={20} /> },
  { label: 'Finance', href: '/finance', icon: <Wallet size={20} /> },
  { label: 'Savings', href: '/savings', icon: <PiggyBank size={20} /> },
  { label: 'Achievements', href: '/achievements', icon: <Trophy size={20} /> },
  { label: 'Settings', href: '/settings', icon: <Settings size={20} /> },
];

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { profile } = useProfileStore();

  const initials =
    profile?.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'LT';

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-background shadow-xl lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span className="font-bold text-lg">Life Tracker</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-accent"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="px-4 py-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{profile?.name}</div>
              <div className="text-sm text-muted-foreground">
                {profile?.profile.levelIcon} {profile?.profile.levelTitle}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Level {profile?.profile.currentLevel}</span>
              <span className="font-medium">⚡ {profile?.profile.totalXP.toLocaleString()} XP</span>
            </div>
            <Progress
              value={profile?.profile.levelProgress || 0}
              className="h-2"
              indicatorClassName="bg-purple-500"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
