import { ScoreRing } from '@/components/ui/ScoreBadge';
import { CAPABILITY_CATEGORIES } from '@/lib/constants';
import type {
  Capability,
  Certification,
  Location,
  Project,
  VendorProfile,
} from '@prisma/client';

export type VendorWithDetail = VendorProfile & {
  locations: Location[];
  capabilities: Capability[];
  projects: Project[];
  certifications: Certification[];
};

/**
 * Read-only public profile view shared by client detail page and vendor
 * preview-as-client view.
 */
export function VendorProfileView({
  vendor,
  actions,
}: {
  vendor: VendorWithDetail;
  actions?: React.ReactNode;
}) {
  const capabilityMap = new Map(vendor.capabilities.map((c) => [c.category, c]));
  const hq = vendor.locations.find((l) => l.isHeadquarters) ?? vendor.locations[0];

  return (
    <div className="space-y-8">
      <header className="card p-6 lg:p-8">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {vendor.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vendor.logoUrl}
                alt={`${vendor.companyName} logo`}
                className="h-14 w-14 rounded-xl border border-ink-100 object-contain bg-white p-1"
              />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-brand-50 text-base font-semibold text-brand-700">
                {vendor.companyName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-ink-950">
                {vendor.companyName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                {hq && (
                  <span className="chip">
                    {hq.city}, {hq.country}
                  </span>
                )}
                {vendor.yearFounded && <span className="chip">Since {vendor.yearFounded}</span>}
                {vendor.headcount && (
                  <span className="chip">{vendor.headcount.toLocaleString()} staff</span>
                )}
                {vendor.gmpExperience && (
                  <span className="chip-brand">GMP · {vendor.gmpYears ?? '—'} yrs</span>
                )}
                {vendor.websiteUrl && (
                  <a
                    href={vendor.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chip hover:bg-ink-100"
                  >
                    Website ↗
                  </a>
                )}
              </div>
              {vendor.description && (
                <p className="mt-3 max-w-2xl text-sm text-ink-600">{vendor.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ScoreRing score={vendor.vqiScore} size={120} />
            {actions}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Capability', value: vendor.scoreCapability },
            { label: 'Capacity', value: vendor.scoreCapacity },
            { label: 'Compliance', value: vendor.scoreCompliance },
            { label: 'Output', value: vendor.scoreOutput },
          ].map((p) => (
            <div key={p.label} className="rounded-xl border border-ink-100 bg-ink-50/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-ink-500">
                  {p.label}
                </span>
                <span className="text-base font-semibold text-ink-900">{p.value}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-200">
                <div className="h-full bg-brand-500" style={{ width: `${p.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-base font-semibold text-ink-900">Technical capabilities</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {CAPABILITY_CATEGORIES.map((cat) => {
              const c = capabilityMap.get(cat.value);
              return (
                <div
                  key={cat.value}
                  className="flex items-center justify-between rounded-xl border border-ink-100 bg-white p-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-ink-900">{cat.label}</div>
                    <div className="text-xs text-ink-500">{cat.description}</div>
                  </div>
                  {c ? (
                    <span className="chip-brand">
                      {c.level.charAt(0) + c.level.slice(1).toLowerCase()}
                    </span>
                  ) : (
                    <span className="chip text-ink-400">—</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-base font-semibold text-ink-900">Capacity</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-700">
            <li className="flex items-center justify-between">
              <span>Current workload</span>
              <span className="chip">{vendor.currentWorkload.toLowerCase()}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Available capacity</span>
              <span className="chip-brand">{vendor.availableCapacity.toLowerCase()}</span>
            </li>
            {vendor.availableFromMonths !== null && (
              <li className="flex items-center justify-between">
                <span>Available within</span>
                <span className="chip">{vendor.availableFromMonths} months</span>
              </li>
            )}
            <li>
              <div className="text-xs uppercase tracking-wider text-ink-500">Regions</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {vendor.regions.length === 0 ? (
                  <span className="text-ink-400">—</span>
                ) : (
                  vendor.regions.map((r) => (
                    <span key={r} className="chip">
                      {r}
                    </span>
                  ))
                )}
              </div>
            </li>
            <li>
              <div className="text-xs uppercase tracking-wider text-ink-500">Sectors</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {vendor.sectors.length === 0 ? (
                  <span className="text-ink-400">—</span>
                ) : (
                  vendor.sectors.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))
                )}
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-ink-900">Project experience</h3>
          {vendor.projects.length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">No projects published.</p>
          ) : (
            <ul className="mt-3 divide-y divide-ink-100">
              {[...vendor.projects]
                .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
                .map((p) => (
                  <li key={p.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-ink-900">{p.name}</div>
                      <div className="flex items-center gap-1">
                        {p.isGmp && <span className="chip-brand">GMP</span>}
                        {p.valueRange && <span className="chip">{p.valueRange}</span>}
                      </div>
                    </div>
                    <div className="mt-0.5 text-xs text-ink-500">
                      {[p.client, p.projectType, p.sector, p.year].filter(Boolean).join(' · ')}
                    </div>
                    {p.scopeDelivered && (
                      <p className="mt-1 text-sm text-ink-600">{p.scopeDelivered}</p>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-ink-900">Quality & compliance</h3>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-500">Quality systems</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {vendor.qualitySystems.length === 0 ? (
                  <span className="text-ink-500">—</span>
                ) : (
                  vendor.qualitySystems.map((q) => (
                    <span key={q} className="chip">
                      {q}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-500">Certifications</div>
              <div className="mt-1 space-y-1">
                {vendor.certifications.length === 0 ? (
                  <span className="text-ink-500">—</span>
                ) : (
                  vendor.certifications.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border border-ink-100 bg-white px-3 py-2"
                    >
                      <div>
                        <div className="text-sm font-medium text-ink-900">{c.name}</div>
                        <div className="text-xs text-ink-500">
                          {[
                            c.issuer,
                            c.issuedYear,
                            c.expiresYear ? `Expires ${c.expiresYear}` : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      </div>
                      {c.reference && <span className="chip text-ink-500">{c.reference}</span>}
                    </div>
                  ))
                )}
              </div>
            </div>
            {vendor.auditHistory && (
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-500">Audit history</div>
                <p className="mt-1 text-ink-700">{vendor.auditHistory}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
