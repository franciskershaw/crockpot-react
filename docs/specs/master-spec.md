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
- **Palette + fonts land in CFE-003** (`docs/handoffs/CFE-003.md`),
  consumed by every screen after. Palette: Claude Design's own output
  for the reskin, mapped onto the existing shadcn `--color-*` tokens in
  `src/index.css` — warm cream background, sage-green primary, charcoal
  text/footer, tan surfaces, plus decorative `--accent-rust` /
  `--accent-gold`. **Light mode only** — no dark screenshots exist and
  `sonner` was stripped of theme wiring in CFE-001; revisit only if a
  dark design appears. Fonts: **Newsreader** (serif, display) +
  **Karla** (sans, body) via a Google Fonts `<link>`, as
  `--font-display` / `--font-sans`. Rejected self-hosting via
  `@fontsource` (deps + wiring for no gain pre-launch); revisit at the
  Astro migration or when perf becomes real.
- **Auth client implementation mirrors `packing-list-react`** — its
  `src/lib/api/{client,tokenStore}.ts` and `src/features/auth/`
  (`AuthContext`, `RequireAuth`, `useLogout`); lands in crockpot as
  `src/lib/http/{client,tokenStore}.ts` plus the same auth modules.
  Decided at CFE-002's grill (2026-08-26). That project already solved
  this exact `crockpot-go`-shaped token model: in-memory access token,
  `POST /auth/refresh` on load and on any 401 (retry once),
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
- **One shared `AppShell`, mounted on every route** — lands at CFE-004
  (`docs/handoffs/CFE-004.md`), not CFE-006 as CFE-003 originally
  flagged. `SiteHeader`/`MobileTabBar` branch internally on
  `useAuth().isAuthenticated` (a fixed nav per auth state, identical on
  every route — logged out: Recipes/How it works/Pricing/Sign in;
  logged in: Browse recipes/Your Crockpot/Add a recipe/avatar+logout).
  Matches the old `crockpot` app's actual pattern (one `Navbar` + one
  `BottomMobileNav`, mounted once in its root layout, each branching on
  session state) — an early draft of this ticket built a *second*,
  separate authenticated-only shell instead and was corrected once
  checked against that precedent. No cart/shopping-list badge yet
  (needs CFE-009's data). Filter state for list pages (first used by
  CFE-004's browse filters) lives in the URL via `useSearchParams`, not
  localStorage — shareable/bookmarkable, and the query string doubles as
  the TanStack Query cache key.

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

*Next-phase priority set 2026-09-06 (see `crockpot-go`'s matching note):
`CFE-020` and `CFE-021` jump the queue ahead of Epic 3 once their
respective `crockpot-go` blockers (`CROC-019`, then `CROC-042`) land —
the goal is a feature-complete browse page (random order, real ranking,
on-card match info, add-to-menu) before anything else.*

### Round 1: log-in milestone — **Done** (2026-08-29)

Land on `/`, "Continue with Google", consent, redirect to a protected
`/menu` showing the `/me` identity, log back out. Google-only
(email/password → CFE-002b). Shipped as CROC-009a → CFE-001 → CFE-002a →
CFE-003.

### Epic 1: Foundations
- **CFE-001** — Project scaffold. **Done** (2026-08-28). See
  `docs/handoffs/CFE-001.md` for what shipped and its deltas from the
  plan. Vercel deferred until `crockpot-go` deploys.
- **CFE-002** — Folded into CFE-002a; the transport (`client.ts` +
  `tokenStore.ts`) shipped in CFE-001.
- **CFE-002a** — Auth session, guard, Google login. **Done**
  (2026-08-28). See `docs/handoffs/CFE-002a.md`.
- **CFE-002b** — Email/password suite (register + 6-digit OTP confirm +
  resend, login, forgot, reset-from-`?token=`). Deferred out of Round 1,
  needs its own grill and its own screenshots. Must also: add the
  login/register/forgot exclusion to `apiFetch`'s 401-retry (flagged at
  `crockpot-go` `CROC-006.md:104`); fill `getAuthErrorMessage`'s
  per-code map, including a real `email_registered_with_password`
  message — its "unreachable in Round 1" assumption ends once password
  registration ships, so weigh account-enumeration disclosure then.

### Epic 2: Recipe Browsing
- **CFE-003** — Landing page, plus the colour palette and Newsreader +
  Karla fonts as tokens, and a public `/recipes` "coming soon" stub.
  **Done** (2026-08-29). See `docs/handoffs/CFE-003.md` for the palette
  token map, the font decision, and the deltas from the mockup (mobile
  "Three steps" carousel, no Pro pricing card, recipe cluster beside
  pricing). Palette + fonts are summarised under "Key architecture
  decisions" above.
- **CFE-004** — Browse/search page: filters (cooking time range,
  categories include/exclude, ingredient search), recipe card grid,
  favourite toggle. Also lands the shared `AppShell` (see above). **Done**
  (2026-09-05), see `docs/handoffs/CFE-004.md`.
- **CFE-005** — Recipe detail page: ingredients with serves adjuster,
  instructions, notes, favourite/edit/delete/add-to-menu actions
  (edit/delete only for the owner or admin). **Also owns the
  pending-approval indicator** for the viewer's own unapproved recipe —
  moved here from the browse card at `CFE-004`'s grill (2026-09-04, see
  `docs/handoffs/CFE-004.md` decision 5); `RecipeCard` shows no
  pending-state UI at all.
- **CFE-020** — Add-to-menu quick action: a per-card cart icon on
  `RecipeCard`, ported behaviourally unchanged from the old app's
  `AddToMenuButton.tsx` (not from `browse1.png`/`browse2.png`, which
  disagree with each other and were discounted at this ticket's grill —
  see `docs/handoffs/CFE-020.md` decision 1). Was a forward-pointer only
  ("likely CFE-006") at `CFE-004`'s grill (2026-09-04, decision 2) —
  promoted to its own ticket 2026-09-06 since it's cross-cutting (browse
  card, favourites list, and `CFE-005`'s detail-page action all
  plausibly share the same button/mutation, though only the browse card
  ships here — see the handoff's non-goals). Unblocked: `crockpot-go`
  `CROC-019` (`POST /menu/entries`) shipped 2026-09-06. Grilled
  2026-09-07, see `docs/handoffs/CFE-020.md` for the full decision set —
  notably: `isInMenu` derived client-side from a prefetched `GET /menu`
  rather than a new card DTO field (decision 2), no `AppShell`/nav badge
  in scope (decision 7, drops the "cascading"/badge language this line
  used to carry), serves stepper bounds 1–50 not the old app's 1–20
  (decision 8). **Done** (2026-09-08), see `docs/handoffs/CFE-020.md`.
- **CFE-021** — Match/ranking display + random-order seed on
  `RecipeCard`/browse. Reuses the old app's `RelevanceBadge` presentation
  (`src/app/recipes/components/RecipeCard.tsx:22-79` in `../../crockpot`)
  — "Best Match"/"Good Match" star badge, inline "N ingredients
  matched"/"N categories matched" chips — as real working precedent for
  layout/copy, not a fresh design pass (founder's call, 2026-09-06: not
  complex enough UI to warrant one). **Unblocked**: `crockpot-go`
  `CROC-042` shipped 2026-09-06 (`docs/handoffs/CROC-042.md`) —
  `RecipeCard` now returns `matchedIngredientCount`,
  `totalIngredientCount`, `matchedCategoryCount`, `score`, `tier`
  (`"best"`/`"good"`/`null`, fixed server-side thresholds 0.8/0.5 — not
  this ticket's concern to change). Grilled 2026-09-08 (cheap to undo —
  self-contained card component + one small hook, no shared contract
  other tickets build on):
  - **Scope grew to include seed generation/persistence.** `CROC-042`'s
    own Non-goals section names `CFE-020`/`CFE-021` as owning the client
    `seed` param, but `CFE-020` (Done, 2026-09-08) shipped only the
    add-to-menu button — no seed code exists anywhere in
    `crockpot-react` today (`api.ts` has no `seed` param). `CFE-021`
    absorbs it: port the old app's `useSessionSeed.tsx` contract
    unchanged (daily `sessionStorage`-persisted random seed, regenerated
    when the stored date rolls over) into a new
    `features/recipes/hooks/useSessionSeed.ts`, wired into
    `RecipeListParams`/`buildRecipeListSearchParams` as `seed`.
  - **Visibility is derived from the recipe's own fields, not
    `activeFilterCount`.** `RecipeGrid`'s existing `activeFilterCount`
    prop (`RecipeGrid.tsx:24`) includes `q`/time-range, which `CROC-042`
    keeps as non-scoring hard filters (decision 5) — using it as the
    gate would treat a time-only search as if it had match data. Show
    the star badge when `recipe.tier` is non-null; show each chip when
    its matched count > 0.
  - **Star-badge suppression rule**, added after checking real data
    (`crockpotV3.Recipe.json`, 213 approved recipes): "Air Fryer" alone
    tags 76 of them, "Veggie" 54, "Healthy" 45. Selecting a single
    category with no ingredients makes `categoryCoverage` =
    `matchedCategoryCount / categoriesSelected` = 1/1 = 1.0 for every
    recipe carrying that one tag, so all of them would show `tier:
    "best"` simultaneously — not meaningfully differentiating. Suppress
    the star badge specifically when `selectedIngredientCount === 0 &&
    selectedCategoryCount === 1`; the ingredient axis doesn't need the
    same treatment (self-limiting — coverage is against the recipe's own
    total ingredient count, only hits 1.0 on a one-ingredient recipe).
    Chips still render in the suppressed case (descriptive, not
    evaluative, so "1 category matched" stays honest either way).
    `RecipeCard` gains two new props, `selectedCategoryCount`/
    `selectedIngredientCount`, threaded down `BrowseRecipesPage` →
    `RecipeGrid` → `RecipeCard` alongside the existing
    `activeFilterCount` — needed because `matchedCategoryCount` alone
    can't distinguish "matched 1 of 1 selected" from "matched 1 of 5".
  - **Colors reuse existing tokens, not the old app's hardcoded
    palette** (LESSONS.md, CFE-020: porting UI from a token-less
    codebase quietly imports its hardcoded colors — now a standing
    preference). Best-Match star: `--accent-gold`. Good-Match star:
    `--success`/`--success-foreground`. Ingredient-matched chip:
    `--ingredient-chip-bg/border/text` (already used for selected-
    ingredient filter pills, `FilterPills.tsx:19`). Category-matched
    chip: `--category-chip-bg/border/text` (same, `FilterPills.tsx:17`)
    — match chips now visually echo the filter pill that caused the
    match.
  - **Placement**: star badge absolute bottom-right of the image (top
    corners already hold `AddToMenuButton`/favourite heart); chip row
    between the time/serves line and the existing category-tags row —
    matches old app's DOM order (`RecipeCard.tsx:198`, `:249-275` in
    `../../crockpot`). `RecipeCardSkeleton` unchanged — already a
    generic placeholder, not trying to mirror every conditional
    per-recipe element.

  **Acceptance criteria:**
  - [ ] Selecting 2+ categories, or any ingredient (alone or combined
        with categories), and matching enough to hit `tier: "best"`/
        `"good"` shows the correct star + label.
  - [ ] Selecting exactly one category (no ingredients) and matching it
        never shows a star, but does show the "1 category matched" chip.
  - [ ] Ingredient-matched and category-matched chips render
        independently based on their own matched count > 0, regardless
        of star visibility.
  - [ ] No categories/ingredients selected (or `q`/time only) → no star,
        no chips (`tier`/counts are null/zero from the API in this mode).
  - [ ] No filters at all → results order is stable across pagination
        and across repeated visits within the same calendar day (same
        `seed` sent), and reshuffles on a new day.
  - [ ] All badge/chip colors come from `src/index.css` tokens, no
        hardcoded hex/Tailwind-palette classes.
  - [ ] Vitest coverage: the suppression rule as a pure function (all
        four `I`/`C` cardinality cases plus the boundary), and
        `useSessionSeed`'s date-rollover/regenerate logic.

  **Non-goals:**
  - No change to `CROC-042`'s scoring formula or thresholds — this
    ticket only decides whether the frontend *displays* the star it's
    given, not what the server computes.
  - No fresh design pass / new screenshot — old app markup is the
    layout/copy precedent (founder's call, 2026-09-06); `browse1.png`/
    `browse2.png` don't depict this state at all (confirmed by reading
    both — filters are active in both with zero badges/chips shown), so
    there's nothing to check this component against.
  - No pending-approval indicator changes (owned by `CFE-005`).

  **Verification:**
  - **Visual + limits/thresholds** (`~/.claude/CLAUDE.md`): hands-on,
    founder-driven, against the running `npm run dev` app — select one
    category (expect chip, no star), select two/an ingredient (expect
    star), clear all filters and reload within the same session (expect
    stable order), clear `sessionStorage` or wait a day (expect
    reshuffle). No screenshot exists for this state, so this is the real
    check, not a stand-in for one.
  - **Logic with assertable behaviour**: Vitest + Testing Library for
    the suppression rule and `useSessionSeed`, per the acceptance
    criteria above.

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

### Tech Debt & Production Readiness
*From the first whole-codebase tech-debt pass, 2026-09-05. Full detail:
`docs/findings/2026-09-05-tech-debt.md`.*
- **CFE-016** — Error resilience: top-level error boundary
  (`App.tsx`/`AppRoutes.tsx`, previously none — any render exception
  white-screened the app), and `isError`/retry surfaced in `RecipeGrid`
  and `FilterPanel` instead of relying on a transient toast that left the
  browse grid silently blank after it faded. Findings 1–2. **Done**
  (2026-09-06).
- **CFE-017** — Auth client hardening: test coverage for `client.ts`'s
  concurrent-401 refresh collapse, retry-once, and refresh-failure paths
  (previously untested — highest-consequence code in the HTTP client);
  `useLogout` now routes through `useApiMutation` so a failed
  server-side logout call surfaces a toast like every other mutation.
  Findings 3–4. **Done** (2026-09-06).
- **CFE-018** — Data-layer cleanup: the three near-identical
  `error instanceof ApiError` toast ternaries in
  `useApiQuery`/`useApiInfiniteQuery`/`useApiMutation` collapsed into one
  shared `apiErrorMessage` helper; `FilterPanel`'s reference-data queries
  now threaded through as props from `BrowseRecipesPage` instead of
  re-fetching independently. Findings 6, 8. **Done** (2026-09-06).
- **CFE-019** — Housekeeping: fixed 3 files' pre-`@/`-alias deep relative
  imports; dropped the redundant standalone `@radix-ui/react-slot`
  dependency in favour of the unified `radix-ui` package; added
  `loading="lazy"` (skipping the first row) to `RecipeCard`'s image;
  added route-based code splitting (`React.lazy` + `Suspense`, scoped to
  `BrowseRecipesPage`/`AuthCallback` only) with a themed `RouteFallback`
  — carried forward from the 2026-09-04 seed finding. Findings 5, 7, 9,
  10. **Done** (2026-09-06).

*Seeded 2026-09-07 (`CFE-020`'s build/close-out), for the next
whole-codebase pass — not yet actioned:*
- **Hardcoded Tailwind colors instead of this project's own config
  tokens.** `AddToMenuButton.tsx` (ported from the old app, which has no
  equivalent token system of its own) still uses raw Tailwind palette
  classes — `gray-100`–`gray-800`, `white/95` — instead of `src/index.css`'s
  actual design tokens (`border`, `muted`, `accent`, etc., the same family
  `success`/`green`/`destructive` were pulled from at this ticket's
  close-out). Founder preference stated for the first time here: colors
  should mostly come from the config file, not be hardcoded — likely
  affects other components too, not just this one file. Sweep on the next
  pass rather than fixing piecemeal per-ticket.

*Seeded 2026-09-08 (`CFE-021`'s piece 1, data-layer), for the next
whole-codebase pass — not yet actioned:*
- **Duplicated `RecipeCard` test fixture across 7 files.** A `recipe()`/
  `recipeCard()`/`entry()` factory building a full `RecipeCard` object is
  hand-copied in `RecipeCard.test.tsx`, `AddToMenuButton.test.tsx`,
  `useAddToMenuButtonState.test.tsx`, `useToggleFavourite.test.tsx`, and
  `menu`'s `useAddToMenu`/`useRemoveFromMenu`/`useUpdateMenuEntryServes`/
  `useMenuEntry` tests — 8 copies total. Adding `CFE-021`'s 5 new
  required fields (`matchedIngredientCount`, `totalIngredientCount`,
  `matchedCategoryCount`, `score`, `tier`) meant editing all 8 by hand;
  `tsc -b` (not `vitest run` alone) is what caught the ones this missed
  on the first pass. Extract a shared builder into `src/test/` (already
  the shared-test-infra location — `renderWithProviders.tsx` lives
  there), so the next required field touches one file. Deferred rather
  than done inline: real duplication, but a refactor across 8 files
  scoped to test infra, not this ticket's actual behaviour.

### Deferred: Default Items

*Parked 2026-08-31 — a loosely-scoped idea, not sequenced into a
priority epic yet. Numbered out of physical order deliberately: this
sits conceptually in Epic 3 (Your Crockpot — Core, alongside `CFE-009`'s
shopping list), but the founder wants it addressed only once the core
epics have shipped, not inserted into the current build order. Grill
properly before starting. Paired with `crockpot-go`'s `CROC-038`.*
- **CFE-015** — UI for "default items": some way to save/manage a
  personal set of items (e.g. toilet paper, eggs, milk) not tied to any
  recipe, and a "restock" gesture that adds some or all of them to the
  current shopping list in bulk — distinct from `CFE-009`'s existing
  one-off `add-extra`. Exact surface (a settings page, an inline
  section on the shopping list screen, something else) is undecided —
  open for the grill, alongside `crockpot-go` `CROC-038`'s data-shape
  questions.
