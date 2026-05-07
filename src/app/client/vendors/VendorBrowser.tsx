'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { useToast } from '@/components/ui/Toast';
import {
  CAPABILITY_CATEGORIES,
  CAPACITY_LEVELS,
  DISCIPLINE_OPTIONS,
  REGION_OPTIONS,
  SECTOR_OPTIONS,
} from '@/lib/constants';
import { cn } from '@/lib/cn';
import type { VendorListItem } from '@/lib/types';

type CapabilityCat = (typeof CAPABILITY_CATEGORIES)[number]['value'];

interface Filters {
  q: string;
  capabilities: CapabilityCat[];
  disciplines: string[];
  sectors: string[];
  regions: string[];
  gmpOnly: boolean;
  availability: 'ANY' | 'LOW' | 'MEDIUM' | 'HIGH';
  minScore: number;
  maxScore: number;
}

const DEFAULT: Filters = {
  q: '',
  capabilities: [],
  disciplines: [],
  sectors: [],
  regions: [],
  gmpOnly: false,
  availability: 'ANY',
  minScore: 0,
  maxScore: 100,
};

export function VendorBrowser({
  initialVendors,
  initialShortlistIds,
}: {
  initialVendors: VendorListItem[];
  initialShortlistIds: string[];
}) {
  const toast = useToast();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => {
    const cap = searchParams.get('cap');
    const initialCap = cap && CAPABILITY_CATEGORIES.some((c) => c.value === cap)
      ? [cap as CapabilityCat]
      : [];
    return { ...DEFAULT, q: searchParams.get('q') ?? '', capabilities: initialCap };
  });
  const [vendors, setVendors] = useState<VendorListItem[]>(initialVendors);
  const [shortlistIds, setShortlistIds] = useState<Set<string>>(new Set(initialShortlistIds));
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Re-fetch when filters change (debounced).
  useEffect(() => {
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.q) params.set('q', filters.q);
        for (const c of filters.capabilities) params.append('capability', c);
        for (const d of filters.disciplines) params.append('discipline', d);
        for (const s of filters.sectors) params.append('sector', s);
        for (const r of filters.regions) params.append('region', r);
        if (filters.gmpOnly) params.set('gmp', '1');
        if (filters.availability !== 'ANY') params.set('availability', filters.availability);
        if (filters.minScore > 0) params.set('minScore', String(filters.minScore));
        if (filters.maxScore < 100) params.set('maxScore', String(filters.maxScore));
        const res = await fetch(`/api/vendors?${params.toString()}`);
        const json = await res.json();
        if (res.ok) setVendors(json.vendors);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [filters]);

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function toggleArrayFilter<T>(
    key: 'capabilities' | 'disciplines' | 'sectors' | 'regions',
    value: T,
  ) {
    setFilters((f) => {
      const list = (f[key] as T[]) ?? [];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...f, [key]: next } as Filters;
    });
  }

  async function toggleShortlist(vendorId: string) {
    const isShortlisted = shortlistIds.has(vendorId);
    const method = isShortlisted ? 'DELETE' : 'POST';
    const res = await fetch('/api/client/shortlist', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId }),
    });
    if (res.ok) {
      setShortlistIds((prev) => {
        const next = new Set(prev);
        if (isShortlisted) next.delete(vendorId);
        else next.add(vendorId);
        return next;
      });
      toast(isShortlisted ? 'Removed from shortlist' : 'Added to shortlist', 'success');
    } else {
      toast('Could not update shortlist', 'error');
    }
  }

  function toggleCompare(vendorId: string) {
    setCompareIds((ids) => {
      if (ids.includes(vendorId)) return ids.filter((i) => i !== vendorId);
      if (ids.length >= 3) {
        toast('Compare up to three vendors at a time', 'error');
        return ids;
      }
      return [...ids, vendorId];
    });
  }

  const activeCount = useMemo(
    () =>
      filters.capabilities.length +
      filters.disciplines.length +
      filters.sectors.length +
      filters.regions.length +
      (filters.gmpOnly ? 1 : 0) +
      (filters.availability !== 'ANY' ? 1 : 0) +
      (filters.minScore > 0 || filters.maxScore < 100 ? 1 : 0),
    [filters],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div>
          <label className="label" htmlFor="q">Search</label>
          <input
            id="q"
            className="input"
            placeholder="Company, discipline, keyword…"
            value={filters.q}
            onChange={(e) => update('q', e.target.value)}
          />
        </div>
        <FilterGroup label="Capabilities">
          <div className="flex flex-wrap gap-1.5">
            {CAPABILITY_CATEGORIES.map((c) => {
              const active = filters.capabilities.includes(c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggleArrayFilter('capabilities', c.value)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium transition',
                    active
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-100',
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </FilterGroup>
        <FilterGroup label="Disciplines">
          <div className="flex flex-wrap gap-1.5">
            {DISCIPLINE_OPTIONS.map((d) => {
              const active = filters.disciplines.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleArrayFilter('disciplines', d)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium',
                    active
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-100',
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </FilterGroup>
        <FilterGroup label="Sectors">
          <div className="flex flex-wrap gap-1.5">
            {SECTOR_OPTIONS.slice(0, 6).map((s) => {
              const active = filters.sectors.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleArrayFilter('sectors', s)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium',
                    active ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-100',
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </FilterGroup>
        <FilterGroup label="Regions">
          <div className="flex flex-wrap gap-1.5">
            {REGION_OPTIONS.slice(0, 6).map((r) => {
              const active = filters.regions.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleArrayFilter('regions', r)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium',
                    active ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-100',
                  )}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </FilterGroup>
        <FilterGroup label="Availability">
          <div className="flex flex-wrap gap-1.5">
            {[{ value: 'ANY', label: 'Any' }, ...CAPACITY_LEVELS].map((o) => {
              const active = filters.availability === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => update('availability', o.value as Filters['availability'])}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium',
                    active ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-100',
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </FilterGroup>
        <FilterGroup label="GMP experience">
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={filters.gmpOnly}
              onChange={(e) => update('gmpOnly', e.target.checked)}
              className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            GMP-experienced vendors only
          </label>
        </FilterGroup>
        <FilterGroup label={`VQI score · ${filters.minScore}–${filters.maxScore}`}>
          <RangeSlider
            min={0}
            max={100}
            step={5}
            value={[filters.minScore, filters.maxScore]}
            onChange={([lo, hi]) => setFilters((f) => ({ ...f, minScore: lo, maxScore: hi }))}
          />
        </FilterGroup>
        {activeCount > 0 && (
          <button onClick={() => setFilters(DEFAULT)} className="btn-ghost w-full">
            Clear {activeCount} filter{activeCount === 1 ? '' : 's'}
          </button>
        )}
      </aside>

      <section>
        <header className="flex flex-col items-start justify-between gap-3 pb-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Vendor network</h1>
            <p className="text-sm text-ink-500">
              {loading ? 'Searching…' : `${vendors.length} vendor${vendors.length === 1 ? '' : 's'} match your filters`}
            </p>
          </div>
          {compareIds.length > 0 && (
            <Link
              href={`/client/compare?ids=${compareIds.join(',')}`}
              className="btn-primary"
            >
              Compare {compareIds.length}
            </Link>
          )}
        </header>

        {vendors.length === 0 && !loading ? (
          <EmptyState
            title="No vendors match yet"
            description="Try widening your filters or clearing the search query."
          />
        ) : (
          <ul className="space-y-3">
            {vendors.map((v) => (
              <li key={v.id} className="card group p-5 transition hover:border-brand-300">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {v.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={v.logoUrl}
                          alt=""
                          className="h-10 w-10 rounded-lg border border-ink-100 object-contain bg-white p-0.5"
                        />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                          {v.companyName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <Link href={`/client/vendors/${v.id}`} className="text-base font-semibold text-ink-900 hover:text-brand-700">
                          {v.companyName}
                        </Link>
                        <div className="text-xs text-ink-500">
                          {v.locations[0] ? `${v.locations[0].city}, ${v.locations[0].country}` : '—'}
                          {v.gmpExperience && <span className="ml-2 text-emerald-700">· GMP</span>}
                        </div>
                      </div>
                    </div>
                    {v.description && (
                      <p className="mt-3 line-clamp-2 max-w-2xl text-sm text-ink-600">{v.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {v.capabilities.slice(0, 4).map((c) => (
                        <span key={c.category} className="chip-brand">
                          {c.category} · {c.level.charAt(0) + c.level.slice(1).toLowerCase()}
                        </span>
                      ))}
                      {v.capabilities.length > 4 && (
                        <span className="chip">+{v.capabilities.length - 4}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row items-stretch gap-3 lg:flex-col lg:items-end lg:justify-between">
                    <div className="flex flex-col items-center gap-1">
                      <ScoreBadge score={v.vqiScore} size="lg" showLabel />
                      <span className="text-[10px] uppercase tracking-wider text-ink-500">VQI score</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCompare(v.id)}
                        className={cn(
                          'btn px-3 py-1.5 text-xs',
                          compareIds.includes(v.id)
                            ? 'border border-brand-500 bg-brand-50 text-brand-800'
                            : 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
                        )}
                      >
                        {compareIds.includes(v.id) ? 'Selected' : 'Compare'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleShortlist(v.id)}
                        className={cn(
                          'btn px-3 py-1.5 text-xs',
                          shortlistIds.has(v.id)
                            ? 'border border-amber-300 bg-amber-50 text-amber-800'
                            : 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
                        )}
                      >
                        {shortlistIds.has(v.id) ? '★ Shortlisted' : '☆ Shortlist'}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</div>
      {children}
    </div>
  );
}
