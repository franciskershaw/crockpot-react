# Crockpot Frontend — Master Spec

## Goals

The client for the Crockpot API (`../crockpot-go`): browse/search recipes,
manage a weekly menu and shopping list, and (PREMIUM) plan meals on a
day/slot calendar. Rebuilds the old `crockpot` Next.js app's frontend as a
standalone client talking to the new Go API, matching
`crockpot-go`'s split from a combined full-stack app.

Design reference: `../screenshots/` (not committed) — Claude-Design
reskins covering landing, browse, recipe detail, add-recipe (incl. the
link-import and freeform-ingredient-paste flows), and "Your Crockpot"
(menu/planner/favourites/my-recipes), desktop and one mobile view. Not
pixel-perfect or final UX — a strong starting tone/layout reference, to be
iterated on during actual implementation. Check the PNGs directly before
assuming a flow rather than working from this summary.

## Users & core use cases

Same as `crockpot-go`'s spec: founder + partner today, built for a public,
tiered user base. Core use cases: browse/search/favourite recipes, submit
a custom recipe (subject to the 5-recipe FREE cap and admin approval),
build a menu, auto-generate a shopping list, and — PREMIUM — a weekly
planner and paste-a-link/paste-ingredients recipe import. Full detail:
`../crockpot-go/docs/specs/master-spec.md`, which this project treats as
the source of truth for API shape and tier rules — don't restate business
rules here that would drift from it.

## Non-goals (current scope)

- No admin panel UI beyond recipe approval (matches the backend's
  non-goal).
- No billing/checkout UI — PREMIUM is manually granted until
  `crockpot-go` Epic 11 ships; no pricing/checkout flow to build yet
  despite the landing page design showing a "Pricing" nav item (that page
  can be a placeholder).
- No native mobile app — the mobile screenshots describe responsive web
  layout, not a separate app.

## Key architecture decisions

- **Framework: Vite + React SPA**, not Next.js and not Astro — decided
  explicitly at kickoff after discussing SSR tradeoffs. Reasoning:
  Next.js's App Router/server-actions model was a poor fit (friction the
  founder explicitly wants to avoid, plus a real cold-start concern for
  any Vercel serverless function proxying to the Go API). Astro would
  give real SSR/SEO for the public recipe/browse/landing pages via
  static generation + ISR, cheaply (Astro runs on Vite itself), but adds
  a small new framework to learn. Decision: ship the simpler single-
  framework Vite SPA now, matching `packing-list-react`'s proven setup,
  and **keep the migration path open** — see the constraint below. Revisit
  if/when organic recipe-search traffic becomes a real growth channel.
  - **Constraint to keep Astro migration cheap later**: the
    landing/browse/recipe-detail pages' data-fetching must go through a
    plain async function (e.g. a `getRecipe(id)` in the API client), not
    be written directly inside a `useQuery` call in the page component.
    `useQuery` can wrap that function client-side as normal — the
    constraint is just that the fetch itself is a standalone function
    Astro's frontmatter could call unchanged later. Keep these 3 pages'
    components reasonably thin on `react-router`-specific hooks
    (`useParams`, nested SPA layout assumptions) for the same reason.
- **UI components: shadcn/ui** (Radix primitives + Tailwind, generated
  into the codebase and owned/customized directly), matching the old
  Next.js app — decided over bare Radix (packing-list-react's approach)
  because Crockpot's UI surface (filter panel, tabs, planner grid,
  multiple dialog types) is closer to the old app's complexity. Because
  shadcn components are copied-in code, not a black-box dependency,
  matching the reskin designs is a normal edit, not a fight with a
  component library's API.
- **State/data**: TanStack Query for all server state (matches both
  reference projects). Forms: React Hook Form + Zod (matches the old
  Next.js app).
- **Routing**: `react-router-dom` v7 (matches `packing-list-react`).
- **Auth**: Google OAuth (redirect to the Go API's `/auth/google/login`)
  and email/password (register/confirm/login/forgot/reset), matching
  `crockpot-go`'s Epic 2. Access token held in memory (not
  localStorage — avoids XSS token theft), refreshed via the httponly
  refresh cookie. `POST /auth/refresh` on app load / 401 retry, same
  pattern as any client of `crockpot-go`'s token model.
- **Domain layout**: frontend on `crockpot.app` (or `www.`), API on
  `api.crockpot.app` — matches the old app's existing DNS. Keeps the
  refresh-token cookie same-site (`Lax`/`Strict`) rather than needing
  `SameSite=None` cross-site cookies, which is both simpler and safer.
- **Icons**: lucide-react (matches both reference projects).
- **Images**: Cloudinary upload widget, client-side direct upload
  (matches the old app and `crockpot-go`'s "API never proxies image
  bytes" decision).
- **Auth client implementation mirrors `packing-list-react`** (its
  `src/lib/http/client.ts` plus the `src/features/auth/` modules —
  `AuthContext`, `RequireAuth`, `useLogout`) — decided at CFE-002's
  grill (2026-08-26). That project
  already solved this exact `crockpot-go`-shaped token model: in-memory
  access token, `POST /auth/refresh` on load and on any 401 (retry once),
  a singleton `refreshPromise` so concurrent 401s collapse to one
  refresh, session state as a single `useQuery(["auth","session"])`.
  Rejected: a dev-only Vite proxy to dodge CORS — the frontend hits
  `VITE_API_URL` cross-origin directly so dev and prod behave
  identically (prod has no serverless proxy by the framework decision
  above), and `crockpot-go` gets a real CORS middleware (CROC-009a)
  either way. Revisit the whole pattern only if the Astro migration
  happens (SSR changes where the session is resolved).
- **Google sign-in ships before email/password** — decided at CFE-002's
  grill. Google alone satisfies the end-to-end log-in milestone; the
  password suite is 5 screens with ~12 API error codes and no design
  screenshots, so it earns its own ticket (CFE-002b) and grill. Not a
  statement that password auth is lower priority — just that it is a
  separable unit.

## Tooling (reused from `packing-list-react` as-is)

- Formatter: Prettier + `@ianvs/prettier-plugin-sort-imports`
- Lint: oxlint, **with its accessibility (jsx-a11y-equivalent) rule set
  enabled** — decided explicitly at kickoff, not left for later
- Pre-commit: husky + lint-staged (format + lint staged files)
- Tests: Vitest + Testing Library
- Hosting: Vercel

## Ticket backlog

Sequenced to unblock on `crockpot-go` roughly in the order its own epics
land, but the exact interleaving is a planning call for each ticket's own
`grill-me`, not fixed here.

### Round 1: log-in milestone

Goal: land on `/`, click "Continue with Google", complete consent, get
redirected to a protected `/menu` page showing the `/me` identity, and
log back out. Google-only (email/password → CFE-002b).

Sequence: `crockpot-go` CROC-009a → CFE-001 → CFE-002 → CFE-002a →
CFE-003. CROC-009a must merge before CFE-002a's live verification.

**Only CFE-001 is fully worked out** (`docs/handoffs/CFE-001.md`) — it's
being hand-implemented first. CFE-002 / CFE-002a / CFE-003 each get their
own `grill-me` before implementation (hand-written or Claude-implemented,
decided per ticket). The bullets below are the agreed *direction* from
2026-08-26, not a finished trade-off pass — treat open questions as still
open.

Agreed direction:
- **CROC-009a** (`crockpot-go`, `docs/handoffs/CROC-009a.md`): straight
  single-origin port of `packing-list-go/internal/middleware/cors.go`.
  A claim-check this session found `crockpot-go` never built CORS, and
  the frontend's cross-origin `/auth/refresh` + `/me` calls need it.
- **CFE-002 / CFE-002a** mirror `packing-list-react` closely
  (`src/lib/api/{client,tokenStore}.ts`,
  `src/features/auth/{api,AuthContext,RequireAuth,useLogout}`,
  `src/app/{App,AppRoutes}.tsx`). Known deltas: `User` carries `image`
  (not `avatarUrl`) + `role`; `DEFAULT_AUTHENTICATED_ROUTE = "/menu"`
  (bare stub — the tabbed "Your Crockpot" shell is CFE-006);
  `/auth/callback` maps `?error=` to a `sonner` toast on `/`; the
  401-retry login/register exclusion (`crockpot-go` `CROC-006.md:104`)
  is deferred to CFE-002b. Direct cross-origin calls, no Vite proxy.
- **CFE-002a `/menu` stub**: name/email/role + logout button, no
  `AppShell` — the verification surface, not a real screen.
- **CFE-003 landing** (`screenshots/landing page/`, all 5 PNGs), pulled
  into this round: Fraunces + Newsreader as the font starting point;
  palette lands here; `189` hardcoded; hero recipe cards are gray
  placeholders; a `/recipes` "coming soon" stub absorbs the
  browse/planner nav targets; "continue with email instead" omitted;
  auth CTAs fire the Google redirect.

### Epic 1: Foundations
- **CFE-001** — Project scaffold. **Done** (2026-08-28). See
  `docs/handoffs/CFE-001.md` for what shipped and its deltas from the
  plan. Vercel deferred until `crockpot-go` deploys.
- **CFE-002** — API client + token store (fetch wrapper with in-memory
  access token + 401→refresh→retry). Direction in "Round 1" above; own
  grill pending. Note: the `src/lib/http/` transport (`client.ts`,
  `tokenStore.ts`, `client.test.ts`) and the `useApiQuery` /
  `useApiMutation` TanStack wrappers were already ported during CFE-001,
  so this ticket is auth wiring + verifying that client against a real
  `crockpot-go`, not building it from scratch.
- **CFE-002a** — Auth session/guard: `AuthContext`, `RequireAuth`,
  `/auth/callback`, Google login, empty protected `/menu`, `useLogout`.
  Direction in "Round 1" above; own grill pending.
- **CFE-002b** — Email/password suite (register + 6-digit OTP confirm +
  resend, login, forgot, reset-from-`?token=`). Deferred out of Round 1,
  needs its own grill and its own screenshots. Must also add the
  login/register/forgot exclusion to `apiFetch`'s 401-retry (flagged at
  `crockpot-go` `CROC-006.md:104`).

### Epic 2: Recipe Browsing
- **CFE-003** — Landing page (per `screenshots/landing page/`). **Pulled
  into Round 1** so the log-in milestone lands on a finished entry point.
  Also adds a minimal `/recipes` "coming soon" stub (browse/planner nav
  targets route here until CFE-004).
- **CFE-004** — Browse/search page: filters (cooking time range,
  categories include/exclude, ingredient search), recipe card grid,
  favourite toggle.
- **CFE-005** — Recipe detail page: ingredients with serves adjuster,
  instructions, notes, favourite/edit/delete/add-to-menu actions
  (edit/delete only for the owner or admin).

### Epic 3: Your Crockpot — Core
- **CFE-006** — Menu tab: current menu list, remove-from-menu,
  favourite-from-menu, shopping-list summary panel.
- **CFE-007** — Favourites tab.
- **CFE-008** — My recipes tab: create/edit/delete own recipes,
  create-recipe entry point.
- **CFE-009** — Shopping list: full view (categorised, obtain toggle,
  add-extra, clear list) — the summary panel in CFE-006 links here.

### Epic 4: Add/Edit Recipe
- **CFE-010** — Manual recipe form (name, photo via Cloudinary widget,
  time, serves, categories, ingredients, instructions, notes) — the
  "fill it in yourself" half of `screenshots/add recipe/`.
- **CFE-011** — Freeform ingredient-paste parsing UI, calling
  `crockpot-go`'s parser endpoint (added to backend Epic 10 at kickoff).

### Epic 5: Premium Features
- **CFE-012** — Weekly planner (`screenshots/your crockpot/yp2.png`,
  `yp6.png`): 7×3 day/slot grid (desktop) and one-day-at-a-time mobile
  view, fill-from-favourites, clear week. Gate on `role`, matching
  `crockpot-go` CROC-025; show an upgrade prompt for FREE users rather
  than hiding the tab entirely (confirm this UX choice — the design
  shows the Planner tab visible-but-locked with a PREMIUM badge, not
  hidden).
- **CFE-013** — Recipe import from a link, calling `crockpot-go`
  CROC-026. PREMIUM-gated per the design's badge.

### Epic 6: Admin
- **CFE-014** — Recipe approval action, admin-only (no full admin panel —
  matches backend non-goal; likely just an affordance on the recipe
  detail/my-recipes views, not a separate dashboard).
