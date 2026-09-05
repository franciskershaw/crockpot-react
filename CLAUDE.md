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
  presentational markup)
- Hosting: Vercel

## Feature folder layout (hard rule, not a suggestion)

Every `features/<name>/` folder splits into three buckets, classified purely
by *what a file is* — never by domain/concern, which requires a judgment
call on every new file and drifts the moment two people (or two sessions)
guess differently:

- `pages/` — a component `AppRoutes.tsx` routes to directly. Mechanical
  test: does a `<Route>` element point at it?
- `components/` — every other `.tsx` component.
- `hooks/` — every `use*.ts`/`use*.tsx` hook.
- Feature root — `api.ts`, `types.ts`, `queryKeys.ts` (the data layer,
  each a singleton per feature) plus any other single-purpose top-level
  file with no natural bucket (e.g. `auth/googleLogin.ts`).

Tests colocate next to the file they cover, in whichever bucket that file
lands in (`components/RecipeCard.tsx` + `components/RecipeCard.test.tsx`).

**One named exception**: a React Context module that pairs a `Provider`
component with its own `use*` hook in one file (e.g. `AuthContext.tsx`)
stays a single file in `components/` — a `Provider` is fundamentally a
component, and splitting the pair across buckets to satisfy this rule
would be a real code change, not a pure reorg.

Applied to `recipes` (33 → 5 root files) and `auth` (11 → 3) at `CFE-004`
close-out, once `recipes` had grown genuinely unmaintainable (grill-me
2026-09-05, rejected an earlier by-concern proposal — `filters/`+`browse/`
— for the same judgment-call problem this rule exists to avoid). Applies
to every feature from its first ticket forward, not just at the point it
gets messy — the whole point is organizing as you go rather than sorting
out after the fact.

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
