import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ScoreRing } from '@/components/ui/ScoreBadge';
import { CAPABILITY_CATEGORIES } from '@/lib/constants';

export const metadata = { title: 'Vendor overview · TipTop' };

export default async function VendorOverview() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: user.id },
    include: {
      capabilities: true,
      projects: { orderBy: { year: 'desc' } },
      certifications: true,
      locations: true,
    },
  });

  if (!vendor) redirect('/login');

  const isFirstRun =
    !vendor.headcount &&
    !vendor.description &&
    vendor.capabilities.length === 0 &&
    vendor.projects.length === 0;

  if (isFirstRun) {
    return <FirstRunEmpty company={vendor.companyName} />;
  }

  const capabilityMap = new Map(vendor.capabilities.map((c) => [c.category, c.level]));

  const checks = [
    { label: 'Company information', done: !!vendor.description && !!vendor.yearFounded, step: 'company' },
    { label: 'Organisation & resources', done: !!vendor.headcount && vendor.keyDisciplines.length > 0, step: 'organisation' },
    { label: 'Technical capabilities', done: vendor.capabilities.length >= 3, step: 'capabilities' },
    { label: 'Project experience', done: vendor.projects.length >= 1, step: 'projects' },
    { label: 'Quality & compliance', done: vendor.certifications.length >= 1, step: 'quality' },
    { label: 'Capacity & availability', done: vendor.regions.length > 0, step: 'capacity' },
  ];
  const remaining = checks.filter((c) => !c.done);

  return (
    <div className="space-y-8">
      <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-ink-950">{vendor.companyName}</h1>
            <span
              className={`chip text-xs ${
                vendor.isPublished
                  ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
                  : 'border-amber-400/30 bg-amber-500/15 text-amber-200'
              }`}
            >
              {vendor.isPublished ? 'Live' : 'Draft'}
            </span>
          </div>
          <p className="text-sm text-ink-500">
            {vendor.isPublished
              ? 'Your profile is live and discoverable by clients.'
              : 'Complete your profile and publish to be listed in the network.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/vendor/preview" className="btn-secondary">
            Preview as client
          </Link>
          <Link href="/vendor/profile" className="btn-primary">
            {vendor.completionPercent < 100 ? 'Continue PQQ' : 'Edit profile'}
          </Link>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card flex items-center justify-between p-6 lg:col-span-1">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-500">Vendor Quality Index</div>
            <div className="mt-1 text-2xl font-semibold text-ink-900">{vendor.companyName}</div>
            <p className="mt-3 max-w-xs text-sm text-ink-500">
              Your VQI is recomputed every time you save your PQQ.
            </p>
          </div>
          <ScoreRing score={vendor.vqiScore} size={120} />
        </div>

        <div className="card grid grid-cols-2 gap-4 p-6 lg:col-span-2">
          {[
            { label: 'Capability', value: vendor.scoreCapability },
            { label: 'Capacity', value: vendor.scoreCapacity },
            { label: 'Compliance', value: vendor.scoreCompliance },
            { label: 'Output', value: vendor.scoreOutput },
          ].map((p) => (
            <div key={p.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-700">{p.label}</span>
                <span className="text-lg font-semibold text-ink-900">{p.value}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-brand-500" style={{ width: `${p.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink-900">Profile completion</h3>
            <span className="text-sm font-semibold text-brand-700">{vendor.completionPercent}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-brand-600 shadow-[0_0_8px_rgba(106,142,255,0.5)]"
              style={{ width: `${vendor.completionPercent}%` }}
            />
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2 text-ink-700">
                <span
                  className={
                    c.done
                      ? 'grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                      : 'h-4 w-4 rounded-full border border-white/15 bg-white/[0.05]'
                  }
                >
                  {c.done && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l4 4L19 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {c.label}
              </li>
            ))}
          </ul>
          {remaining.length > 0 && (
            <Link
              href="/vendor/profile"
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-brand-400/40 bg-brand-500/15 px-3 py-2 text-sm font-medium text-brand-200 backdrop-blur transition hover:bg-brand-500/25"
            >
              Resume next: {remaining[0].label} →
            </Link>
          )}
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="text-base font-semibold text-ink-900">Technical capabilities</h3>
          <p className="text-sm text-ink-500">Self-declared expertise across the seven core disciplines.</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CAPABILITY_CATEGORIES.map((cat) => {
              const level = capabilityMap.get(cat.value);
              return (
                <div
                  key={cat.value}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md"
                >
                  <div>
                    <div className="text-sm font-semibold text-ink-900">{cat.label}</div>
                    <div className="text-xs text-ink-500">{cat.description}</div>
                  </div>
                  {level ? (
                    <span className="chip-brand">{level.charAt(0) + level.slice(1).toLowerCase()}</span>
                  ) : (
                    <span className="chip text-ink-400">Not declared</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-ink-900">Recent projects</h3>
          {vendor.projects.length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">No projects added yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink-100">
              {vendor.projects.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-semibold text-ink-900">{p.name}</div>
                    <div className="text-xs text-ink-500">
                      {[p.client, p.projectType, p.year].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.isGmp && <span className="chip-brand">GMP</span>}
                    {p.valueRange && <span className="chip">{p.valueRange}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card p-6">
          <h3 className="text-base font-semibold text-ink-900">Certifications</h3>
          {vendor.certifications.length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">No certifications added yet.</p>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {vendor.certifications.map((c) => (
                <li key={c.id} className="chip">
                  {c.name}
                  {c.issuedYear ? ` · ${c.issuedYear}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function FirstRunEmpty({ company }: { company: string }) {
  const steps = [
    { n: 1, title: 'Tell us about your company', detail: 'Headquarters, year founded, sectors served and a 1-2 line description.' },
    { n: 2, title: 'Declare your capabilities', detail: 'Tag the disciplines you can deliver and your team’s depth.' },
    { n: 3, title: 'Add reference projects & certifications', detail: 'Up to 5 minutes — they power your VQI score.' },
  ];
  return (
    <div className="space-y-8">
      <div className="card relative overflow-hidden p-8 lg:p-10">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative">
          <span className="chip-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Welcome
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink-950">
            Let’s get {company} prequalified.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-600">
            The PQQ takes about 10 minutes. Auto-save keeps your progress as you go, and your VQI
            score is computed live from what you fill in.
          </p>
          <div className="mt-6 flex gap-2">
            <Link href="/vendor/profile?welcome=1" className="btn-primary">
              Start the PQQ →
            </Link>
            <Link href="/vendor/preview" className="btn-secondary">
              Preview empty profile
            </Link>
          </div>
        </div>
      </div>

      <ol className="grid gap-4 sm:grid-cols-3">
        {steps.map((s) => (
          <li key={s.n} className="card p-5">
            <div className="grid h-8 w-8 place-items-center rounded-full border border-brand-400/30 bg-brand-500/20 text-sm font-semibold text-brand-200">
              {s.n}
            </div>
            <div className="mt-3 text-base font-semibold text-ink-900">{s.title}</div>
            <div className="mt-1 text-sm text-ink-600">{s.detail}</div>
          </li>
        ))}
      </ol>

      <div className="card p-6">
        <h3 className="text-base font-semibold text-ink-900">What clients see</h3>
        <p className="text-sm text-ink-500">
          A snapshot of how your published profile will appear to procurement teams.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { label: 'Capability', hint: 'Your declared discipline depth' },
            { label: 'Capacity', hint: 'Workload headroom & regions' },
            { label: 'Compliance', hint: 'Certs, quality systems, GMP' },
          ].map((p) => (
            <div key={p.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
              <div className="text-xs uppercase tracking-wider text-ink-500">{p.label}</div>
              <div className="mt-1 text-base font-semibold text-ink-900">— / 100</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/4 rounded-full bg-white/20" />
              </div>
              <div className="mt-2 text-xs text-ink-500">{p.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
