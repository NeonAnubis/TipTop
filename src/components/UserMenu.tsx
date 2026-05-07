'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

interface User {
  fullName: string;
  email: string;
  role: 'VENDOR' | 'CLIENT';
  avatarUrl?: string | null;
}

export function UserMenu({ user }: { user: User }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function logout() {
    setOpen(false);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'group relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border transition',
          open
            ? 'border-brand-400/60 ring-2 ring-brand-400/30'
            : 'border-white/15 hover:border-brand-400/40',
        )}
        title="Account"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="grid h-full w-full place-items-center bg-brand-500/20 text-sm font-semibold text-brand-200">
            {user.fullName.slice(0, 1).toUpperCase()}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-64 origin-top-right rounded-xl border border-white/12 bg-midnight-700/85 shadow-card backdrop-blur-xl"
        >
          {/* Identity block */}
          <div className="flex items-center gap-3 border-b border-white/10 p-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-brand-500/20 text-sm font-semibold text-brand-200">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                user.fullName.slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink-900">{user.fullName}</div>
              <div className="truncate text-xs text-ink-500">{user.email}</div>
            </div>
            <span className="chip-brand shrink-0 text-[10px] uppercase tracking-wider">
              {user.role === 'VENDOR' ? 'Vendor' : 'Client'}
            </span>
          </div>

          {/* Items */}
          <div className="p-1">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-800 transition hover:bg-white/[0.06] hover:text-ink-950"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
              My Profile
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
