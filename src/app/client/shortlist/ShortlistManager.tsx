'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';

export interface ShortlistEntryView {
  id: string;
  vendorId: string;
  companyName: string;
  logoUrl: string | null;
  gmpExperience: boolean;
  vqiScore: number;
  scoreCapability: number;
  scoreCapacity: number;
  scoreCompliance: number;
  scoreOutput: number;
  location: string | null;
  capabilities: string[];
}

const MAX_COMPARE = 3;

export function ShortlistManager({ entries: initial }: { entries: ShortlistEntryView[] }) {
  const router = useRouter();
  const toast = useToast();
  const [entries, setEntries] = useState(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState<string | null>(null);

  const selectedList = useMemo(
    () => entries.filter((e) => selected.has(e.vendorId)),
    [entries, selected],
  );

  function toggle(vendorId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(vendorId)) {
        next.delete(vendorId);
      } else {
        if (next.size >= MAX_COMPARE) {
          toast(`Compare up to ${MAX_COMPARE} vendors at a time`, 'error');
          return prev;
        }
        next.add(vendorId);
      }
      return next;
    });
  }

  function selectTop() {
    const top = [...entries]
      .sort((a, b) => b.vqiScore - a.vqiScore)
      .slice(0, MAX_COMPARE)
      .map((e) => e.vendorId);
    setSelected(new Set(top));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function remove(vendorId: string) {
    setRemoving(vendorId);
    try {
      const res = await fetch('/api/client/shortlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      });
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.vendorId !== vendorId));
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(vendorId);
          return next;
        });
        toast('Removed from shortlist', 'success');
        router.refresh();
      } else {
        toast('Could not remove', 'error');
      }
    } finally {
      setRemoving(null);
    }
  }

  const compareUrl = selectedList.length > 0
    ? `/client/compare?ids=${selectedList.map((e) => e.vendorId).join(',')}`
    : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Shortlist</h1>
          <p className="text-sm text-ink-500">
            {entries.length} saved vendor{entries.length === 1 ? '' : 's'} ·{' '}
            {selected.size === 0
              ? 'Tap a vendor to select for comparison'
              : `${selected.size}/${MAX_COMPARE} selected`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={selectTop} className="btn-ghost text-xs" disabled={entries.length < 2}>
            Select top {Math.min(entries.length, MAX_COMPARE)}
          </button>
          {selected.size > 0 && (
            <button onClick={clearSelection} className="btn-ghost text-xs">
              Clear
            </button>
          )}
          {compareUrl ? (
            <Link href={compareUrl} className="btn-primary">
              Compare {selected.size}
            </Link>
          ) : (
            <button className="btn-primary" disabled>
              Compare
            </button>
          )}
        </div>
      </header>

      <ul className="space-y-3">
        {entries.map((e) => {
          const isSelected = selected.has(e.vendorId);
          return (
            <li
              key={e.id}
              className={cn(
                'card flex flex-col gap-3 p-5 transition sm:flex-row sm:items-center sm:justify-between',
                isSelected && 'border-brand-400 ring-2 ring-brand-100',
              )}
            >
              <div className="flex flex-1 items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggle(e.vendorId)}
                  aria-pressed={isSelected}
                  className={cn(
                    'grid h-6 w-6 shrink-0 place-items-center rounded-md border transition',
                    isSelected
                      ? 'border-brand-400 bg-brand-500 text-white shadow-[0_0_10px_rgba(106,142,255,0.5)]'
                      : 'border-white/25 bg-white/[0.05] text-transparent backdrop-blur hover:border-brand-400/60',
                  )}
                  aria-label={isSelected ? 'Deselect vendor' : 'Select vendor for comparison'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l4 4L19 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {e.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.logoUrl}
                    alt=""
                    className="h-10 w-10 rounded-lg border border-white/15 bg-white/[0.05] object-contain p-0.5 backdrop-blur"
                  />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-lg border border-brand-400/30 bg-brand-500/15 text-sm font-semibold text-brand-200 backdrop-blur">
                    {e.companyName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <Link
                    href={`/client/vendors/${e.vendorId}`}
                    className="block truncate text-base font-semibold text-ink-900 hover:text-brand-300"
                  >
                    {e.companyName}
                  </Link>
                  <div className="truncate text-xs text-ink-500">
                    {e.location ?? 'Location not specified'}
                    {e.gmpExperience && <span className="ml-2 text-emerald-300">· GMP</span>}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {e.capabilities.slice(0, 4).map((c) => (
                      <span key={c} className="chip-brand">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ScoreBadge score={e.vqiScore} size="md" showLabel />
                <button
                  onClick={() => remove(e.vendorId)}
                  disabled={removing === e.vendorId}
                  className="btn-ghost px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  title="Remove from shortlist"
                >
                  {removing === e.vendorId ? '…' : 'Remove'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {selected.size > 0 && (
        <div className="sticky bottom-4 z-20 mx-auto flex max-w-2xl items-center justify-between gap-3 rounded-2xl border border-brand-400/30 bg-midnight-700/80 px-4 py-3 shadow-card backdrop-blur-xl">
          <div className="flex flex-1 items-center gap-2 overflow-x-auto">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-500">
              Selected
            </span>
            {selectedList.map((e) => (
              <span key={e.vendorId} className="chip-brand whitespace-nowrap">
                {e.companyName}
              </span>
            ))}
          </div>
          {compareUrl && (
            <Link href={compareUrl} className="btn-primary whitespace-nowrap">
              Compare →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
