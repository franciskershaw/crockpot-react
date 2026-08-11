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

### Epic 1: Foundations
- **CFE-001** — Project scaffold: Vite + React + TS, Tailwind, shadcn/ui
  init, router shell, API client base (fetch wrapper with base URL +
  credentials), TanStack Query provider, tooling from above wired up
  (Prettier/oxlint/husky/Vitest), Vercel project connected.
- **CFE-002** — Auth: Google OAuth redirect flow, email/password
  register/confirm/login/forgot/reset forms, access-token-in-memory +
  refresh-on-load, route guarding for authenticated pages, `/me` fetch on
  boot to restore session.

### Epic 2: Recipe Browsing
- **CFE-003** — Landing page (per `screenshots/landing page/`).
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
