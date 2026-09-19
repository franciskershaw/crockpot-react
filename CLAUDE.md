# Crockpot Frontend

Follows the global development process — see `~/.claude/CLAUDE.md`.

## Reference projects

- **API**: `../crockpot-go` — its `docs/specs/master-spec.md` is the
  source of truth for endpoints, tier rules, and auth model. Check it
  before assuming a request/response shape.
- **Architectural reference**: `../../packing-list/packing-list-react` —
  prior React project by the same author; tooling, testing posture, and
  the design-artifact-grounding rule below are reused deliberately from
  its `CLAUDE.md`/`LESSONS.md`.
- **Design reference**: `../screenshots/` (not committed — Claude-Design
  reskins, listed in `docs/specs/master-spec.md`). Desktop and one mobile
  breakpoint; not pixel-perfect or final UX.

## Stack

- Vite + React + TypeScript, `react-router-dom` v7
- UI: shadcn/ui (Radix + Tailwind, owned/customized code, not a
  black-box dependency)
- State/data: TanStack Query
- Forms: React Hook Form + Zod
- Icons: lucide-react
- Images: Cloudinary upload widget, client-side direct upload
- Auth: Google OAuth + email/password against `crockpot-go`'s JWT
  access/refresh model — access token in memory, refresh via httponly
  cookie on `api.crockpot.app`

Full rationale for the framework choice (Vite SPA over Next.js/Astro) and
every other decision above: `docs/specs/master-spec.md`.

## Tooling

- Format: Prettier + `@ianvs/prettier-plugin-sort-imports`
- Lint: oxlint, **a11y rule set enabled**
- Pre-commit: husky + lint-staged
- Tests: Vitest + Testing Library (suggestion-only, not a gate yet — flag
  a test when logic has real branching/state transitions/edge cases a
  refactor could silently break; skip trivial passthrough or pure
  presentational markup). Shared test infra lives in `src/test/`: build
  `RecipeCard`/`RecipeDetail` test data with `buildRecipeCard`/
  `buildRecipeDetail` (`recipeFixtures.ts`), never a hand-copied literal.
- Hosting: Vercel

## Feature folder layout (hard rule, not a suggestion)

Every `features/<name>/` folder splits into four buckets, classified purely
by *what a file is* — never by domain/concern, which requires a judgment
call on every new file and drifts the moment two people (or two sessions)
guess differently:

- `pages/` — a component `AppRoutes.tsx` routes to directly. Mechanical
  test: does a `<Route>` element point at it?
- `components/` — every other `.tsx` component.
- `hooks/` — every `use*.ts`/`use*.tsx` hook.
- `data/` — `api.ts`, `types.ts`, `queryKeys.ts` (each a singleton per
  feature). Strictly these three file kinds — any other single-purpose
  file with no natural bucket (e.g. `auth/googleLogin.ts`) stays loose
  at feature root instead, not in `data/`.

Tests colocate next to the file they cover, in whichever bucket that file
lands in (`components/RecipeCard.tsx` + `components/RecipeCard.test.tsx`).

**One named exception**: a React Context module that pairs a `Provider`
component with its own `use*` hook in one file (e.g. `AuthContext.tsx`)
stays a single file in `components/` — a `Provider` is fundamentally a
component, and splitting the pair across buckets to satisfy this rule
would be a real code change, not a pure reorg. Only worth its own
`contexts/` grouping once a feature has 2+ real contexts — one file
doesn't justify a folder (checked project-wide at `CFE-031`: `AuthContext`
is currently the only real one anywhere in the app).

Applied to `recipes` (33 → 5 root files) and `auth` (11 → 3) at `CFE-004`
close-out, once `recipes` had grown genuinely unmaintainable (grill-me
2026-09-05, rejected an earlier by-concern proposal — `filters/`+`browse/`
— for the same judgment-call problem this rule exists to avoid). Applies
to every feature from its first ticket forward, not just at the point it
gets messy — the whole point is organizing as you go rather than sorting
out after the fact. `data/` bucket added, and retrofitted to `auth`/
`menu`/`recipes`, at `CFE-031` (2026-09-18) — a founder preference
against loose root files, not a technical requirement. `landing` brought
into line with the `pages/`+`components/` split the same day, having
been flat since `CFE-003` by accident of timing, not by design.

**Second named exception**: a tight cluster of components that only
exist because of each other — sub-components with no other caller,
extracted purely to share code between two or more parent components —
may live in their own subfolder under `components/` (e.g.
`components/add-to-menu/`), rather than flat alongside unrelated files.
Narrower than the rejected `filters/`/`browse/` proposal above: that was
a broad thematic split across many files with a fuzzy boundary ("is this
a filter thing or a browse thing?"); this applies only when "does this
file exist solely to support this one other component" has an
unambiguous yes/no answer for every file in the folder, *and* every
caller stays inside the same top-level feature. First applied at
`CFE-020` (2026-09-07): `add-to-menu/` held `AddToMenuButton` (browse
card), `AddToMenuCTA` (recipe detail hero), and the
`AddToMenuStepperControls`/`AddToMenuConfirmButton`/`AddToMenuBadge`
pieces shared between those two. **Dissolved at `CFE-031`** once
`AddToMenuCTA` moved into the new `recipes-detail/` feature: the cluster
was no longer self-contained (a caller now sat outside the folder, in a
different top-level feature), so it flattened into shared
`recipes/components/` rather than being renamed — a name scoped to
either remaining caller would be equally misleading, since both still
need the shared pieces. Rejected the same day: folder-per-component as a
default regardless of size — a folder holding one file is less scannable
than the file alone, and a shared name prefix (`AddToMenu*`, `Recipe*`)
already signals the grouping without one.

**Splitting an oversized feature by page**: when a feature's
`components/`/`hooks/` bucket exceeds ~15 files *and* splits cleanly by
"which routed page exclusively imports this" (mechanical, grep-able —
not the by-concern judgment call rejected above), split the feature into
page-specific sibling features, each with their own four buckets. Keep
only 2+-page-consumer files (including `data/`) in the original folder
as the shared core. Pre-emptively moving a single-consumer file into
that shared core (ahead of today's import graph) needs a backlogged
ticket that will actually need it, not a guess: logic (hooks) is
low-risk to move on a single such ticket, since its shape won't change
based on who calls it; a presentational component should wait for its
own second real caller *unless multiple* backlogged tickets converge on
the same need — a stronger signal than one ticket's guess. First applied
at `CFE-031` (2026-09-18): `recipes/` → `recipes/` (shared) +
`recipes-browse/` + `recipes-detail/`, named to keep alphabetical
grouping in a directory listing (`recipe-detail/`, singular, would sort
*before* `recipes/`; `recipes-detail/` sorts after it, alongside
`recipes-browse/`). `RecipeCard`/`RecipeCardSkeleton` moved pre-emptively
on the multi-ticket signal (`CFE-006`/`007`/`008` all need a
recipe-card-shaped display); `useRecipePermissions`/`useDeleteRecipe` on
the single-ticket (`CFE-008`) logic case. Kept bare `recipes/` rather
than renaming to `recipes-shared/` or similar: consistent with `auth`'s
bare name for its own cross-cutting layer, and merging `recipes-browse/`
back into it would put `components/` back over the 15-file threshold
that justified the split.

## Shared `src/components/` layout

Same single-consumer-lives-with-its-consumer principle as the feature
buckets above, applied one level up:

- `ui/` — shadcn-generated primitives, regenerated/customized in place.
- `nav/` — `AppShell` and anything with no caller outside it (e.g.
  `RouteFallback`, moved here at `CFE-031` despite reading as generic in
  *nature* — its one real caller decided the question, not its abstract
  kind).
- `app/` — mounted only by `App.tsx` itself (`ErrorBoundary`,
  `ScrollToTop`); root wiring, not reusable UI. Added at `CFE-031`.
- Root — genuinely reusable across 2+ features (`Logo`, `StatePanel`). A
  file with exactly one real consumer belongs with that consumer, not
  here, regardless of how generic it feels — `GoogleIcon.tsx` moved into
  `features/auth/` at `CFE-031` on this basis (single consumer, and
  inherently auth-domain iconography alongside `googleLogin.ts`).

## Design-artifact grounding (hard rule, not a suggestion)

Never assess or comment on design match from the screenshot's absence, a
similar-looking neighbour, or memory of a prior render in a different
conversation — always work from the actual current PNG in
`../screenshots/`. If a screen's state isn't covered by an existing
screenshot, say so explicitly rather than guessing at layout. The
developer runs `npm run dev` (and `crockpot-go` locally) and checks
rendered UI themselves — don't start, poll, or drive a dev server to
self-verify visual work.

**Before writing markup for any visually-significant component not
already covered by an exact token spec** (new screen, new filter/form
UI, anything beyond a copy or logic tweak to existing styled markup):
stop and ask the developer for a Claude-Design spec dump (fonts,
weights, sizes, exact hex colors, spacing, shadow/border construction)
rather than proceeding from a screenshot's layout plus judgment calls.
Screenshots ground layout and content; they are not precise enough for
pixel-level styling, and guessing at it from them has repeatedly
produced visible mismatches later corrected by hand (recipe card
typography and shadow construction, then the entire filter/search
system — both CFE-004, 2026-09-04). Getting the spec dump first is
cheaper than a rebuild after the fact.

## Docs

- `docs/specs/master-spec.md` — living spec + ticket backlog
- `docs/handoffs/CFE-NNN.md` — one per ticket
- `docs/findings/YYYY-MM-DD-tech-debt.md` — dated tech-debt/production-
  readiness findings docs, one per audit pass (mirrors `crockpot-go`'s
  `docs/findings/` convention). Started 2026-09-04, ahead of the first
  full whole-codebase pass — see `~/.claude/CLAUDE.md`'s periodic-passes
  rule and the `tech-debt` skill.
- `LESSONS.md` — retro log, reviewed each kickoff/grill-me
