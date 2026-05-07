'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useToast } from '@/components/ui/Toast';
import {
  CAPABILITY_CATEGORIES,
  CAPABILITY_LEVELS,
  CAPACITY_LEVELS,
  DISCIPLINE_OPTIONS,
  PROJECT_TYPES,
  PROJECT_VALUE_RANGES,
  QUALITY_SYSTEM_OPTIONS,
  REGION_OPTIONS,
  SECTOR_OPTIONS,
  SOURCING_MODES,
} from '@/lib/constants';
import type {
  CapabilityCategory,
  CapabilityLevel,
  CapacityLevel,
  SourcingMode,
} from '@prisma/client';

export interface ProfileData {
  companyName: string;
  websiteUrl: string;
  contactEmail: string;
  contactPhone: string;
  yearFounded: number | null;
  description: string;
  logoUrl: string;
  sectors: string[];
  locations: { city: string; country: string; isHeadquarters: boolean }[];
  headcount: number | null;
  keyDisciplines: string[];
  sourcingMode: SourcingMode;
  internalRatio: number | null;
  capabilities: { category: CapabilityCategory; level: CapabilityLevel; notes?: string | null }[];
  projects: {
    name: string;
    client?: string | null;
    projectType?: string | null;
    scopeDelivered?: string | null;
    valueRange?: string | null;
    year?: number | null;
    isGmp: boolean;
    sector?: string | null;
    location?: string | null;
  }[];
  qualitySystems: string[];
  gmpExperience: boolean;
  gmpYears: number | null;
  auditHistory: string;
  certifications: {
    name: string;
    issuer?: string | null;
    issuedYear?: number | null;
    expiresYear?: number | null;
    reference?: string | null;
  }[];
  regions: string[];
  currentWorkload: CapacityLevel;
  availableCapacity: CapacityLevel;
  availableFromMonths: number | null;
  isPublished: boolean;
}

const STEPS = [
  { key: 'company', label: 'Company', summary: 'A. Company information' },
  { key: 'organisation', label: 'Organisation', summary: 'B. Organisation & resources' },
  { key: 'capabilities', label: 'Capabilities', summary: 'C. Technical capabilities' },
  { key: 'projects', label: 'Projects', summary: 'D. Project experience' },
  { key: 'quality', label: 'Quality', summary: 'E. Quality & compliance' },
  { key: 'capacity', label: 'Capacity', summary: 'F. Capacity & availability' },
  { key: 'review', label: 'Review', summary: 'Review & publish' },
] as const;

type StepKey = (typeof STEPS)[number]['key'];
type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

// ── Validation ──────────────────────────────────────────────────────────────
// Returns an array of human-readable errors for the given step. Empty = valid.
function validateStep(step: StepKey, data: ProfileData): string[] {
  const errors: string[] = [];
  switch (step) {
    case 'company':
      if (!data.companyName.trim()) errors.push('Company name is required.');
      if (data.locations.length === 0) errors.push('Add at least one location.');
      else if (data.locations.some((l) => !l.city.trim() || !l.country.trim()))
        errors.push('Each location needs a city and a country.');
      if (data.websiteUrl && !/^https?:\/\//i.test(data.websiteUrl))
        errors.push('Website URL must start with http:// or https://');
      if (data.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail))
        errors.push('Contact email is not a valid address.');
      break;
    case 'organisation':
      if (!data.headcount || data.headcount < 1) errors.push('Headcount is required.');
      if (data.keyDisciplines.length === 0) errors.push('Pick at least one key discipline.');
      break;
    case 'capabilities':
      if (data.capabilities.length < 3)
        errors.push('Declare at least three capability disciplines.');
      break;
    case 'projects':
      if (data.projects.length === 0) errors.push('Add at least one project.');
      else if (data.projects.some((p) => !p.name.trim()))
        errors.push('Every project needs a name.');
      break;
    case 'quality':
      if (data.certifications.length === 0)
        errors.push('Add at least one certification or quality reference.');
      else if (data.certifications.some((c) => !c.name.trim()))
        errors.push('Every certification needs a name.');
      break;
    case 'capacity':
      if (data.regions.length === 0) errors.push('Pick at least one region of operation.');
      break;
    case 'review':
      // Review step requires every prior step to be valid before publishing.
      for (const s of STEPS.slice(0, -1)) {
        const e = validateStep(s.key, data);
        for (const err of e) errors.push(`${s.label}: ${err}`);
      }
      break;
  }
  return errors;
}

export function ProfileWizard({ initial }: { initial: ProfileData }) {
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState<ProfileData>(initial);
  const [stepIdx, setStepIdx] = useState(0);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [showStepErrors, setShowStepErrors] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const step = STEPS[stepIdx];
  const stepErrors = useMemo(() => validateStep(step.key, data), [step.key, data]);

  const update = useCallback(<K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setStatus('dirty');
    setShowStepErrors(false);
  }, []);

  // ── Save (manual + auto) ────────────────────────────────────────────────
  const inFlight = useRef<AbortController | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  const save = useCallback(
    async ({
      publish,
      silent,
    }: { publish?: boolean; silent?: boolean } = {}): Promise<boolean> => {
      // Cancel any in-flight save.
      inFlight.current?.abort();
      const ctrl = new AbortController();
      inFlight.current = ctrl;
      setStatus('saving');
      try {
        const payload = {
          ...dataRef.current,
          ...(publish !== undefined ? { isPublished: publish } : {}),
        };
        const res = await fetch('/api/vendor/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: ctrl.signal,
        });
        if (ctrl.signal.aborted) return false;
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setStatus('error');
          if (!silent) toast(json.error ?? 'Could not save', 'error');
          return false;
        }
        setStatus('saved');
        setLastSavedAt(new Date());
        if (publish !== undefined) setData((d) => ({ ...d, isPublished: publish }));
        if (!silent) {
          toast(
            publish === true
              ? 'Profile published'
              : publish === false
                ? 'Profile unpublished'
                : 'Saved',
            'success',
          );
        }
        router.refresh();
        return true;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return false;
        setStatus('error');
        if (!silent) toast('Network error while saving', 'error');
        return false;
      }
    },
    [router, toast],
  );

  // Debounced auto-save: triggers ~1.5s after the last edit.
  useEffect(() => {
    if (status !== 'dirty') return;
    const handle = setTimeout(() => {
      void save({ silent: true });
    }, 1500);
    return () => clearTimeout(handle);
  }, [status, save]);

  // Save on tab close as a last-resort safety net.
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (status === 'dirty' || status === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [status]);

  async function continueOrPublish({ publish }: { publish?: boolean } = {}) {
    if (stepErrors.length > 0) {
      setShowStepErrors(true);
      toast(stepErrors[0], 'error');
      return;
    }
    const ok = await save({ publish });
    if (!ok) return;
    if (publish === undefined && stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-4">
          <div className="text-xs uppercase tracking-wider text-ink-500">Prequalification</div>
          <ol className="mt-3 space-y-1">
            {STEPS.map((s, i) => {
              const active = i === stepIdx;
              const stepIsValid = validateStep(s.key, data).length === 0;
              const visited = i < stepIdx;
              return (
                <li key={s.key}>
                  <button
                    onClick={() => setStepIdx(i)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition',
                      active
                        ? 'border border-brand-400/40 bg-brand-500/15 text-brand-100 shadow-[0_0_14px_-2px_rgba(106,142,255,0.3)]'
                        : 'text-ink-700 hover:bg-white/[0.06]',
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-semibold',
                        active
                          ? 'border-brand-400 bg-brand-500 text-white shadow-[0_0_10px_rgba(106,142,255,0.5)]'
                          : visited && stepIsValid
                            ? 'border-emerald-400 bg-emerald-500 text-white shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                            : visited && !stepIsValid
                              ? 'border-amber-400/50 bg-amber-500/20 text-amber-200'
                              : 'border-white/15 bg-white/[0.05] text-ink-500',
                      )}
                    >
                      {visited && stepIsValid ? '✓' : visited && !stepIsValid ? '!' : i + 1}
                    </span>
                    <span className="font-medium">{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="mt-4 space-y-2">
            <SaveIndicator status={status} lastSavedAt={lastSavedAt} />
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs backdrop-blur-md">
              <span className="text-ink-500">Status</span>
              <span className={data.isPublished ? 'font-semibold text-emerald-300' : 'font-semibold text-ink-700'}>
                {data.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <section className="card p-6 lg:p-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-500">{step.summary}</div>
            <h2 className="mt-1 text-xl font-semibold text-ink-950">{step.label}</h2>
          </div>
          <div className="text-xs text-ink-500">
            Step {stepIdx + 1} of {STEPS.length}
          </div>
        </div>

        {showStepErrors && stepErrors.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-200 backdrop-blur-md">
            <div className="font-semibold">Please complete the following before continuing:</div>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              {stepErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {step.key === 'company' && <CompanyStep data={data} update={update} />}
        {step.key === 'organisation' && <OrganisationStep data={data} update={update} />}
        {step.key === 'capabilities' && <CapabilitiesStep data={data} update={update} />}
        {step.key === 'projects' && <ProjectsStep data={data} update={update} />}
        {step.key === 'quality' && <QualityStep data={data} update={update} />}
        {step.key === 'capacity' && <CapacityStep data={data} update={update} />}
        {step.key === 'review' && (
          <ReviewStep
            data={data}
            allErrors={validateStep('review', data)}
            onJump={(k: StepKey) => setStepIdx(STEPS.findIndex((s) => s.key === k))}
          />
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-6">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
            disabled={stepIdx === 0}
          >
            Back
          </button>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-ghost" onClick={() => save()} disabled={status === 'saving'}>
              {status === 'saving' ? 'Saving…' : 'Save draft'}
            </button>
            {step.key === 'review' ? (
              data.isPublished ? (
                <button type="button" className="btn-secondary" onClick={() => continueOrPublish({ publish: false })} disabled={status === 'saving'}>
                  Unpublish
                </button>
              ) : (
                <button type="button" className="btn-primary" onClick={() => continueOrPublish({ publish: true })} disabled={status === 'saving'}>
                  Publish profile
                </button>
              )
            ) : (
              <button type="button" className="btn-primary" onClick={() => continueOrPublish()} disabled={status === 'saving'}>
                Save & continue
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function SaveIndicator({ status, lastSavedAt }: { status: SaveStatus; lastSavedAt: Date | null }) {
  const [, force] = useState(0);
  // Re-render every 30s so the "saved 2 min ago" label refreshes.
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  let dot = 'bg-white/30';
  let label = 'Auto-save on';
  if (status === 'dirty') {
    dot = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]';
    label = 'Unsaved changes…';
  } else if (status === 'saving') {
    dot = 'bg-brand-400 animate-pulse shadow-[0_0_8px_rgba(106,142,255,0.5)]';
    label = 'Saving…';
  } else if (status === 'saved') {
    dot = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]';
    label = lastSavedAt ? `Saved ${formatRelative(lastSavedAt)}` : 'Saved';
  } else if (status === 'error') {
    dot = 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]';
    label = 'Save failed';
  }
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-ink-700 backdrop-blur-md">
      <span className={cn('h-2 w-2 rounded-full', dot)} />
      <span>{label}</span>
    </div>
  );
}

function formatRelative(d: Date): string {
  const seconds = Math.round((Date.now() - d.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} h ago`;
}

// ── Steps ───────────────────────────────────────────────────────────────────

function CompanyStep({
  data,
  update,
}: {
  data: ProfileData;
  update: <K extends keyof ProfileData>(k: K, v: ProfileData[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Company name" required>
          <input className="input" value={data.companyName} onChange={(e) => update('companyName', e.target.value)} />
        </Field>
        <Field label="Year founded">
          <input
            type="number"
            className="input"
            value={data.yearFounded ?? ''}
            onChange={(e) => update('yearFounded', e.target.value ? Number(e.target.value) : null)}
          />
        </Field>
        <Field label="Website">
          <input className="input" placeholder="https://" value={data.websiteUrl} onChange={(e) => update('websiteUrl', e.target.value)} />
        </Field>
        <Field label="Contact email">
          <input type="email" className="input" value={data.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} />
        </Field>
        <Field label="Contact phone">
          <input className="input" value={data.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} />
        </Field>
        <Field label="Logo URL" hint="Square logo, PNG or SVG. Optional.">
          <input
            className="input"
            placeholder="https://your-cdn.example/logo.png"
            value={data.logoUrl}
            onChange={(e) => update('logoUrl', e.target.value)}
          />
        </Field>
      </div>
      {data.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.logoUrl}
          alt="Logo preview"
          className="h-16 w-16 rounded-xl border border-white/15 bg-white/[0.05] object-contain p-1 backdrop-blur"
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
        />
      )}
      <Field label="Short description" hint="One or two sentences shown on your profile and search results.">
        <textarea
          className="input min-h-[96px]"
          value={data.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </Field>
      <Field label="Sectors served">
        <ChipMulti options={SECTOR_OPTIONS} value={data.sectors} onChange={(v) => update('sectors', v)} />
      </Field>
      <Field label="Locations" hint="Add at least your headquarters. You can add more office or site locations." required>
        <LocationsEditor value={data.locations} onChange={(v) => update('locations', v)} />
      </Field>
    </div>
  );
}

function OrganisationStep({
  data,
  update,
}: {
  data: ProfileData;
  update: <K extends keyof ProfileData>(k: K, v: ProfileData[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Total headcount" required>
          <input
            type="number"
            className="input"
            value={data.headcount ?? ''}
            onChange={(e) => update('headcount', e.target.value ? Number(e.target.value) : null)}
          />
        </Field>
        <Field label="Sourcing model">
          <select
            className="input"
            value={data.sourcingMode}
            onChange={(e) => update('sourcingMode', e.target.value as SourcingMode)}
          >
            {SOURCING_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Internal capability ratio (%)" hint="Approximate share of work performed in-house vs subcontracted.">
          <input
            type="number"
            min={0}
            max={100}
            className="input"
            value={data.internalRatio ?? ''}
            onChange={(e) =>
              update('internalRatio', e.target.value ? Math.max(0, Math.min(100, Number(e.target.value))) : null)
            }
          />
        </Field>
      </div>
      <Field label="Key disciplines" hint="Highlight the in-house teams clients should expect." required>
        <ChipMulti options={DISCIPLINE_OPTIONS} value={data.keyDisciplines} onChange={(v) => update('keyDisciplines', v)} />
      </Field>
    </div>
  );
}

function CapabilitiesStep({
  data,
  update,
}: {
  data: ProfileData;
  update: <K extends keyof ProfileData>(k: K, v: ProfileData[K]) => void;
}) {
  function setLevel(category: CapabilityCategory, level: CapabilityLevel | null) {
    const others = data.capabilities.filter((c) => c.category !== category);
    update('capabilities', level ? [...others, { category, level }] : others);
  }
  function getLevel(category: CapabilityCategory): CapabilityLevel | null {
    return data.capabilities.find((c) => c.category === category)?.level ?? null;
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-500">
        Tag every discipline you can deliver, then rate the depth your in-house team brings.
        Declare at least three to qualify for the network.
      </p>
      <div className="space-y-3">
        {CAPABILITY_CATEGORIES.map((cat) => {
          const level = getLevel(cat.value);
          return (
            <div key={cat.value} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink-900">{cat.label}</div>
                  <div className="text-xs text-ink-500">{cat.description}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLevel(cat.value, null)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium',
                      !level ? 'border-white/25 bg-white/[0.08] text-ink-900 backdrop-blur-md' : 'border-white/15 bg-white/[0.04] text-ink-500 backdrop-blur-md hover:border-white/20 hover:bg-white/[0.07]',
                    )}
                  >
                    Not offered
                  </button>
                  {CAPABILITY_LEVELS.map((lv) => (
                    <button
                      key={lv.value}
                      type="button"
                      onClick={() => setLevel(cat.value, lv.value)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium',
                        level === lv.value
                          ? 'border-brand-400 bg-brand-500 text-white shadow-[0_0_10px_rgba(106,142,255,0.4)]'
                          : 'border-white/15 bg-white/[0.04] text-ink-700 backdrop-blur-md hover:border-white/20 hover:bg-white/[0.07]',
                      )}
                    >
                      {lv.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectsStep({
  data,
  update,
}: {
  data: ProfileData;
  update: <K extends keyof ProfileData>(k: K, v: ProfileData[K]) => void;
}) {
  function add() {
    update('projects', [
      ...data.projects,
      {
        name: '',
        client: '',
        projectType: '',
        scopeDelivered: '',
        valueRange: '',
        year: null,
        isGmp: false,
        sector: '',
        location: '',
      },
    ]);
  }
  function remove(idx: number) {
    update(
      'projects',
      data.projects.filter((_, i) => i !== idx),
    );
  }
  function patch(idx: number, partial: Partial<ProfileData['projects'][number]>) {
    update(
      'projects',
      data.projects.map((p, i) => (i === idx ? { ...p, ...partial } : p)),
    );
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-500">
        Add representative projects. Use generic names if a project is confidential.
      </p>
      {data.projects.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center text-sm text-ink-500">
          No projects yet — add at least one to satisfy the prequalification.
        </div>
      )}
      <div className="space-y-4">
        {data.projects.map((p, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3">
              <div className="text-sm font-semibold text-ink-700">Project {i + 1}</div>
              <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-300 hover:underline">
                Remove
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Project name" required>
                <input className="input" value={p.name} onChange={(e) => patch(i, { name: e.target.value })} />
              </Field>
              <Field label="Client">
                <input className="input" value={p.client ?? ''} onChange={(e) => patch(i, { client: e.target.value })} />
              </Field>
              <Field label="Project type">
                <select
                  className="input"
                  value={p.projectType ?? ''}
                  onChange={(e) => patch(i, { projectType: e.target.value })}
                >
                  <option value="">—</option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Sector">
                <select
                  className="input"
                  value={p.sector ?? ''}
                  onChange={(e) => patch(i, { sector: e.target.value })}
                >
                  <option value="">—</option>
                  {SECTOR_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Approx. value (CHF)">
                <select
                  className="input"
                  value={p.valueRange ?? ''}
                  onChange={(e) => patch(i, { valueRange: e.target.value })}
                >
                  <option value="">—</option>
                  {PROJECT_VALUE_RANGES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Year">
                <input
                  type="number"
                  className="input"
                  value={p.year ?? ''}
                  onChange={(e) => patch(i, { year: e.target.value ? Number(e.target.value) : null })}
                />
              </Field>
              <Field label="Location">
                <input className="input" value={p.location ?? ''} onChange={(e) => patch(i, { location: e.target.value })} />
              </Field>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-ink-700">
                  <input
                    type="checkbox"
                    checked={p.isGmp}
                    onChange={(e) => patch(i, { isGmp: e.target.checked })}
                    className="h-4 w-4 rounded border-white/30 bg-white/10 text-brand-500 focus:ring-brand-400"
                  />
                  GMP / regulated environment
                </label>
              </div>
            </div>
            <Field label="Scope delivered">
              <textarea
                className="input min-h-[72px]"
                value={p.scopeDelivered ?? ''}
                onChange={(e) => patch(i, { scopeDelivered: e.target.value })}
              />
            </Field>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="btn-secondary">
        + Add project
      </button>
    </div>
  );
}

function QualityStep({
  data,
  update,
}: {
  data: ProfileData;
  update: <K extends keyof ProfileData>(k: K, v: ProfileData[K]) => void;
}) {
  function addCert() {
    update('certifications', [
      ...data.certifications,
      { name: '', issuer: '', issuedYear: null, expiresYear: null, reference: '' },
    ]);
  }
  function removeCert(idx: number) {
    update('certifications', data.certifications.filter((_, i) => i !== idx));
  }
  function patchCert(idx: number, partial: Partial<ProfileData['certifications'][number]>) {
    update(
      'certifications',
      data.certifications.map((c, i) => (i === idx ? { ...c, ...partial } : c)),
    );
  }
  return (
    <div className="space-y-5">
      <Field label="Quality systems & frameworks">
        <ChipMulti
          options={QUALITY_SYSTEM_OPTIONS}
          value={data.qualitySystems}
          onChange={(v) => update('qualitySystems', v)}
        />
      </Field>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="label">GMP experience</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: true, l: 'Yes' },
              { v: false, l: 'No' },
            ].map((o) => (
              <button
                key={String(o.v)}
                type="button"
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium',
                  data.gmpExperience === o.v
                    ? 'border-brand-400/50 bg-brand-500/15 text-brand-100 shadow-[0_0_14px_-2px_rgba(106,142,255,0.4)]'
                    : 'border-white/15 bg-white/[0.04] text-ink-700 backdrop-blur-md hover:border-white/20 hover:bg-white/[0.07]',
                )}
                onClick={() => update('gmpExperience', o.v)}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>
        <Field label="Years of GMP experience">
          <input
            type="number"
            className="input"
            disabled={!data.gmpExperience}
            value={data.gmpYears ?? ''}
            onChange={(e) => update('gmpYears', e.target.value ? Number(e.target.value) : null)}
          />
        </Field>
        <Field label="Recent audit history" hint="Brief notes about client / authority audits.">
          <input
            className="input"
            value={data.auditHistory}
            onChange={(e) => update('auditHistory', e.target.value)}
          />
        </Field>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="label mb-0">Certifications</span>
          <button type="button" onClick={addCert} className="text-sm font-medium text-brand-300 hover:text-brand-200 hover:underline">
            + Add
          </button>
        </div>
        {data.certifications.length === 0 && (
          <div className="mt-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-center text-sm text-ink-500">
            No certifications yet.
          </div>
        )}
        <div className="mt-3 space-y-3">
          {data.certifications.map((c, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
              <div className="grid gap-3 md:grid-cols-4">
                <Field label="Name">
                  <input className="input" value={c.name} onChange={(e) => patchCert(i, { name: e.target.value })} />
                </Field>
                <Field label="Issuer">
                  <input className="input" value={c.issuer ?? ''} onChange={(e) => patchCert(i, { issuer: e.target.value })} />
                </Field>
                <Field label="Issued">
                  <input
                    type="number"
                    className="input"
                    value={c.issuedYear ?? ''}
                    onChange={(e) =>
                      patchCert(i, { issuedYear: e.target.value ? Number(e.target.value) : null })
                    }
                  />
                </Field>
                <Field label="Expires">
                  <input
                    type="number"
                    className="input"
                    value={c.expiresYear ?? ''}
                    onChange={(e) =>
                      patchCert(i, { expiresYear: e.target.value ? Number(e.target.value) : null })
                    }
                  />
                </Field>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <input
                  className="input max-w-sm"
                  placeholder="Reference / certificate number"
                  value={c.reference ?? ''}
                  onChange={(e) => patchCert(i, { reference: e.target.value })}
                />
                <button type="button" onClick={() => removeCert(i)} className="text-xs text-red-400 hover:text-red-300 hover:underline">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CapacityStep({
  data,
  update,
}: {
  data: ProfileData;
  update: <K extends keyof ProfileData>(k: K, v: ProfileData[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <Field label="Geographic coverage" hint="Regions where you can deliver projects." required>
        <ChipMulti options={REGION_OPTIONS} value={data.regions} onChange={(v) => update('regions', v)} />
      </Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Current workload" hint="How busy your delivery teams are right now.">
          <SegmentedSelect
            value={data.currentWorkload}
            options={CAPACITY_LEVELS}
            onChange={(v) => update('currentWorkload', v)}
          />
        </Field>
        <Field label="Available capacity" hint="Capacity you can dedicate to a new engagement.">
          <SegmentedSelect
            value={data.availableCapacity}
            options={CAPACITY_LEVELS}
            onChange={(v) => update('availableCapacity', v)}
          />
        </Field>
        <Field label="Available within (months)">
          <input
            type="number"
            min={0}
            max={36}
            className="input"
            value={data.availableFromMonths ?? ''}
            onChange={(e) =>
              update('availableFromMonths', e.target.value ? Number(e.target.value) : null)
            }
          />
        </Field>
      </div>
    </div>
  );
}

function ReviewStep({
  data,
  allErrors,
  onJump,
}: {
  data: ProfileData;
  allErrors: string[];
  onJump: (s: StepKey) => void;
}) {
  const totals = useMemo(() => {
    return {
      caps: data.capabilities.length,
      projects: data.projects.length,
      certs: data.certifications.length,
      regions: data.regions.length,
      sectors: data.sectors.length,
    };
  }, [data]);
  return (
    <div className="space-y-5">
      <p className="text-sm text-ink-500">
        Review your prequalification data before publishing. Once published, your profile becomes
        discoverable in the TipTop network and your VQI score is computed.
      </p>
      {allErrors.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-semibold">Some sections still need attention:</div>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {allErrors.slice(0, 6).map((e) => (
              <li key={e}>{e}</li>
            ))}
            {allErrors.length > 6 && <li>+ {allErrors.length - 6} more</li>}
          </ul>
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-3">
        <ReviewCard label="Company" value={data.companyName || '—'} hint={data.description?.slice(0, 60)} onEdit={() => onJump('company')} />
        <ReviewCard label="Headcount" value={data.headcount ? data.headcount.toLocaleString() : '—'} onEdit={() => onJump('organisation')} />
        <ReviewCard label="Capabilities declared" value={`${totals.caps}/7`} onEdit={() => onJump('capabilities')} />
        <ReviewCard label="Projects" value={String(totals.projects)} onEdit={() => onJump('projects')} />
        <ReviewCard label="Certifications" value={String(totals.certs)} onEdit={() => onJump('quality')} />
        <ReviewCard label="Regions covered" value={String(totals.regions)} onEdit={() => onJump('capacity')} />
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {hint && <div className="help">{hint}</div>}
    </div>
  );
}

function ChipMulti({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(opt: string) {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition',
              active
                ? 'border-brand-400 bg-brand-500 text-white shadow-[0_0_10px_rgba(106,142,255,0.4)]'
                : 'border-white/15 bg-white/[0.04] text-ink-700 backdrop-blur-md hover:border-white/20 hover:bg-white/[0.07]',
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SegmentedSelect<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-lg border border-white/15 bg-white/[0.04] p-1 backdrop-blur-md">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition',
            value === o.value ? 'bg-brand-500 text-white shadow-[0_0_12px_-2px_rgba(106,142,255,0.5)]' : 'text-ink-700 hover:bg-white/[0.06]',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function LocationsEditor({
  value,
  onChange,
}: {
  value: ProfileData['locations'];
  onChange: (v: ProfileData['locations']) => void;
}) {
  function add() {
    onChange([...value, { city: '', country: '', isHeadquarters: value.length === 0 }]);
  }
  function patch(i: number, partial: Partial<ProfileData['locations'][number]>) {
    onChange(value.map((l, idx) => (idx === i ? { ...l, ...partial } : l)));
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }
  function setHQ(i: number) {
    onChange(value.map((l, idx) => ({ ...l, isHeadquarters: idx === i })));
  }
  return (
    <div className="space-y-2">
      {value.map((l, i) => (
        <div key={i} className="flex flex-wrap items-end gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
          <input className="input flex-1 min-w-[140px]" placeholder="City" value={l.city} onChange={(e) => patch(i, { city: e.target.value })} />
          <input className="input flex-1 min-w-[140px]" placeholder="Country" value={l.country} onChange={(e) => patch(i, { country: e.target.value })} />
          <button
            type="button"
            onClick={() => setHQ(i)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium',
              l.isHeadquarters
                ? 'border-brand-400 bg-brand-500 text-white shadow-[0_0_10px_rgba(106,142,255,0.4)]'
                : 'border-white/15 bg-white/[0.04] text-ink-700 backdrop-blur-md hover:border-white/20 hover:bg-white/[0.07]',
            )}
          >
            HQ
          </button>
          <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-300 hover:underline">
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="btn-secondary">
        + Add location
      </button>
    </div>
  );
}

function ReviewCard({ label, value, hint, onEdit }: { label: string; value: string; hint?: string; onEdit: () => void }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-ink-500">{label}</div>
        <button type="button" onClick={onEdit} className="text-xs font-medium text-brand-300 hover:text-brand-200 hover:underline">
          Edit
        </button>
      </div>
      <div className="mt-1 text-base font-semibold text-ink-900">{value}</div>
      {hint && <div className="mt-1 line-clamp-1 text-xs text-ink-500">{hint}</div>}
    </div>
  );
}
