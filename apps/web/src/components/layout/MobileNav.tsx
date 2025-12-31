import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Target, Wallet, Trophy, Menu } from 'lucide-react';

interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const mobileNavItems: MobileNavItem[] = [
  { label: 'Home', href: '/', icon: <LayoutDashboard size={20} /> },
  { label: 'Goals', href: '/goals', icon: <Target size={20} /> },
  { label: 'Finance', href: '/finance', icon: <Wallet size={20} /> },
  { label: 'Badges', href: '/achievements', icon: <Trophy size={20} /> },
  { label: 'More', href: '/more', icon: <Menu size={20} /> },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t lg:hidden">
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors min-w-[64px]',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
