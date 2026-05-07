import { Logo } from '@/components/ui/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden">
      <div className="flex h-full flex-col md:flex-row">
        {/* Left 2/3: image panel — hidden on small screens to keep the form fully visible */}
        <aside className="relative hidden md:block md:w-2/3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1748349221526-33b51820b21e?w=1800&q=80&auto=format&fit=crop"
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover brightness-[0.45] saturate-[0.85]"
          />
          <div className="absolute inset-0 bg-[#0c1838]/60" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0c1838] via-[#0c1838]/40 to-transparent" />

          <div className="relative flex h-full flex-col justify-between p-8 lg:p-14">
            <Logo />

            <div className="max-w-lg">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-medium text-ink-800 backdrop-blur-md">
                <span className="live-dot" />
                Swiss-built · Pharma & biotech ready
              </span>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white lg:text-4xl">
                The credibility layer for{' '}
                <span className="text-brand-300">capital projects.</span>
              </h2>
              <p className="mt-3 max-w-md text-sm text-white/70 lg:text-base">
                A structured, scored, searchable network of verified suppliers — built for
                regulated pharma, biotech and complex capital projects.
              </p>
              <ul className="mt-5 grid grid-cols-3 gap-4 text-xs">
                {[
                  { v: '7', l: 'Disciplines' },
                  { v: '6', l: 'PQQ sections' },
                  { v: '4', l: 'Score pillars' },
                ].map((s) => (
                  <li key={s.l} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-md">
                    <div className="text-lg font-semibold text-white">{s.v}</div>
                    <div className="text-[10px] uppercase tracking-wider text-white/55">{s.l}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-white/45">
              © {new Date().getFullYear()} TipTop · Built in Switzerland
            </div>
          </div>
        </aside>

        {/* Right 1/3: form panel */}
        <main className="relative flex h-full w-full flex-col md:w-1/3">
          {/* Mobile logo bar (md hides because the image panel carries the brand on desktop) */}
          <div className="border-b border-white/10 px-6 py-4 md:hidden">
            <Logo />
          </div>
          <div className="flex flex-1 items-center justify-center px-6 py-6 md:px-10">
            <div className="w-full max-w-sm">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
