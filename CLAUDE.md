# Crockpot Frontend

Follows the global development process — see `~/.claude/CLAUDE.md`.

**Not deployed yet.** This is a ground-up rebuild that has never been
deployed. Production is still the old Next.js/MongoDB app (`../../crockpot`).
Every "slow", "timeout" or payload-size observation comes from local dev
(`localhost` against Neon). No nginx, CDN or hosting layer sits in front of
it yet, so a fix has to work in this code. "Deployment"/"Hosting" below
describe the plan.

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
- Images: Cloudinary, uploaded via `crockpot-go` in the multipart
  recipe save (`CROC-040`); render sized `f_auto,q_auto` delivery URLs
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
- Hosting (planned, not yet live): Vercel

## Folder layout (hard rule, enforced by `src/test/folderLayout.test.ts`)

No loose files at the root of `src/components/` or of any
`src/features/<name>/`. The guard test fails the suite if one appears.
Every folder below is chosen by *what a file is*, never by which part of
the product it serves, so placing a new file is never a judgment call.

### Inside a feature: five buckets

- `pages/` — a component a `<Route>` in `AppRoutes.tsx` points at.
- `components/` — every other `.tsx` component.
- `hooks/` — every `use*.ts`/`use*.tsx` hook.
- `data/` — only `api.ts`, `types.ts`, `queryKeys.ts`.
- `utils/` — every other non-React module (no JSX, no hooks), including
  shared class-string constants (`styles.ts`).

Tests sit next to the file they cover. Two exceptions:

- A Context module pairing a `Provider` with its `use*` hook stays one
  file in `components/` (e.g. `AuthContext.tsx`).
- Components that exist only to serve one other component, with every
  caller in the same feature, may share a subfolder of `components/`.

When a feature's `components/` or `hooks/` passes ~15 files and splits
cleanly by which routed page imports each file, split it into sibling
features named `<feature>-<page>` (e.g. `recipes-browse/`), keeping
files used by 2+ pages in the original folder.

### Shared `src/components/`

A file used by one feature lives in that feature. Only files used by 2+
features (or by the app shell) come here, and each goes in one folder:

- `ui/` — shadcn primitives, customised in place.
- `app/` — root wiring mounted only by `App.tsx`.
- `nav/` — the app shell and links that move between pages.
- `brand/` — logos and brand marks.
- `feedback/` — loading, empty, error, retry and undo states.
- `overlays/` — dialogs and sheets opened over the page.
- `form/` — input controls and field wrappers.

If a new shared component fits none of these, stop and ask. Don't put it
at the root, and don't create a new folder for it unasked.

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
