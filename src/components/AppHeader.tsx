'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './ui/Logo';
import { UserMenu } from './UserMenu';
import { cn } from '@/lib/cn';

interface NavItem {
  href: string;
  label: string;
}

export function AppHeader({
  user,
  nav,
}: {
  user: {
    fullName: string;
    email: string;
    role: 'VENDOR' | 'CLIENT';
    avatarUrl?: string | null;
  };
  nav: NavItem[];
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-midnight-800/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                    active
                      ? 'border border-brand-400/30 bg-brand-500/15 text-brand-200 shadow-[0_0_12px_-2px_rgba(106,142,255,0.4)]'
                      : 'text-ink-600 hover:bg-white/[0.06] hover:text-ink-900',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <UserMenu user={user} />
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto px-6 pb-2 md:hidden">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition',
                active
                  ? 'border border-brand-400/30 bg-brand-500/15 text-brand-200'
                  : 'text-ink-600 hover:bg-white/[0.06]',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
