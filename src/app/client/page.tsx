import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { CAPABILITY_CATEGORIES } from '@/lib/constants';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata = { title: 'Dashboard · TipTop' };

export default async function ClientDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/client');

  const [vendorCount, gmpCount, top, recentShortlist, capabilityCounts, scoreAgg] =
    await Promise.all([
      prisma.vendorProfile.count({ where: { isPublished: true } }),
      prisma.vendorProfile.count({ where: { isPublished: true, gmpExperience: true } }),
      prisma.vendorProfile.findMany({
        where: { isPublished: true },
        include: {
          locations: { where: { isHeadquarters: true }, take: 1 },
          capabilities: true,
        },
        orderBy: [{ vqiScore: 'desc' }],
        take: 5,
      }),
      prisma.shortlistEntry.findMany({
        where: { clientId: user.id },
        include: {
          vendor: {
            include: { locations: { where: { isHeadquarters: true }, take: 1 } },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.capability.groupBy({
        by: ['category'],
        _count: { _all: true },
        where: { vendor: { isPublished: true } },
      }),
      prisma.vendorProfile.aggregate({
        where: { isPublished: true },
        _avg: { vqiScore: true },
        _max: { vqiScore: true },
      }),
    ]);

  const avg = Math.round(scoreAgg._avg.vqiScore ?? 0);
  const max = scoreAgg._max.vqiScore ?? 0;
  const capByCat = new Map(capabilityCounts.map((c) => [c.category, c._count._all]));
  const totalShortlisted = await prisma.shortlistEntry.count({ where: { clientId: user.id } });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-950">
          Welcome back, {user.fullName.split(' ')[0]}
        </h1>
        <p className="text-sm text-ink-500">
          A live snapshot of the TipTop vendor network and your shortlist.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Live vendors" value={vendorCount.toLocaleString()} hint="Published profiles" />
        <StatCard
          label="GMP experienced"
          value={gmpCount.toLocaleString()}
          hint={`${vendorCount > 0 ? Math.round((gmpCount / vendorCount) * 100) : 0}% of network`}
        />
        <StatCard label="Average VQI" value={String(avg)} hint={`Top score: ${max}`} accent={avg >= 70 ? 'good' : 'neutral'} />
        <StatCard label="Your shortlist" value={String(totalShortlisted)} hint="Saved vendors" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">Top-rated vendors</h2>
            <Link href="/client/vendors" className="text-sm font-medium text-brand-300 hover:text-brand-200 hover:underline">
              Browse all →
            </Link>
          </div>
          {top.length === 0 ? (
            <EmptyState
              className="mt-4"
              title="The network is empty"
              description="As vendors publish their profiles they will appear here."
            />
          ) : (
            <ul className="mt-4 divide-y divide-ink-100">
              {top.map((v, i) => (
                <li key={v.id} className="flex items-center gap-4 py-3">
                  <div className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-semibold text-ink-700 backdrop-blur">
                    {i + 1}
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-lg border border-brand-400/30 bg-brand-500/15 text-sm font-semibold text-brand-200 backdrop-blur">
                    {v.companyName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/client/vendors/${v.id}`}
                      className="block truncate text-sm font-semibold text-ink-900 hover:text-brand-300"
                    >
                      {v.companyName}
                    </Link>
                    <div className="truncate text-xs text-ink-500">
                      {v.locations[0]
                        ? `${v.locations[0].city}, ${v.locations[0].country}`
                        : 'Location not specified'}
                      {v.gmpExperience && <span className="ml-2 text-emerald-300">· GMP</span>}
                    </div>
                  </div>
                  <div className="hidden gap-1 sm:flex">
                    {v.capabilities.slice(0, 3).map((c) => (
                      <span key={c.category} className="chip-brand">
                        {c.category}
                      </span>
                    ))}
                  </div>
                  <ScoreBadge score={v.vqiScore} size="md" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">Recent shortlist</h2>
            <Link href="/client/shortlist" className="text-sm font-medium text-brand-300 hover:text-brand-200 hover:underline">
              Open →
            </Link>
          </div>
          {recentShortlist.length === 0 ? (
            <p className="mt-4 text-sm text-ink-500">
              You haven&apos;t saved any vendors yet. Browse the network and tap ☆ Shortlist on any
              vendor that catches your eye.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentShortlist.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-md">
                  <Link
                    href={`/client/vendors/${e.vendor.id}`}
                    className="truncate text-sm font-medium text-ink-900 hover:text-brand-300"
                  >
                    {e.vendor.companyName}
                  </Link>
                  <ScoreBadge score={e.vendor.vqiScore} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-base font-semibold text-ink-900">Network capability coverage</h2>
        <p className="text-sm text-ink-500">
          How many published vendors can deliver each discipline.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITY_CATEGORIES.map((cat) => {
            const count = capByCat.get(cat.value) ?? 0;
            const pct = vendorCount > 0 ? Math.round((count / vendorCount) * 100) : 0;
            return (
              <Link
                key={cat.value}
                href={`/client/vendors?cap=${cat.value}`}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md transition hover:border-brand-400/40 hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-900">{cat.label}</span>
                  <span className="text-sm font-semibold text-ink-900">{count}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-brand-500 shadow-[0_0_6px_rgba(106,142,255,0.5)]" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 text-xs text-ink-500">{pct}% of network</div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: 'good' | 'neutral';
}) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider text-ink-500">{label}</div>
      <div
        className={`mt-1 text-3xl font-semibold ${
          accent === 'good' ? 'text-emerald-300' : 'text-ink-900'
        }`}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-ink-500">{hint}</div>}
    </div>
  );
}
