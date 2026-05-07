# TipTop — Vendor Credibility Platform

Swiss-built credibility intelligence for vendor prequalification across pharma,
biotech, and complex capital projects. This MVP ships the full happy path:
vendor onboarding, the structured PQQ wizard, the Vendor Quality Index (VQI)
score engine, and a client side that searches, compares and shortlists
vendors.

```
┌──────────────────────────────┬─────────────────────────────────────────────┐
│ Vendor side                  │ Client side                                 │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Multi-step PQQ wizard        │ Discoverable vendor network                 │
│ A. Company information       │ Search by name / discipline / keyword       │
│ B. Organisation & resources  │ Filter by capability, sector, region, GMP   │
│ C. Technical capabilities    │ Min-score slider                            │
│ D. Project experience        │ Side-by-side comparison (up to 3 vendors)   │
│ E. Quality & compliance      │ Shortlist / favourites                      │
│ F. Capacity & availability   │ Vendor profile detail view                  │
│ Live VQI recompute on save   │                                             │
└──────────────────────────────┴─────────────────────────────────────────────┘
```

## Stack

- **Next.js 14** (App Router, React server components)
- **TypeScript** with strict mode
- **TailwindCSS** with a custom token system (`brand`, `ink`)
- **Prisma 5** ORM
- **Supabase Postgres** (uses both pooled & direct connections)
- **JWT auth** via [`jose`](https://github.com/panva/jose) + bcrypt password hashing
- **Zod** for request validation

No external state managers, no UI kits — just first-party React + Tailwind for
clarity. The app runs unmodified on Vercel + Supabase.

## VQI scoring

The Vendor Quality Index is a 4-pillar weighted score (overall = 30/25/25/20):

| Pillar     | Inputs                                                         | Weight |
| ---------- | -------------------------------------------------------------- | ------ |
| Capability | Declared capabilities, depth (level), breadth (count)          | 30%    |
| Output     | Project count, GMP project count, project value range          | 25%    |
| Compliance | Certifications, quality systems, GMP years                     | 25%    |
| Capacity   | Available capacity, current workload headroom, region coverage | 20%    |

The engine lives in [`src/lib/scoring.ts`](./src/lib/scoring.ts) and is invoked
on every PUT to `/api/vendor/profile` (writes the breakdown back to the
`VendorProfile` row).

## Project structure

```
prisma/
  schema.prisma              ← User / VendorProfile / Capability / Project / …
  seed.ts                    ← 8 realistic pharma/biotech vendors + demo client
src/
  app/
    page.tsx                 ← Landing
    (auth)/login,register    ← Auth pages (server-rendered guards)
    vendor/                  ← Vendor area (overview + PQQ wizard)
    client/                  ← Client area (browse, detail, shortlist, compare)
    api/auth/*               ← register / login / logout
    api/vendor/profile       ← GET / PUT (recomputes VQI on save)
    api/vendors              ← search & filter
    api/client/shortlist     ← POST / DELETE
  components/                ← AppHeader, Logo, ScoreBadge, Toast, EmptyState
  lib/
    prisma.ts                ← singleton client
    auth.ts                  ← jose JWT + cookie session
    scoring.ts               ← VQI engine
    constants.ts             ← capability/sector/region option lists
```

## Local setup

### 1. Clone & install

```bash
npm install
```

### 2. Environment variables

`.env` already ships with the Supabase project provided in the brief. You
*must* supply a valid database password — the project's database password is
rotatable from the Supabase dashboard (Project Settings → Database).

```env
NEXT_PUBLIC_SUPABASE_URL=https://kmalmqprhccgzbuhiyya.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…

DATABASE_URL="postgresql://postgres.<project>:<password>@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<project>:<password>@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

JWT_SECRET="<long random string>"
```

> **Note:** when this MVP was built, the database password supplied in the brief
> was rejected by the pooler with `password authentication failed for user
> "postgres"`. Reset the database password in the Supabase dashboard and update
> both `DATABASE_URL` and `DIRECT_URL`. URL-encode any special characters with
> `encodeURIComponent`.

### 3. Push the schema and seed

```bash
npm run db:push       # creates tables in Supabase
npm run db:seed       # inserts 8 vendors + 1 demo client
```

### 4. Start dev

```bash
npm run dev
```

Open <http://localhost:3000>.

### Demo accounts (after seeding)

| Role   | Email                            | Password   |
| ------ | -------------------------------- | ---------- |
| Client | `pilot@clientco.com`             | `tiptop1234` |
| Vendor | `contact@helvetica-eng.ch`       | `tiptop1234` |
| Vendor | `team@cleanlogic.it`             | `tiptop1234` |
| Vendor | `office@axis-automation.de`      | `tiptop1234` |
| Vendor | `hello@nordbau-pharma.no`        | `tiptop1234` |
| Vendor | `london@thamesbuild.co.uk`       | `tiptop1234` |
| Vendor | `projects@iberbio.es`            | `tiptop1234` |
| Vendor | `info@grandparis-mep.fr`         | `tiptop1234` |
| Vendor | `admin@alpine-cqv.ch`            | `tiptop1234` |

## NPM scripts

| Command           | What it does                                                  |
| ----------------- | ------------------------------------------------------------- |
| `npm run dev`     | Next.js dev server                                            |
| `npm run build`   | `prisma generate` + `next build`                              |
| `npm run start`   | Run the production build                                      |
| `npm run db:push` | Sync `schema.prisma` → Postgres (no migration history)        |
| `npm run db:migrate` | Create and apply a migration                               |
| `npm run db:seed`    | Run `prisma/seed.ts` (idempotent — wipes & reseeds)        |
| `npm run db:studio`  | Open Prisma Studio                                         |

## Deploying

1. **Database** – your Supabase project already has a Postgres. Run
   `npm run db:push` against the production DB once.
2. **App** – push to Git, import in Vercel, set the four env vars above. Vercel
   runs `npm run build` (which includes `prisma generate`) automatically.

## Architecture choices worth flagging

- **Single-table-per-section, no JSON blobs.** Capabilities, projects,
  certifications, locations are first-class relations so they stay queryable
  for filtering and ranking later.
- **Score is stored, not computed at query time.** Every save recomputes the
  breakdown and writes it back to `VendorProfile`. This keeps the search/filter
  query simple (`vqiScore >= n`) and indexable.
- **JWT in HttpOnly cookie** — no client-side token handling, server components
  can read the session synchronously.
- **App Router everywhere.** Auth guards live in route layouts so unauthenticated
  users see a 302 to `/login?next=…` immediately, with no flash of protected
  content.
- **Wizard is fully client-driven, single PUT.** The PQQ wizard maintains
  in-memory state and ships the entire profile on each save — child collections
  are upserted in a single transaction. This makes the API simpler than per-row
  CRUD endpoints and means saving never produces a half-applied state.

## Suggested MVP refinements (post-deploy)

- Email verification + password reset (current MVP uses simple email/password).
- Document attachments on certifications & projects (Supabase Storage bucket).
- AI-assisted tagging from PQQ free-text → suggested capabilities.
- Audit trail on profile edits.
- Client team accounts with shared shortlists.
- API key issuance for ERP/PLM integrations.
