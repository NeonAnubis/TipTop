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
    <div className="overflow-hidden">
      <Header />
      <Hero />
      <LogoStrip />
      <Bento />
      <HowItWorks />
      <CompareTeaser />
      <FinalCta />
      <Footer />
    </div>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-midnight-800/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-ink-600 md:flex">
            <a href="#product" className="transition hover:text-ink-900">Product</a>
            <a href="#how" className="transition hover:text-ink-900">How it works</a>
            <a href="#vqi" className="transition hover:text-ink-900">VQI</a>
            <a href="#vendors" className="transition hover:text-ink-900">For vendors</a>
          </nav>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost">Sign in</Link>
          <Link href="/register" className="btn-primary group">
            Get started
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition group-hover:translate-x-0.5">
              <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Background layers — bottom-up:
          1. Photographic backdrop (real pharmaceutical cleanroom) from Unsplash
          2. Brand-tinted gradient overlay (kills glare, adds depth)
          3. Heavy white-to-transparent veil so foreground text remains highly legible
          4. Subtle dot grid for tech texture
          5. Top fade so the sticky header sits cleanly */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1748002388689-c62b45d5c28b?w=2400&q=80&auto=format&fit=crop"
        alt=""
        aria-hidden="true"
        loading="eager"
        fetchPriority="high"
        className="pointer-events-none absolute inset-0 -z-30 h-full w-full object-cover object-center brightness-[0.30] saturate-[0.7]"
      />
      <div className="absolute inset-0 -z-20 bg-[#0c1838]/85" />
      <div className="dot-grid mask-fade-bottom absolute inset-0 -z-10 opacity-40" />

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 lg:pb-32 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-medium text-ink-800 shadow-soft backdrop-blur-md">
              <span className="live-dot" />
              Swiss-built · Pharma & biotech ready
            </span>
            <h1 className="mt-6 text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.02em] text-ink-950 sm:text-6xl lg:text-[4.25rem]">
              The credibility layer<br />
              for{' '}
              <span className="text-brand-300">capital projects.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-600 sm:text-lg">
              TipTop replaces fragmented prequalification spreadsheets, PDFs and email chains with a
              structured, scored, searchable network of verified suppliers — built for regulated
              pharma, biotech and complex capital projects.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register?role=VENDOR" className="btn-primary group px-5 py-2.5 text-sm">
                List your company
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition group-hover:translate-x-0.5">
                  <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/register?role=CLIENT" className="btn-secondary px-5 py-2.5 text-sm">
                Browse the network
              </Link>
              <Link href="#how" className="btn-ghost px-3 py-2.5 text-sm">
                How it works ↓
              </Link>
            </div>

            <ul className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-8 text-sm">
              {[
                { value: '7', label: 'Disciplines', detail: 'CSA → Automation' },
                { value: '6', label: 'PQQ sections', detail: 'Single-pass wizard' },
                { value: '4', label: 'Score pillars', detail: '/100 VQI index' },
              ].map((stat) => (
                <li key={stat.label}>
                  <div className="text-3xl font-semibold tracking-tight text-ink-950">{stat.value}</div>
                  <div className="text-xs uppercase tracking-wider text-ink-500">{stat.label}</div>
                  <div className="mt-0.5 text-xs text-ink-500">{stat.detail}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Hero visual */}
          <div className="relative h-full min-h-[520px]">
            <HeroDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroDashboard() {
  const pillars = [
    { label: 'Capability', value: 92 },
    { label: 'Capacity', value: 75 },
    { label: 'Compliance', value: 95 },
    { label: 'Output', value: 84 },
  ];

  return (
    <div className="relative h-full">
      {/* Main vendor card */}
      <div className="border-gradient relative z-10 rounded-3xl bg-white/[0.05] p-6 shadow-card backdrop-blur-xl lg:absolute lg:right-0 lg:top-2 lg:w-[460px]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
              <span className="live-dot" />
              Live profile · VQI score
            </div>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink-950">
              Helvetica Engineering AG
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="chip">Zürich · CH</span>
              <span className="chip">Pharma</span>
              <span className="chip-brand">GMP · 22 yrs</span>
            </div>
          </div>
          <div className="relative">
            <ScorePill score={87} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {pillars.map((p, i) => (
            <div
              key={p.label}
              className="rounded-xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-md animate-slide-up"
              style={{ animationDelay: `${100 + i * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-700">{p.label}</span>
                <span className="text-sm font-semibold tabular-nums text-ink-950">{p.value}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full origin-left rounded-full bg-brand-500 animate-grow-bar"
                  style={{ ['--target' as string]: p.value / 100, width: `${p.value}%`, animationDelay: `${200 + i * 80}ms` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
            <span>Capabilities</span>
            <span className="text-ink-400">7 of 7 declared</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              'HVAC · Expert',
              'Cleanroom · Expert',
              'CSA · Advanced',
              'Mechanical · Expert',
              'Automation · Intermediate',
            ].map((c) => (
              <span key={c} className="chip-brand">{c}</span>
            ))}
            <span className="chip text-ink-500">+2</span>
          </div>
        </div>
      </div>

      {/* Floating compare card */}
      <div className="absolute -bottom-6 left-0 z-20 w-72 animate-float-slow rounded-2xl border border-white/15 bg-white/[0.07] p-4 shadow-card backdrop-blur-xl lg:left-2">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
          <span>Side-by-side</span>
          <span className="text-emerald-600">+ Match</span>
        </div>
        <div className="mt-3 grid grid-cols-3 items-center gap-2 text-sm">
          <div className="flex flex-col items-center">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500/20 text-xs font-semibold text-brand-200 ring-1 ring-brand-400/30">A</div>
            <span className="mt-1 text-[11px] font-medium text-ink-700">87</span>
          </div>
          <div className="flex justify-center text-xs text-ink-500">vs</div>
          <div className="flex flex-col items-center">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/20 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">B</div>
            <span className="mt-1 text-[11px] font-medium text-ink-700">71</span>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          {[
            { l: 'Capability', a: 92, b: 83 },
            { l: 'Capacity', a: 75, b: 85 },
            { l: 'Compliance', a: 95, b: 80 },
          ].map((row) => (
            <div key={row.l} className="text-[11px]">
              <div className="flex items-center justify-between text-ink-600">
                <span>{row.l}</span>
                <span className="tabular-nums text-ink-700">{row.a} / {row.b}</span>
              </div>
              <div className="mt-1 flex h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-brand-400" style={{ width: `${row.a / 2}%` }} />
                <div className="h-full bg-emerald-400" style={{ width: `${row.b / 2}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating capability radar */}
      <div className="absolute -right-2 top-[420px] z-0 hidden w-60 animate-float rounded-2xl border border-white/15 bg-white/[0.07] p-4 shadow-card backdrop-blur-xl lg:block">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
          Discipline depth
        </div>
        <DisciplineRadar />
      </div>
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative grid h-20 w-20 place-items-center">
      <svg className="-rotate-90" width="70" height="70" viewBox="0 0 70 70">
        <circle cx="35" cy="35" r={r} stroke="rgba(255,255,255,0.10)" strokeWidth="6" fill="none" />
        <circle
          cx="35"
          cy="35"
          r={r}
          stroke="#34d399"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-semibold leading-none text-ink-950">{score}</div>
        <div className="mt-0.5 text-[9px] uppercase tracking-wider text-emerald-300">Excellent</div>
      </div>
    </div>
  );
}

function DisciplineRadar() {
  // Hexagon radar: 6 axes, with the polygon shape based on level values.
  const axes = ['CSA', 'HVAC', 'CRM', 'MECH', 'AUTO', 'EQP'];
  const values = [0.7, 0.95, 0.95, 0.92, 0.55, 0.78];
  const cx = 75;
  const cy = 75;
  const r = 56;
  const points = values
    .map((v, i) => {
      const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
      return [cx + Math.cos(angle) * r * v, cy + Math.sin(angle) * r * v].join(',');
    })
    .join(' ');
  const grid = [0.33, 0.66, 1].map((g) => {
    return values
      .map((_, i) => {
        const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
        return [cx + Math.cos(angle) * r * g, cy + Math.sin(angle) * r * g].join(',');
      })
      .join(' ');
  });
  return (
    <svg viewBox="0 0 150 150" className="mt-2 w-full">
      {grid.map((g, i) => (
        <polygon key={i} points={g} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
      ))}
      <polygon points={points} fill="rgba(106, 142, 255, 0.30)" stroke="#6b8eff" strokeWidth="1.5" />
      {axes.map((a, i) => {
        const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
        const x = cx + Math.cos(angle) * (r + 12);
        const y = cy + Math.sin(angle) * (r + 12);
        return (
          <text
            key={a}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink-500 text-[9px] font-medium"
          >
            {a}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Logo strip / social proof ─────────────────────────────────────────────

function LogoStrip() {
  const logos = [
    'MERIDIAN PHARMA',
    'ZÜRICH BIOTECH',
    'ALPINEX LABS',
    'HELION CDMO',
    'NORDIC GENOME',
    'VALAIS THERAPEUTICS',
    'KAPELL VACCINES',
    'OBERLAND SCIENCES',
  ];
  return (
    <section className="border-y border-white/10 bg-midnight-800/40 py-10 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
          Built for procurement teams at regulated industrials
        </div>
        <div className="mask-fade-edges relative mt-6 overflow-hidden">
          <div className="animate-ticker flex w-max gap-12 whitespace-nowrap text-base font-semibold tracking-[0.14em] text-ink-400/60">
            {[...logos, ...logos].map((l, i) => (
              <span key={i} className="select-none">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Bento product grid ───────────────────────────────────────────────────

function Bento() {
  return (
    <section id="product" className="relative py-24 lg:py-28">
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-white/10" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip-brand mx-auto">Product</span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl">
            Everything procurement runs on,<br className="hidden sm:block" />{' '}
            <span className="text-brand-300">in one place.</span>
          </h2>
          <p className="mt-4 text-base text-ink-600">
            A structured PQQ replaces the spreadsheet. A live VQI replaces the gut feel. Search,
            shortlist and side-by-side compare replace the email chain.
          </p>
        </div>

        <div className="mt-14 grid auto-rows-[160px] grid-cols-1 gap-4 md:grid-cols-6">
          <BentoCard className="md:col-span-4 md:row-span-2" id="vqi">
            <div className="flex h-full flex-col">
              <div>
                <span className="chip-brand">VQI engine</span>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink-950">
                  A score, not a guess.
                </h3>
                <p className="mt-2 max-w-md text-sm text-ink-600">
                  Every PQQ answer flows into a four-pillar credibility index. Recomputed on save,
                  weighted for capital-project relevance.
                </p>
              </div>
              <div className="mt-auto grid grid-cols-4 gap-3 pt-6">
                {[
                  { l: 'Capability', v: 92 },
                  { l: 'Capacity', v: 75 },
                  { l: 'Compliance', v: 95 },
                  { l: 'Output', v: 84 },
                ].map((p, i) => (
                  <div key={p.l}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-ink-500">{p.l}</span>
                      <span className="text-sm font-semibold tabular-nums text-ink-900">{p.v}</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full origin-left rounded-full bg-brand-500 animate-grow-bar"
                        style={{ ['--target' as string]: p.v / 100, width: `${p.v}%`, animationDelay: `${i * 100}ms` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-2 md:row-span-2">
            <span className="chip-brand">PQQ wizard</span>
            <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink-950">
              Six sections, one pass.
            </h3>
            <p className="mt-1 text-sm text-ink-600">Auto-save keeps every keystroke.</p>
            <div className="mt-4 space-y-1.5">
              {[
                { l: 'Company', done: true },
                { l: 'Organisation', done: true },
                { l: 'Capabilities', done: true },
                { l: 'Projects', done: true },
                { l: 'Quality', active: true },
                { l: 'Capacity', done: false },
              ].map((s) => (
                <div
                  key={s.l}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                    s.active ? 'bg-brand-500/15 text-brand-100 ring-1 ring-brand-400/40' : 'text-ink-700'
                  }`}
                >
                  <span
                    className={`grid h-4 w-4 place-items-center rounded-full text-[9px] ${
                      s.done
                        ? 'bg-emerald-500 text-white'
                        : s.active
                          ? 'bg-brand-500 text-white'
                          : 'border border-white/15 bg-white/[0.05] text-ink-500'
                    }`}
                  >
                    {s.done ? '✓' : s.active ? '•' : ''}
                  </span>
                  {s.l}
                </div>
              ))}
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-3 md:row-span-2">
            <span className="chip-brand">Search & filter</span>
            <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink-950">
              Find the partner in seconds.
            </h3>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-ink-500 shadow-soft backdrop-blur-md">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <span className="text-ink-700">cleanroom · GMP · DACH</span>
              <span className="ml-auto rounded border border-white/15 px-1 text-[10px] text-ink-500">⌘K</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['HVAC', 'Cleanroom', 'Validation', 'GMP only', 'VQI ≥ 70', 'EU – DACH'].map((c, i) => (
                <span
                  key={c}
                  className={
                    i < 3
                      ? 'rounded-full border border-brand-500 bg-brand-500 px-2.5 py-1 text-xs font-medium text-white'
                      : 'chip'
                  }
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-ink-500">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2 backdrop-blur-md">
                <div className="text-base font-semibold text-ink-900">8</div>
                Vendors
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2 backdrop-blur-md">
                <div className="text-base font-semibold text-ink-900">6</div>
                GMP-ready
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2 backdrop-blur-md">
                <div className="text-base font-semibold text-emerald-300">73</div>
                Avg VQI
              </div>
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-3 md:row-span-2">
            <span className="chip-brand">Comparison</span>
            <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink-950">
              Read three vendors at once.
            </h3>
            <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
              <div className="grid grid-cols-3 gap-px bg-white/10">
                {['Helvetica', 'Nordbau', 'Axis'].map((n, i) => (
                  <div key={n} className="bg-white/[0.04] p-3 backdrop-blur-md">
                    <div className="text-xs font-medium text-ink-700">{n}</div>
                    <div className="mt-1 text-xl font-semibold text-ink-950">{[81, 71, 73][i]}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-px bg-white/10">
                {['Capability', 'Capacity', 'Compliance'].map((row, ri) => (
                  <div key={row} className="bg-white/[0.04] p-3 backdrop-blur-md">
                    <div className="text-[10px] uppercase tracking-wider text-ink-500">{row}</div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full bg-brand-400" style={{ width: `${[85, 63, 90][ri]}%` }} />
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full bg-brand-300" style={{ width: `${[83, 85, 80][ri]}%` }} />
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full bg-brand-500" style={{ width: `${[71, 72, 80][ri]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-soft backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-card ${
        className ?? ''
      }`}
    >
      <div className="relative h-full">{children}</div>
    </div>
  );
}

// ─── How it works ──────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Vendors prequalify themselves',
      copy: 'A guided six-section PQQ replaces every Excel template. Auto-save, in-line validation, and a sharable preview.',
      side: 'Vendor side',
    },
    {
      n: '02',
      title: 'The VQI engine scores them',
      copy: 'Capability, Capacity, Compliance and Output — weighted, transparent, and recomputed on every save.',
      side: 'Score',
    },
    {
      n: '03',
      title: 'Clients search, shortlist & compare',
      copy: 'Filter by discipline, GMP, region or score. Save favourites and read three vendors side-by-side.',
      side: 'Client side',
    },
  ];
  return (
    <section id="how" className="relative py-24 lg:py-28">
      <div className="dot-grid-dark absolute inset-0 -z-10 opacity-30" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-ink-700 backdrop-blur">
            How it works
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl">
            From spreadsheet to <span className="text-brand-300">shortlist</span> in three steps.
          </h2>
        </div>

        <ol className="relative mt-16 grid gap-6 lg:grid-cols-3">
          {/* Connector line on desktop */}
          <div className="pointer-events-none absolute inset-x-12 top-12 hidden h-px bg-white/15 lg:block" />

          {steps.map((s, i) => (
            <li
              key={s.n}
              className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:border-white/25 hover:bg-white/[0.07]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-3xl font-semibold tracking-tight text-white/30">
                  {s.n}
                </span>
                <span className="text-[11px] uppercase tracking-[0.14em] text-ink-500">{s.side}</span>
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink-950">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.copy}</p>
              {i < steps.length - 1 && (
                <div className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#0c1838] text-ink-700 lg:flex">
                  →
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ─── Compare teaser (alternating layout) ───────────────────────────────────

function CompareTeaser() {
  return (
    <section id="vqi" className="relative py-24 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <span className="chip-brand">Vendor Quality Index</span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl">
            Transparent. Weighted. <span className="text-brand-300">Live.</span>
          </h2>
          <p className="mt-4 max-w-lg text-ink-600">
            The VQI is calculated rule-first, not AI-first. Every input — capability levels, GMP
            years, project portfolio, available capacity — has a documented weight. Vendors see
            exactly why they score what they do.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-ink-700">
            {[
              'Capability — depth × breadth across 7 disciplines (30%)',
              'Output — projects + GMP + scale (25%)',
              'Compliance — certs, quality systems, GMP years (25%)',
              'Capacity — workload headroom + region coverage (20%)',
            ].map((l) => (
              <li key={l} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l4 4L19 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {l}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="border-gradient relative rounded-3xl bg-[#0c1838]/80 p-6 text-white shadow-card backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                  Live recomputation
                </div>
                <div className="mt-1 text-base font-semibold">Helvetica Engineering AG</div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                <span className="live-dot" />
                Saving
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { l: 'Capability', from: 78, to: 92 },
                { l: 'Capacity', from: 60, to: 75 },
                { l: 'Compliance', from: 90, to: 95 },
                { l: 'Output', from: 70, to: 84 },
              ].map((p) => (
                <div key={p.l} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">{p.l}</span>
                    <span className="text-white/40 line-through">{p.from}</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tracking-tight tabular-nums">{p.to}</span>
                    <span className="text-[11px] text-emerald-300">+{p.to - p.from}</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-brand-400"
                      style={{ width: `${p.to}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-brand-500/15 p-4 ring-1 ring-white/10">
              <div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-white/50">Overall</div>
                <div className="text-3xl font-semibold tracking-tight">87 / 100</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[11px] font-medium text-emerald-300">Excellent</span>
                <svg width="38" height="38" viewBox="0 0 38 38" className="text-emerald-300">
                  <circle cx="19" cy="19" r="14" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
                  <path
                    d="M19 5 a14 14 0 1 1 -9.9 4.1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA — vendor / client split ─────────────────────────────────────

function FinalCta() {
  return (
    <section id="vendors" className="relative overflow-hidden py-24 lg:py-28">
      <div className="dot-grid absolute inset-0 -z-10 opacity-25" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip-brand mx-auto">Get started</span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl">
            Two sides. <span className="text-brand-300">One credibility network.</span>
          </h2>
          <p className="mt-4 text-ink-600">
            Free to join while in pilot. No credit card. Real working prototype.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="border-gradient group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-card backdrop-blur-xl transition hover:bg-white/[0.06]">
            <div className="relative">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                For vendors
              </div>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-ink-950">
                Get prequalified <em className="not-italic text-brand-300">once.</em>
                <br />Reused forever.
              </h3>
              <p className="mt-3 max-w-md text-ink-600">
                List your company, complete the structured PQQ, and let your VQI do the rest. Editable
                any time, visible to clients across the network.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-ink-700">
                <li className="flex items-start gap-2">
                  <span className="text-brand-600">→</span> ~10 minute structured PQQ wizard
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-600">→</span> Live VQI score with breakdown
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-600">→</span> Preview-as-client mode before publishing
                </li>
              </ul>
              <Link
                href="/register?role=VENDOR"
                className="btn-primary mt-8 inline-flex group/btn"
              >
                List your company
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition group-hover/btn:translate-x-0.5">
                  <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="border-gradient group relative overflow-hidden rounded-3xl bg-[#0c1838]/80 p-8 text-white shadow-card backdrop-blur-xl transition hover:bg-[#0c1838]/90">
            <div className="relative">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                For clients
              </div>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Find the right partner <span className="text-brand-300">faster.</span>
              </h3>
              <p className="mt-3 max-w-md text-white/70">
                Search structured PQQ data, filter by discipline, GMP and score range, shortlist
                favourites and compare three vendors side-by-side.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2"><span className="text-emerald-300">→</span> Live searchable network</li>
                <li className="flex items-start gap-2"><span className="text-emerald-300">→</span> Side-by-side comparison</li>
                <li className="flex items-start gap-2"><span className="text-emerald-300">→</span> Persistent shortlist & favourites</li>
              </ul>
              <Link
                href="/register?role=CLIENT"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-midnight-900 shadow-soft transition hover:bg-emerald-50"
              >
                Browse the network
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-midnight-900/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-ink-600">
              Swiss-built credibility intelligence for vendor prequalification across pharma,
              biotech and complex capital projects.
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-ink-700 w-fit backdrop-blur">
              <span className="grid h-4 w-5 place-items-center rounded-sm bg-red-600 text-white">
                <svg viewBox="0 0 32 32" width="9" height="9"><rect x="13" y="6" width="6" height="20" fill="white"/><rect x="6" y="13" width="20" height="6" fill="white"/></svg>
              </span>
              Crafted in Switzerland
            </div>
          </div>
          <div className="md:col-span-7 grid grid-cols-2 gap-6 sm:grid-cols-3">
            <FooterCol
              title="Product"
              links={[
                { l: 'PQQ wizard', href: '#product' },
                { l: 'VQI scoring', href: '#vqi' },
                { l: 'Search & filter', href: '#product' },
                { l: 'Comparison', href: '#product' },
              ]}
            />
            <FooterCol
              title="For"
              links={[
                { l: 'Vendors', href: '/register?role=VENDOR' },
                { l: 'Clients', href: '/register?role=CLIENT' },
                { l: 'How it works', href: '#how' },
                { l: 'Sign in', href: '/login' },
              ]}
            />
            <FooterCol
              title="Company"
              links={[
                { l: 'About', href: '#' },
                { l: 'Privacy', href: '#' },
                { l: 'Terms', href: '#' },
                { l: 'Contact', href: '#' },
              ]}
            />
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center">
          <div>© {new Date().getFullYear()} TipTop · All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { l: string; href: string }[];
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">{title}</div>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.l}>
            <Link href={link.href} className="text-ink-700 transition hover:text-ink-950">
              {link.l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
