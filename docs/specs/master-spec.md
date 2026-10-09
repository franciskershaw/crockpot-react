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
  Mounted as a data router (`createBrowserRouter` with one splat route
  wrapping `AppRoutes`' `<Routes>`), from `CFE-010`, solely so
  `useBlocker` can guard unsaved forms against back/swipe-back. Rejected:
  converting every route to route objects (no need yet); staying on
  `<BrowserRouter>` (`useBlocker` doesn't work there). Revisit if loaders
  or `<ScrollRestoration>` become worth adopting.
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
- **Images**: the photo travels with the recipe save — create/update
  send `multipart/form-data` (`recipe` JSON part + optional `photo`),
  and `crockpot-go` uploads it to Cloudinary (`CROC-040`). The browser
  never talks to Cloudinary for uploads and never sends an image URL;
  it renders sized delivery URLs (`f_auto,q_auto,w_…`) built from the
  stored original. No upload widget.
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

- **Ending a session** (from `CFE-050`, 2026-10-02): one
  `endSession(queryClient)` is the only code that ends a session (logout,
  a refresh rejected with 401, later account deletion). It clears the
  token, writes the session query to `null`, then removes other queries,
  and returns whether there was a session to end, so callers pick their
  own toast. Optimistic rollbacks must do nothing once their cache has
  been removed, or they write a signed-out user's data back. `client.ts` reports a rejected refresh through
  `onSessionExpired`, which `AuthProvider` registers; only a 401 counts,
  not a 429/5xx/network failure. Requests failing that way throw
  `SessionExpiredError`, which the toast wrappers skip. The user stays in
  the session query (server state) and the token in `tokenStore`.
  Rejected: an external session store replacing the query, and the
  transport clearing caches itself. Revisit if a second kind of
  client-only auth state appears that the query model can't hold.

- **Starting a session, and requests made before one** (from
  `CFE-002b`, 2026-10-03): a call made before any session exists opts out
  of `apiFetch`'s 401 → refresh retry with `{ refreshOn401: false }`. All
  the password endpoints pass it, so a wrong password surfaces as itself
  rather than as a silent `SessionExpiredError`. Every in-app sign-in
  (password login, the automatic login after confirming, password reset)
  goes through `startSession(queryClient, accessToken)`: set the token,
  `fetchMe`, remove every non-session query (data cached while signed out,
  such as `isFavourite`, is wrong once signed in), then write the session.
  Only the signed-out-only route guard navigates afterwards. Rejected: a
  path list in `client.ts` (renames silently undo it), "only refresh when
  a token was sent" (changes every request's timing), invalidating the
  session query (rotates the cookie just issued) and a full page reload
  (discards the token just issued). Revisit if a second kind of
  pre-session call appears that does need a refresh.

- **Optimistic menu mutations** (from `CFE-041`, 2026-09-27): every menu
  mutation goes through `useOptimisticMenuMutation`, with a pure
  `apply`/`revert` pair per operation, where the revert undoes only its
  own change and is a safe no-op if the target has since changed; a
  shared `menuKeys.change()` key; a `GET /menu` refetch only after a
  failure, and only when it is the last menu change settling. The client
  keeps the server's newest-first order (adds go on top). Rejected: the
  shopping list's always-refetch (the server doesn't transform menu
  entries) and a generic `lib/` hook. Revisit if the server starts
  changing entries beyond what was sent.

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
- **CFE-002b** — Email/password suite. **Done** (2026-10-03), see
  `docs/handoffs/CFE-002b.md`.

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
  pending-state UI at all. **Done** (2026-09-18), see
  `docs/handoffs/CFE-005.md` for the full decision set. Introduces the
  `from=`-aware back-navigation convention that `CFE-006`/`007`/`008`
  will register their own values into, and a new ingredient-category
  icon mapper (`getCategoryIcon`).
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
  `RecipeCard`/browse: "Best Match"/"Good Match" star badge and
  ingredient/category match chips, reusing the old app's `RelevanceBadge`
  layout/copy (not its scoring — `CROC-042` computes `score`/`tier`
  server-side) and this project's own design tokens
  (`--accent-gold`/`--success`/chip tokens) rather than the old app's
  hardcoded palette. Scope absorbed seed generation/persistence
  (`useSessionSeed`, ported from the old app's `useSessionSeed.tsx`
  contract) since `CROC-042` had assumed `CFE-020`/`CFE-021` would own it
  but `CFE-020` shipped without it. Star badge is suppressed when exactly
  one category (no ingredients) is selected — verified against real
  category-distribution data that this case otherwise makes dozens of
  recipes "Best Match" simultaneously. See `LESSONS.md` (2026-09-08) for
  the retro. **Done** (2026-09-08).
- **CFE-047** — Browse's `IngredientFilter` excludes household items
  (toilet paper, bin bags…) using the non-ingredient item-category flag
  from `crockpot-go` `CROC-061` (merged), filtering the shared
  `useItems` list with `catalog/utils/ingredientItems`, as `CFE-010`'s
  ingredient search does. The shopping list keeps the full catalogue.
  `GET /items` stays unfiltered: a server-side variant would cache the
  catalogue twice to save 29 rows. Also absorbs the filters' pending
  states: per-section skeletons in place of "0 results", and placeholder
  pills for unresolved `ingredientIds`, built from existing skeleton and
  pill styling with no new design. Recipes keep loading independently.
  Load time itself is `crockpot-go` `CROC-045` (gzip). Grilled
  2026-10-03, see `docs/handoffs/CFE-047.md`.

### Epic 3: Your Crockpot — Core
- **CFE-006** — Menu tab (desktop + mobile) and the full interactive
  shopping list, absorbing the former `CFE-009`. See
  `docs/handoffs/CFE-006.md`. **Done** (2026-09-27).
- **CFE-007** — Favourites tab. **Done** (2026-09-27). Also reshaped
  pieces Menu shares: the mobile row's cart and badge (replacing
  `CFE-006`'s serves pill), an undo tile per removal on one shared,
  pausable 5s window with a countdown bar, and the add-to-menu overlay
  closing on confirm (fixing `CFE-023`). See `LESSONS.md`. Now a
  sub-tab of Library (`CFE-046`).
- **CFE-008** — My recipes sub-tab (`/library/my-recipes`): the caller's
  own recipes via `GET /recipes?mine=true`, laid out like Favourites, with
  counts in the sub-tab and Library subtitle. No edit/delete icons on
  cards (both stay on the detail page) — supersedes `yp4.png` and
  `CFE-006` decisions 9-10 for this tab. Newest-first order depends on
  `crockpot-go` `CROC-060`. **Done** (2026-09-28).
- **CFE-045** — Menu write errors show copy, not codes, paired with
  `crockpot-go` `CROC-059` (Done 2026-10-09, so unblocked).
  `menu_limit_reached` and `shopping_list_quantity_too_large` toast
  readable copy from one map in `useOptimisticMenuMutation`; the
  optimistic change reverts as today. No pre-disable at the cap.
  **Done** (2026-10-09, `docs/handoffs/CFE-045.md`).
- **CFE-054** — Quantity rule and error codes in sync with `crockpot-go`
  `CROC-064` (Done 2026-10-03, so unblocked). Low priority. (1) `parseQuantity`
  (`src/lib/quantity.ts`) also rejects anything over 100,000, the
  server's new ceiling. The current 6-digit pattern allows up to
  999,999.99. The 0.01 floor already matches. (2) Any error UI that
  switches on codes reads `invalid_quantity` (out of range) and the
  shopping list's renamed `invalid_item_id`, `invalid_unit_id` and
  `unit_not_allowed_for_item`. Nothing reads any of them today.
  (`shopping_list_quantity_too_large` moved to `CFE-045`, 2026-10-09.)
  Surfaced at `CROC-064`'s grill (2026-10-03), not grilled.
- **CFE-046** — Library tab: Favourites and My recipes merged under one
  top-level `Library` tab with underline sub-tabs, at
  `/library/favourites` and `/library/my-recipes` (old paths and
  `/library` redirect). Navigation only, from founder images shared in
  chat, not saved to `../screenshots/`. **Done** (2026-09-28).
- ~~**CFE-009**~~ — **Retired at `CFE-006`'s grill (2026-09-23)**: folded
  into `CFE-006` once `yp1.png`'s redesign showed the shopping list as
  fully interactive and inline on the Menu tab rather than a read-only
  summary pointing at a separate ticket. See `docs/handoffs/CFE-006.md`
  for how each of this line's former open gaps (regenerate, quantity
  editor, progress bar, add-extra, clear-list, mobile) was resolved.

### Epic 4: Add/Edit Recipe
- **CFE-010** — Manual recipe form: create at `/recipes/new`, edit at
  `/recipes/:id/edit`. **Done** (2026-10-02), see
  `docs/handoffs/CFE-010.md`. Left to other tickets: unmatched "New" ingredient rows (`CROC-039`), drafts (`CFE-048`).
  `CFE-011` (paste) and `CFE-013` (import) fill the same
  `RecipeFormValues`.
- **CFE-049** — Recipe photos, end to end: browser shrink, photo field,
  multipart save with `crockpot-go` `CROC-040`, sized Cloudinary
  delivery. **Done** (2026-10-02). Check on the first deploy: a photo
  upload from a phone, and that a 429 reads "try again in N minutes".
- **CFE-011** — Freeform ingredient-paste parsing UI, calling
  `crockpot-go`'s parser endpoint (added to backend Epic 10 at kickoff).

### Epic 5: Premium Features
- **CFE-012** — Weekly planner (`screenshots/your crockpot/yp2.png`,
  `yp6.png`): 7×3 day/slot grid (desktop) and one-day-at-a-time mobile
  view, fill-from-favourites, clear week. Gate on `role`, matching
  `crockpot-go` CROC-025; show an upgrade prompt for FREE users rather
  than hiding the tab entirely (confirm this UX choice — the design
  shows the Planner tab visible-but-locked with a PREMIUM badge, not
  hidden). Adding it to `YOUR_CROCKPOT_TABS` (`path` + `to`) is enough
  for the pill and the Your Crockpot nav highlight (`CFE-046`).
- **CFE-013** — Recipe import from a link, calling `crockpot-go`
  CROC-026. PREMIUM-gated per the design's badge.

### Epic 6: Admin
- **CFE-014** — Recipe approval, admin-only: a Pending tab in Library and
  an Approve button on the detail page's pending banner. Also hides
  Edit/Delete from owners of approved recipes (the `CROC-062` pair).
  **Done** (2026-10-09, `docs/handoffs/CFE-014.md`). If public signup
  opens wide, consider a Cloudinary moderation add-on on `crockpot-go`'s
  server-side upload (`CROC-040`); check its pricing first.

### Epic 7: Account Management
*Paired with `crockpot-go` Epic 12 (`CROC-051`, `CROC-030`).*
- **CFE-055** — Account settings page at `/account`, reached from the
  avatar menu: Profile, Password, and Delete account. **Done**
  (2026-10-08). See `docs/handoffs/CFE-055.md`.

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

*From the second whole-codebase tech-debt pass, 2026-09-18. Full detail:
`docs/findings/2026-09-18-tech-debt.md`.*
- **CFE-027** — Test-suite hygiene: extract a shared `RecipeCard`/
  `RecipeDetail` fixture builder into `src/test/` and migrate all 15
  files hand-copying the full shape (grown from 9 at `CFE-021` close-out,
  all growth from `CFE-005`'s recipe-detail tests — was seeded
  2026-09-08, now actioned); add the missing `useMenuEntry` regression
  test for the `isError`-folds-into-`isPending` fix (`CFE-020`'s Bugbot
  finding, implemented but never covered). Findings 2, 7. **Done**
  (2026-09-19): builders live in `src/test/recipeFixtures.ts`
  (`buildRecipeCard`/`buildRecipeDetail`); files whose tests depend on
  different defaults keep a thin local `recipe()` wrapper passing only
  the differing fields. The regression test is mutation-verified.
- **CFE-028** — Add-to-menu consistency: swap `AddToMenuButton.tsx`'s
  remaining raw Tailwind `gray-*`/`white/95` classes for `src/index.css`
  tokens, confirmed isolated to this one file (was seeded 2026-09-07 with
  a wider "likely affects other components" worry that didn't hold, now
  actioned); fix `AddToMenuStepperControls.tsx`'s non-interactive
  `onClick` div tripping the oxlint a11y ruleset. Findings 1, 4. **Done**
  (2026-09-19), shipped in `CFE-034`.
- **CFE-029** — Recipe hook/component duplication: extract a shared
  `useBoundedServes` helper for the `MIN_SERVES`/`MAX_SERVES` clamp logic
  independently duplicated in `useAddToMenuButtonState` (`CFE-020`) and
  `useIngredientServes` (`CFE-005`); extract a shared icon-button-classes
  constant/wrapper duplicated across `RecipeFavouriteButton`/
  `RecipeEditButton`/`RecipeDeleteButton`. Findings 3, 5. **Done**
  (2026-09-19): `useBoundedServes` (`recipes/hooks/`) owns the bounds,
  clamp and override-reset for both hooks, clearing their two
  `set-state-in-effect` warnings (oxlint 9 → 7); the icon-button classes
  are `ICON_BUTTON_CLASSES` in `recipes/utils/styles.ts`. Behaviour
  change: after a recipe leaves the menu, the card stepper returns to the
  recipe's own serves instead of the last menu value. Also added a
  `utils/` bucket to the feature layout (see `CLAUDE.md`) and moved the
  previously loose files into it.
- **CFE-030** — `FilterOptionList`'s expand-and-scroll `setTimeout` isn't
  cancelled on rapid re-toggle; track the timer and clear it before
  scheduling a new one. Finding 6. **Done** (2026-09-19), shipped in
  `CFE-034`.

*Ticket numbers CFE-027–030 (not CFE-023–026) — CFE-023 was taken by a
bug entry added directly to this file while this pass's audit was
running; skipped ahead to leave room rather than collide.*

*From a file-structure review requested alongside tech-debt pass #2,
2026-09-18:*
- **CFE-031** — Feature-folder reorg: split `features/recipes/` into a
  shared core plus `recipes-browse/`/`recipes-detail/`; added a `data/`
  bucket (`api.ts`/`types.ts`/`queryKeys.ts`) retrofitted to `auth`/
  `menu`/`recipes`; dissolved the `add-to-menu/` cluster once
  `AddToMenuCTA` moved to `recipes-detail/`; brought `landing/` into
  line with the `pages/`+`components/` split; moved a handful of
  single-consumer `src/components/` files to live with their actual
  consumer (`GoogleIcon` → `auth/`, `RouteFallback` → `components/nav/`)
  and grouped root-only app wiring into `components/app/`; fixed the
  `lib/Tanstack/` → `lib/tanstack/` casing. New standing rules recorded
  in `CLAUDE.md`. **Done** (2026-09-18), see `docs/handoffs/CFE-031.md`.

*Bundled 2026-09-19:*
- **CFE-034** — Lint-warning cleanup, bundled with `CFE-028` and
  `CFE-030` (same files, all mechanical). oxlint went 16 → 9 warnings.
  Fixed: `FilterOptionList` (timer + `set-state-in-effect`),
  `AddToMenuStepperControls` (a11y), `SearchBar`/`TimeRangeSlider`
  (`exhaustive-deps`, via `useEffectEvent`), and `getInitials`/
  `visibleMatchTier` moved out of component files
  (`only-export-components`). **Deliberately left**: `AuthContext` ×3
  (the documented Provider+hook exception in `CLAUDE.md`),
  `useAddToMenuButtonState`/`useIngredientServes` `set-state-in-effect`
  (owned by `CFE-029`), `carousel.tsx` ×3 (shadcn-generated), and
  `HowItWorks.tsx:63` (legitimate external-system sync; the only fix is
  dropping an initial call that is safe only while the carousel has no
  `startIndex`). **Done** (2026-09-19).

*From the branch review of 2026-09-19's work (`d2a3782..HEAD`; no bugs or
security findings — debt notes only):*
- **CFE-038** — Review follow-ups, all small and mechanical, to bundle
  (none blocking):
  - Extract the delayed-fade skeleton wrapper
    (`animate-in fade-in delay-200 duration-150 fill-mode-backwards` + its
    comment) duplicated in `RecipeGrid.tsx` and `RecipeDetailSkeleton.tsx`
    into one shared constant. Do it when `CFE-006` (or `007`/`008`) adds
    its first skeleton, since those will otherwise copy the string.
  - `useRecipeList` injects `limit: PAGE_SIZE` in `queryFn`, outside the
    params that build the query key, so the key doesn't fully describe the
    request; harmless with one caller, but move `limit` into the keyed
    params before a second consumer of `recipeKeys.list` appears.
  - `useBoundedServes.ts` exports `MIN_SERVES`/`MAX_SERVES` with no
    importers; drop the `export`.
  - Confirm intent for two spacing changes landed without a note:
    `IngredientsSection` `pt-3` → `pt-0` and `RecipeHero` `mb-14` → `mb-2`.
    If deliberate, record them in a handoff/LESSONS line.
  - **Progress (2026-09-27)**: bounds unexported; `limit` now in the query
    key. The spacing item turned out to be a logged-out bug: the mobile
    sticky action row in `RecipeHero` collapsed to 16px with no buttons,
    so `-mt-14 mb-2` pulled the tabs 32px under the hero, and once stuck
    it showed an empty dark band. Logged out (no actions) the sticky row
    now isn't rendered: the fixed tab bar sits directly under the header
    and the handoff sentinel moves to where the tabs start. `pt-0` and
    `mb-2` are kept (deliberate). Skeleton-wrapper item moved to `CFE-040`.
    **Done** (2026-09-27), shipped with `CFE-043`.

*From the third whole-codebase tech-debt pass, 2026-09-27. Full detail:
`docs/findings/2026-09-27-tech-debt.md`.*
- **CFE-039** — Lazy-load the Your Crockpot routes: `CFE-006` pulled
  `motion`/`zod`/`react-hook-form`/`cmdk` into the eager bundle via
  `MenuPage` (742 kB main chunk, Vite size warning), reversing
  `CFE-019`'s split. Finding 1. **Done** (2026-09-27): Menu/Favourites/
  My recipes pages lazy; `YourCrockpotLayout` stays eager and suspends its
  own tab body so the header shows at once; `CreateItemDialog` lazy inside
  `AddExtraItem` (admin-only, sole `zod`/`react-hook-form` user). Main
  chunk 742 → 289 kB, landing's eager JS ~852 → ~487 kB, no size warning.
- **CFE-040** — Loading and error states for the Menu tab and shopping
  list, built from existing components since no screenshot draws them:
  delayed-fade skeletons (`RecipeCardSkeleton` on desktop, new
  `MobileRecipeRowSkeleton`, skeleton category rows in the panel; shared
  `DELAYED_FADE_IN_CLASSES` in `src/lib/styles.ts`, absorbing `CFE-038`'s
  item). The error shows only on a first-load failure (`StatePanel` +
  Retry for the menu, one line + Retry in the panel); a failed background
  refresh keeps the data. The two surfaces fail independently. Finding 2.
  **Done** (2026-09-27). To re-check: DevTools → Block request URL on
  `GET …/menu` or `…/shopping-list`, Offline for background failures,
  Slow 4G for skeletons.
- **CFE-041** — Menu cache consistency: shared optimistic menu
  mutations with per-change revert, newest-first adds, and recipe deletes
  evicting from the menu. Findings 3, 5. **Done** (2026-09-27), see
  `docs/handoffs/CFE-041.md`.
- **CFE-042** — Shopping-list UI duplication: two quantity editors with
  different validation, the text-field class string copied four times,
  and dead `components/ui/command.tsx`. Findings 6–8. **Done**
  (2026-09-27): both quantity editors filter typing to one shared rule,
  positive, up to 6 digits and 2 decimals (`src/lib/quantity.ts`),
  because recipe rows in g/ml can pass 9999 and the column is
  `NUMERIC(10, 2)`. `FIELD_CLASSES` lives in `src/lib/styles.ts`, shared
  ahead of a second feature caller at the founder's call (expected:
  `CFE-010`'s recipe form); the category `SelectTrigger` keeps its own
  `focus-visible` classes. `command.tsx` deleted.
- **CFE-043** — Housekeeping: migrate older hook tests onto
  `setupQueryClient`; move recipe reference-data keys into `recipeKeys`;
  move `stopEvent` to `utils/` and reuse it in `RecipeCard`; make
  `ConfirmActionDialog`'s `pendingLabel` optional. Findings 9–12.
  **Done** (2026-09-27): 7 of 10 test setups migrated; `useLogout`'s
  `AuthProvider` test, `RecipeGrid`'s remount test and `AppShell` keep
  their own setup (each needs a provider tree the helper doesn't build).
- **CFE-044** — Security headers (CSP, `frame-ancestors`, `nosniff`,
  `Referrer-Policy`) in `vercel.json`. Finding 4. **Blocked on the first
  Vercel deploy**, which itself waits on `crockpot-go` deploying.
  The CSP must allow `res.cloudinary.com` images (cards, detail, the
  edit form's photo), and `blob:` images for `CFE-049`'s local preview;
  uploads go to the API, so no Cloudinary upload origin.

*From the fourth whole-codebase tech-debt pass, 2026-10-02. Full detail:
`docs/findings/2026-10-02-tech-debt.md`.*
- **CFE-050** — Session expiry: a refresh rejected with 401 now ends the
  session through one `endSession` (one toast, `RequireAuth` redirects);
  optimistic rollbacks no longer restore a wiped cache. Finding 1. **Done**
  (2026-10-03), see `docs/handoffs/CFE-050.md`.
- **CFE-051** — Your Crockpot page duplication. Findings 2–3. **Done**
  (2026-10-03). `LoadErrorPanel({ what, onRetry })` replaces the six
  "Something went wrong" panels (`ErrorBoundary`'s Reload panel stays
  separate); `useUndoableRemoval` in `lib/` owns the undo bookkeeping, the
  menu/favourite hooks only pick mutations; `RecipeListGrid`
  (`recipes/components/`) renders rows and cards from one `itemProps` for
  Menu, Favourites and My recipes; `SCROLL_PANE_CLASSES` in `lib/styles.ts`.
  Recipe card grids now pick columns by their own width (container
  queries), not the viewport: `RECIPE_GRID_CLASSES` (2/3/4 at md/52rem/72rem,
  shared with both skeletons) and browse's `ResponsiveRecipeGrid`
  (1/2/3 at 35rem/52rem, pulled in from the branch review). Rollback if a
  width looks wrong: a `gridClassName` prop for Your Crockpot, or a lower
  2-column threshold (~23rem) for browse beside the sidebar.
- **CFE-052** — Recipe-layer drift. Findings 4–6. **Done** (2026-10-09).
  `recipes/utils/recipeListCache.ts` (`withoutRecipe`, `findRecipe`,
  `withRecipeRestored`, `withTotal`, `flipFavourite`, `RecipeSlot`) is the
  one place to patch a cached recipe list; delete and favourite share it.
  `useRecipe(id)` owns the detail query. `HistoryBackLink`
  (`src/components/`) owns history-back-or-follow-the-link, checked at
  click time, and runs a caller's `onClick` first; `canGoBackInApp` is in
  `src/lib/`. `canManageRecipe`/`pendingApprovalViewer` are in
  `recipes/utils/recipePermissions.ts`. Branch review flagged two
  pre-existing issues for the next tech-debt/security pass, not filed:
  `HistoryBackLink` hijacks cmd/ctrl/middle-click (goes back instead of
  opening a new tab); `isSafeRelativePath` lets control characters through
  (`?from=/%09/evil.com`), which a browser strips to `//evil.com` if it
  ever reaches a raw href. Unconfirmed whether react-router encodes it.
- **CFE-053** — Recipe-form housekeeping. Findings 7–12. **Done**
  (2026-10-09). `RECIPE_LIMITS` (`recipes/utils/recipeLimits.ts`) is the
  one copy of the recipe limits the backend enforces; the schema,
  steppers, `CategoryPicker` and copy read it. `byId` (`src/lib/`) builds
  every id-keyed catalogue lookup, and `unitOptionsFor` takes the units
  map. The maps are plain render-time values under the React Compiler,
  not stable per fetch: in `IngredientsSection` they rebuild whenever the
  rows change (~0.01ms), so don't pass one to a memoised child or an
  effect dependency without wrapping it in `useMemo`. `TEXTAREA_CLASSES`
  and `CountHint` serve the form's textareas. `RecipeForm.test` takes a
  retry-free client from `setupQueryClient` but keeps its own router
  (it needs real routes, which `renderWithProviders`' splat can't give).
  Scaffold assets deleted; `useRecipeTimeRange.ts` renamed. Not done:
  `public/favicon.svg` is still Vite's default logo, waiting on a
  Crockpot icon.

### Deferred: future features

- **CFE-015** — Regulars: restock and manage a personal set of catalog
  items from the shopping list panel. **Done** (2026-10-07), see
  `docs/handoffs/CFE-015.md`.

*Descoped from `CFE-010` 2026-10-02 — not sequenced; grill before
starting.*
- **CFE-048** — Recipe drafts: save a half-written recipe and come back
  to it, the "Draft saved" indicator and "Save as draft" button the
  `add` screenshots draw. Must also cover a session ending mid-form:
  since `CFE-050`, `RequireAuth` unmounts the form and its contents are
  lost, and a server draft can't be saved once the session is dead, which
  argues for at least browser autosave. Open:
  browser-only autosave (`localStorage`, one device, create only) versus
  server drafts that follow you across devices — the latter wants
  `crockpot-go` work (draft storage with relaxed validation, and how
  drafts interact with the recipe cap, `mine` listings and approval).

### Bugs
- **CFE-022** — Logging out didn't update the UI until a manual refresh.
  Root cause: `useLogout.tsx`'s `onSettled` called `queryClient.clear()`
  before `setQueryData(AUTH_SESSION_QUERY_KEY, null)` — `clear()`
  destroys and rebuilds the session query with no observer attached to
  the new instance, so the null write landed unseen until something
  unrelated forced a re-render of `AuthContext` (explaining the
  page-dependent flakiness). Fixed by writing `setQueryData` first, then
  `removeQueries` (excluding the auth key) instead of a blanket
  `clear()`, so other logged-in-scoped caches still get wiped without
  orphaning the auth observer. Also added a "Logged out" success toast
  and cursor-pointer fixes on `UserMenu`'s avatar trigger and
  `DropdownMenuItem`. **Done** (2026-09-11).

- **CFE-023** — 'Remove from menu' on the shopping cart sometimes appeared
  before the loading spinner disappeared and the exit animation kicked
  off. **Done** (2026-09-27), fixed in `CFE-007`: the overlay closes on
  confirm and keeps the controls it opened with.

- **CFE-032** — `RecipeDetailPage`'s skeleton flashes on fast
  connections. Root cause: `RecipeDetailPage.tsx:31`
  (`if (isPending) return <RecipeDetailSkeleton />;`) renders the
  skeleton unconditionally on any pending state, so on a fast load the
  browse-page card → skeleton → real content sequence happens in one or
  two frames — jarring rather than reassuring, the opposite of what a
  skeleton is for. Fix direction (not yet grilled): delay showing
  `RecipeDetailSkeleton` until the query has been pending past a short
  threshold (a common pattern — e.g. don't render it before ~150-300ms
  of pending state, and once shown keep it for a minimum duration so it
  doesn't itself flash off after one frame); exact thresholds and
  whether this becomes a shared `useDelayedPending`-style hook (`RecipeGrid`'s
  own loading state may have the same flash risk, worth checking at the
  same time) are a grill question, not decided here. Founder-flagged
  UX regression on already-shipped `CFE-005` work, not a functional bug.
  **Done** (2026-09-19): both skeletons (`RecipeDetailSkeleton`, and
  `RecipeGrid`'s cold-load skeleton) sit inside a CSS-only
  `animate-in fade-in delay-200 duration-150 fill-mode-backwards` wrapper
  (`tw-animate-css`) — invisible for the first 200ms so fast loads never
  show them, faded in on slow ones. No hook or state, no added latency:
  chosen over a JS delay + minimum-display hook, at the cost of a possible
  faint partly-faded skeleton if data lands at ~200–350ms. The next-page
  skeleton row is unchanged (it has its own `motion` entrance). Not
  built: a card-seeded hero (render the cached browse card's fields
  instantly, skeleton only for ingredients/instructions) — the bigger
  option if the detail page's cold load ever needs to feel better still.

  **CFE-033** - (manually added by Francis) Browse page recipe card entry animations need some refining. Looks nice when landing on the page but:
  - I think we're loading in 10 recipes instead of 9 which means the rows of 3 looks odd.
  - If we return to the browse page from the recipe detail page, the animations can go all over the place. It would be better to only do it when landing at the top for the first time, or when we load more recipes by scrolling down

  **Done** (2026-09-19). The client sent no `limit`, so the server default of 20 applied (not 10) — now 12 per page (divides into 1/2/3 columns). `RecipeGrid` renders cards already cached at mount settled (`initial={false}`); first loads, filter changes and new pages still animate.

- **CFE-035** — Founder-reported minor bug (2026-09-19): rapidly
  clicking the browse card's cart button can navigate to the recipe
  detail page instead. Not yet investigated. Hypothesis to check, not a
  finding: the button sits inside the card's `Link`, and every handler in
  `useAddToMenuButtonState` calls `stopEvent` — so a click that never
  reaches a handler (the button is `disabled` while the menu is pending
  or mutating, or the click lands mid-swap while `AnimatePresence`
  exchanges the cart and cancel buttons) would fall through to the
  `Link`. Needs a repro before a fix direction is picked.

  **Done** (2026-10-09). A click inside the composition that missed an
  enabled button reached the `Link`. That covers gaps, separators, the
  slot `AnimatePresence mode="wait"` empties mid-swap, and disabled
  buttons. Fix: `role="presentation" onClick={stopEvent}` on
  `AddToMenuButton`'s root and on `MobileRecipeRow`'s action cluster.

- **CFE-036** — Founder-reported minor bug (2026-09-19): scrolling to the
  bottom of the browse page fast enough to trigger the infinite scroll
  can leave it stuck, needing a scroll up and down to load the next
  page. **Done** (2026-09-19). Cause (confirmed from a console trace):
  `RecipeGrid`'s observer callback dropped an in-view event via the
  500ms trigger debounce, which counted from the trigger not the
  response; an `IntersectionObserver` only reports changes, so with the
  sentinel still in view nothing re-fired. Fix: sentinel visibility is
  state and an effect fetches when it is in view, a next page exists and
  nothing is in flight; debounce and ref bookkeeping removed; prefetch
  margin widened from 200px to one viewport (`PREFETCH_MARGIN`) so the
  next page usually lands before the user reaches the end. A rest-based
  gate (fetch only once scrolling stops) was tried and removed: it
  stopped chained pages on hard flings but put a visible pause at the
  end of every scroll. If hard flings chaining several pages ever needs
  limiting, a velocity-aware gate (defer only above a scroll-speed
  threshold) is the untried option.

- **CFE-037** — Infinite lists keep loaded recipes and show an inline
  retry when a later fetch fails (Browse, Favourites, Library). Browse
  replaces the whole grid with the "Something went wrong" panel because
  `RecipeGrid`'s `isError` branch also fires when `data` already holds
  loaded pages (surfaced while testing `CFE-036`); Favourites and Library
  keep their cards but fail silently, with only a scroll-away-and-back
  retry. Grilled 2026-10-09 (cheap to undo, AI-driven).
  - **Acceptance criteria**
    - [ ] `LoadMoreSentinel` in `src/components/` (renders the sentinel,
      or the retry row in its place): one centred row, muted
      "Couldn't load more recipes." + small outline `Button` "Retry",
      `src/index.css` tokens only; fixed copy, since every list holds
      recipes and `LoadErrorPanel`'s `what` ("your favourites") doesn't
      read after "more". No Claude-Design spec (founder call).
    - [ ] Shown when `isError`, recipes are loaded, `hasNextPage` and
      not `isFetching`, in place of the sentinel (a failed last-page
      refresh shows nothing: Library's `loadMore` no-ops without a next
      page, so Retry would be dead); the full `LoadErrorPanel` stays for
      `isError` with no recipes. Plain `isError`, not `isFetchNextPageError`: a failed
      stale-list refetch in Favourites also blocks paging.
    - [ ] Retry calls the list's `loadMore()` (Favourites' refetches a
      stale list or pages on, `useFavourites.ts`).
    - [ ] `useLoadMoreOnSentinel` moves to `src/lib/` beside
      `useSentinelInView` (second feature caller), test moving with it.
      After a failure it never loads on its own (Retry is the only way
      back; the scroll-away-and-back retry is gone), and
      `useSentinelInView` ignores observer reports that land after
      unmount — together they stopped a fetch/toast loop when Retry
      failed fast with the backend off. `RecipeGrid` adopts it with a `loadMore` shaped like
      `useLibraryRecipes`' (`isFetching || !hasNextPage` → return).
    - [ ] Browse: a failed page 2 keeps page 1's cards and shows the row;
      no repeat request while the sentinel stays in view (rewrites "does
      not retry a failed page fetch…", which today awaits the panel);
      Retry requests page 2 and its cards appear.
    - [ ] Browse: a failed filter change (first page of a new key, with
      `keepPreviousData`) still shows the full panel — confirm by test
      that placeholder data is dropped on error.
    - [ ] Favourites and Library: a failed next page keeps the cards and
      shows the row; Retry loads the page.
  - **Non-goals**: auto-retry/backoff (`retry: false` stays global); any
    change to first-load error or skeleton states.
  - **Verification**
    - Logic, failing test first: `npx vitest run RecipeGrid
      FavouritesPage MyRecipesPage useLoadMoreOnSentinel` (hook test now
      in `src/lib/`), then
      `npm test`.
    - Visual + interactive, founder on `npm run dev`: in each list, load
      page 1, stop `crockpot-go`, scroll to the end → row under the
      loaded cards; restart `crockpot-go`, click Retry → next page loads
      and the row goes. Commit message offered with that hand-over.
