import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ScoreBadge, ScoreRing } from '@/components/ui/ScoreBadge';
import { CAPABILITY_CATEGORIES } from '@/lib/constants';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata = { title: 'Compare vendors · TipTop' };

export default async function ComparePage({ searchParams }: { searchParams: { ids?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const idList = (searchParams.ids ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (idList.length === 0) {
    return (
      <EmptyState
        title="Select vendors to compare"
        description="Pick two or three vendors from the network and compare them side-by-side."
        action={<Link href="/client/vendors" className="btn-primary">Browse vendors</Link>}
      />
    );
  }

  const vendors = await prisma.vendorProfile.findMany({
    where: { id: { in: idList }, isPublished: true },
    include: {
      capabilities: true,
      certifications: true,
      projects: true,
      locations: { where: { isHeadquarters: true }, take: 1 },
    },
  });

  const ordered = idList.map((id) => vendors.find((v) => v.id === id)).filter((v): v is NonNullable<typeof v> => Boolean(v));

  if (ordered.length === 0) {
    return <EmptyState title="No vendors found" description="Those vendors are not available." />;
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Compare vendors</h1>
          <p className="text-sm text-ink-500">{ordered.length} vendors side-by-side</p>
        </div>
        <Link href="/client/vendors" className="btn-secondary">
          ← Back to network
        </Link>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-44 bg-ink-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500"></th>
              {ordered.map((v) => (
                <th key={v.id} className="min-w-[260px] border-b border-ink-100 bg-white p-4 text-left align-top">
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
                      </div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <CompareRow label="VQI score" sticky>
              {ordered.map((v) => (
                <td key={v.id} className="border-b border-ink-100 bg-white p-4 align-top">
                  <ScoreRing score={v.vqiScore} size={84} />
                </td>
              ))}
            </CompareRow>

            <CompareRow label="Capability">
              {ordered.map((v) => <ScoreCell key={v.id} score={v.scoreCapability} />)}
            </CompareRow>
            <CompareRow label="Capacity">
              {ordered.map((v) => <ScoreCell key={v.id} score={v.scoreCapacity} />)}
            </CompareRow>
            <CompareRow label="Compliance">
              {ordered.map((v) => <ScoreCell key={v.id} score={v.scoreCompliance} />)}
            </CompareRow>
            <CompareRow label="Output">
              {ordered.map((v) => <ScoreCell key={v.id} score={v.scoreOutput} />)}
            </CompareRow>

            <CompareRow label="Capabilities">
              {ordered.map((v) => {
                const map = new Map(v.capabilities.map((c) => [c.category, c.level]));
                return (
                  <td key={v.id} className="border-b border-ink-100 bg-white p-4 align-top text-sm">
                    <ul className="space-y-1">
                      {CAPABILITY_CATEGORIES.map((cat) => {
                        const lv = map.get(cat.value);
                        return (
                          <li key={cat.value} className="flex items-center justify-between">
                            <span className="text-ink-700">{cat.label}</span>
                            {lv ? (
                              <span className="chip-brand">{lv.charAt(0) + lv.slice(1).toLowerCase()}</span>
                            ) : (
                              <span className="text-xs text-ink-400">—</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                );
              })}
            </CompareRow>

            <CompareRow label="GMP experience">
              {ordered.map((v) => (
                <td key={v.id} className="border-b border-ink-100 bg-white p-4 align-top">
                  {v.gmpExperience ? (
                    <span className="chip-brand">Yes · {v.gmpYears ?? '—'} yrs</span>
                  ) : (
                    <span className="chip text-ink-500">No</span>
                  )}
                </td>
              ))}
            </CompareRow>

            <CompareRow label="Headcount">
              {ordered.map((v) => (
                <td key={v.id} className="border-b border-ink-100 bg-white p-4 align-top">
                  {v.headcount ? v.headcount.toLocaleString() : '—'}
                </td>
              ))}
            </CompareRow>

            <CompareRow label="Sectors">
              {ordered.map((v) => (
                <td key={v.id} className="border-b border-ink-100 bg-white p-4 align-top">
                  <div className="flex flex-wrap gap-1.5">
                    {v.sectors.length === 0 ? (
                      <span className="text-ink-400">—</span>
                    ) : (
                      v.sectors.map((s) => <span key={s} className="chip">{s}</span>)
                    )}
                  </div>
                </td>
              ))}
            </CompareRow>

            <CompareRow label="Regions">
              {ordered.map((v) => (
                <td key={v.id} className="border-b border-ink-100 bg-white p-4 align-top">
                  <div className="flex flex-wrap gap-1.5">
                    {v.regions.length === 0 ? (
                      <span className="text-ink-400">—</span>
                    ) : (
                      v.regions.map((r) => <span key={r} className="chip">{r}</span>)
                    )}
                  </div>
                </td>
              ))}
            </CompareRow>

            <CompareRow label="Availability">
              {ordered.map((v) => (
                <td key={v.id} className="border-b border-ink-100 bg-white p-4 align-top">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="chip-brand">Available · {v.availableCapacity.toLowerCase()}</span>
                    <span className="chip">Workload · {v.currentWorkload.toLowerCase()}</span>
                  </div>
                </td>
              ))}
            </CompareRow>

            <CompareRow label="Certifications">
              {ordered.map((v) => (
                <td key={v.id} className="border-b border-ink-100 bg-white p-4 align-top">
                  <div className="flex flex-wrap gap-1.5">
                    {v.certifications.length === 0 ? (
                      <span className="text-ink-400">—</span>
                    ) : (
                      v.certifications.map((c) => <span key={c.id} className="chip">{c.name}</span>)
                    )}
                  </div>
                </td>
              ))}
            </CompareRow>

            <CompareRow label="Project track record">
              {ordered.map((v) => {
                const gmp = v.projects.filter((p) => p.isGmp).length;
                return (
                  <td key={v.id} className="border-b border-ink-100 bg-white p-4 align-top">
                    <div className="text-sm text-ink-700">
                      <div>
                        <strong>{v.projects.length}</strong> projects · <strong>{gmp}</strong> GMP
                      </div>
                      <ul className="mt-1 space-y-0.5 text-xs text-ink-500">
                        {v.projects.slice(0, 3).map((p) => (
                          <li key={p.id} className="truncate">
                            {p.name} {p.year ? `(${p.year})` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </td>
                );
              })}
            </CompareRow>
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4 text-sm text-ink-600">
        <span className="font-semibold text-ink-900">Quick read:</span>
        <span>Best overall:</span>
        {(() => {
          const best = [...ordered].sort((a, b) => b.vqiScore - a.vqiScore)[0];
          return (
            <span className="inline-flex items-center gap-2">
              <strong>{best.companyName}</strong>
              <ScoreBadge score={best.vqiScore} size="sm" />
            </span>
          );
        })()}
      </div>
    </div>
  );
}

function CompareRow({
  label,
  children,
  sticky,
}: {
  label: string;
  children: React.ReactNode;
  sticky?: boolean;
}) {
  return (
    <tr>
      <th
        className={`sticky left-0 z-10 bg-ink-50 px-4 py-3 text-left align-top text-xs font-semibold uppercase tracking-wider text-ink-500 ${
          sticky ? 'border-b border-ink-100' : 'border-b border-ink-100'
        }`}
      >
        {label}
      </th>
      {children}
    </tr>
  );
}

function ScoreCell({ score }: { score: number }) {
  return (
    <td className="border-b border-ink-100 bg-white p-4 align-top">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-ink-900">{score}</span>
        <ScoreBadge score={score} size="sm" />
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-200">
        <div className="h-full bg-brand-500" style={{ width: `${score}%` }} />
      </div>
    </td>
  );
}
