<div align="center">

# TipTop

### The credibility layer for capital projects.

#### A B2B SaaS platform for vendor prequalification, scoring and shortlisting in regulated industries.

A working B2B SaaS platform for the regulated industries that still run vendor prequalification on spreadsheets, PDFs, and email chains. Built end-to-end (design, data model, scoring engine, and product surface) as a real, shippable B2B SaaS product for early pilot clients, vendor onboarding, and investor demos.

![Landing](docs/01-landing.png)

</div>

---

## The problem this B2B SaaS platform solves

When a pharmaceutical EPCM team needs a cleanroom contractor, or a biotech CDMO needs an automation specialist, the search starts in Excel and ends in someone's inbox. Capabilities go undeclared. Certifications expire quietly. Two procurement managers shortlist the same vendor twice and neither knows it. The cost is real: missed timelines, repeated audits, projects that drift from "ready" to "rebid."

**TipTop replaces that workflow with a single, structured B2B SaaS credibility layer.** One place where vendors prequalify themselves once, a transparent rule-based score makes them comparable, and procurement clients can search, shortlist and side-by-side a network they actually trust. It is a vertical B2B SaaS for regulated capital projects, not a generic directory.

---

## What this B2B SaaS does

### A guided PQQ that vendors actually finish

Six prequalification sections (Company, Organisation, Capabilities, Projects, Quality and Capacity) collapse into one wizard with auto-save, per-step validation, and a *preview-as-client* mode so vendors see exactly how their profile will land before they publish. The kind of multi-step form B2B SaaS lives or dies on.

![PQQ wizard](docs/10-pqq-wizard.png)

### A score, not a guess

The Vendor Quality Index breaks credibility into four pillars (Capability, Capacity, Compliance, Output) weighted for the realities of capital-project delivery. Recomputed on every save. Transparent enough to defend in a procurement meeting. A purpose-built scoring engine, not the kind of black-box ranking generic B2B SaaS tools offer.

![Vendor profile detail with VQI breakdown](docs/06-vendor-detail.png)

### A network you can actually search

Filter by discipline, capability, region, GMP experience and score range. Results stream in under a quarter-second. The sidebar respects every filter the brief asked for, and remembers them. Search & filter UX is the heart of any data-heavy B2B SaaS, and this one treats it that way.

![Vendor browse](docs/05-vendor-browse.png)

### Three vendors, side-by-side, in one read

Pick up to three vendors and see scores, capability depth, certifications, capacity and project history laid out as a single comparable table. The difference between a 30-minute procurement meeting and a 2-line answer. Comparison features sell B2B SaaS contracts; this is one done properly.

![Side-by-side comparison](docs/07-compare.png)

### A B2B SaaS dashboard built for procurement, not engineers

Live-vendor counts. Average VQI. GMP coverage. Network capability matrix. The shortlist they saved last Tuesday. All in one screen, with the kind of at-a-glance numbers that make a B2B SaaS dashboard feel like a tool, not a homework assignment.

![Client dashboard](docs/04-client-dashboard.png)

### Vendor-side feedback that earns the time spent

A vendor lands in their workspace and sees a live VQI, a visual completion tracker, and the next-best section to finish. The wizard is short. The reward is immediate. Two-sided B2B SaaS only works when both sides feel served, and the vendor side here was designed with the same care as the client side.

![Vendor overview](docs/09-vendor-overview.png)

### A polished B2B SaaS sign-in experience

A 2-thirds image / 1-third form auth split that fits in 720&nbsp;px without scrolling, switches to a clean mobile column under `md`, and still looks like it belongs to the rest of the product. The auth flow on most B2B SaaS products is forgettable. This one is not.

![Sign in](docs/02-auth-login.png)

### A user profile that respects the basics

Avatars (uploaded, resized client-side, or pasted as a URL), name, email, role, and a current-password-gated password change. The avatar dropdown shows you who you are; the profile page lets you change it. Small details, but they are what separates a serious B2B SaaS from a prototype.

![Profile](docs/11-profile.png)

---

## Built for

This B2B SaaS is purpose-built for:

- Pharmaceutical, biotech and life-sciences procurement teams
- EPCM and project-management consultancies
- CDMOs and CMOs
- Cell & gene therapy build-outs and capacity expansions
- Medical-device manufacturers running an Annex 1 program
- Any regulated industrial that has ever lost a Friday to chasing a vendor's quality systems list

If you have ever evaluated B2B SaaS for procurement, supplier management, or capital-project delivery and walked away because nothing was vertical enough, TipTop is the answer.

---

## What it's made of

`Next.js 14` · `TypeScript` · `TailwindCSS` · `Prisma` · `PostgreSQL` (Supabase) · `Zod` · `JWT auth (jose + bcrypt)`

A modern, serverless-friendly B2B SaaS stack chosen for shippable speed without giving up the structure regulated industries need: typed forms, indexable filters, a documented scoring engine, and a database schema that belongs in production, not a prototype. The same stack scales from a pilot deployment to a multi-tenant B2B SaaS without rewrites.

---

## What "real working B2B SaaS" means here

This isn't a Figma board with hover states. It is a working B2B SaaS prototype on day one.

- Vendors can register, sign in, fill the PQQ, save drafts, publish, preview-as-client, edit and unpublish.
- Clients can register, search across the live network, filter by every dimension the brief specified, save a shortlist, compare three side-by-side, and review a full vendor profile.
- The VQI score is computed live from real inputs and stored on the row, so the search query that powers the filter slider is a single indexed `WHERE`, fast at the scale a real B2B SaaS deployment needs.
- The design system (dark navy base, glass surfaces, single brand accent) is consistent across the landing page, two authenticated workspaces, the auth split-screen, and the profile area, the kind of cohesion that signals a serious B2B SaaS.
- Every form auto-saves. Every step validates. Every error has a place to live.
- Eight realistic European pharma/biotech vendors ship with the seed so the demo is alive on first launch, not a screen full of empty states.

---

## Looking for similar B2B SaaS work?

I build polished, production-grade B2B SaaS platforms for early-stage and pilot-ready teams. Typical stack: Next.js, TypeScript, Tailwind, Prisma, Supabase, Postgres. Strong with structured-data B2B SaaS products, scoring and ranking systems, multi-step wizards, search and filter UX, dual-sided marketplaces, and design systems that hold together from a B2B SaaS landing page all the way through to the authenticated dashboard.

If you are commissioning a B2B SaaS vendor portal, a procurement B2B SaaS, a credibility network, an internal admin, an investor-ready B2B SaaS MVP, or a polish pass on a B2B SaaS that is nearly there, let's talk.

**Reach me on Upwork.**
