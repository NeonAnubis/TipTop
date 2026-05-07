import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { getSession } from '@/lib/auth';

export default async function LandingPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === 'VENDOR' ? '/vendor' : '/client');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-brand-50/40 to-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost">Sign in</Link>
          <Link href="/register" className="btn-primary">Get started</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-12 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="chip-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Swiss-built · Pharma & biotech ready
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl lg:text-6xl">
              Vendor credibility,<br />
              <span className="bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
                ready before you ask.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-600">
              TipTop replaces fragmented prequalification spreadsheets, PDFs and email chains with a
              structured, searchable network of verified suppliers — built for regulated capital
              projects.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register?role=VENDOR" className="btn-primary">
                List your company
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/register?role=CLIENT" className="btn-secondary">
                Browse vendors
              </Link>
            </div>
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-ink-100 pt-8">
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink-500">Disciplines</dt>
                <dd className="mt-1 text-2xl font-semibold text-ink-900">7</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink-500">PQQ sections</dt>
                <dd className="mt-1 text-2xl font-semibold text-ink-900">6</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink-500">Score pillars</dt>
                <dd className="mt-1 text-2xl font-semibold text-ink-900">4</dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="card relative overflow-hidden p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-ink-500">Vendor Quality Index</div>
                  <div className="mt-1 text-2xl font-semibold text-ink-900">Helvetica Engineering AG</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-ink-500">
                    <span className="chip">Zürich · CH</span>
                    <span className="chip">Pharma</span>
                    <span className="chip">GMP</span>
                  </div>
                </div>
                <div className="grid h-20 w-20 place-items-center rounded-2xl border border-emerald-200 bg-emerald-50">
                  <div className="text-2xl font-semibold text-emerald-700">87</div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Capability', value: 92 },
                  { label: 'Capacity', value: 75 },
                  { label: 'Compliance', value: 95 },
                  { label: 'Output', value: 84 },
                ].map((p) => (
                  <div key={p.label} className="rounded-xl border border-ink-100 bg-ink-50/60 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink-700">{p.label}</span>
                      <span className="font-semibold text-ink-900">{p.value}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-200">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${p.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-ink-100 bg-white p-4">
                <div className="text-xs uppercase tracking-wider text-ink-500">Capabilities</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['HVAC · Expert', 'Cleanroom · Advanced', 'CSA · Advanced', 'Automation · Intermediate'].map(
                    (c) => (
                      <span key={c} className="chip-brand">{c}</span>
                    ),
                  )}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden lg:block">
              <div className="card w-64 p-4">
                <div className="text-xs uppercase tracking-wider text-ink-500">Compare</div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <div className="grid h-7 w-7 place-items-center rounded-md bg-brand-50 text-brand-700">A</div>
                  <span className="font-medium">vs</span>
                  <div className="grid h-7 w-7 place-items-center rounded-md bg-emerald-50 text-emerald-700">B</div>
                </div>
                <div className="mt-3 text-xs text-ink-500">Side-by-side capability, capacity & compliance.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-ink-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-3">
          {[
            {
              title: 'Structured PQQ in one wizard',
              description:
                'Six guided sections — company, organisation, technical capabilities, project experience, quality and capacity — replace pages of legacy questionnaires.',
            },
            {
              title: 'A score, not a guess',
              description:
                'The Vendor Quality Index converts every answer into a four-pillar credibility score that is recomputed live as profiles evolve.',
            },
            {
              title: 'Find the right partner faster',
              description:
                'Filter by discipline, GMP experience, region and score range. Shortlist and compare vendors side-by-side in a single click.',
            },
          ].map((f) => (
            <div key={f.title}>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-600">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-sm text-ink-500">
          <Logo />
          <div>© {new Date().getFullYear()} TipTop · Built in Switzerland</div>
        </div>
      </footer>
    </div>
  );
}
