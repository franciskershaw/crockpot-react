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

## Design-artifact grounding (hard rule, not a suggestion)

Never assess or comment on design match from the screenshot's absence, a
similar-looking neighbour, or memory of a prior render in a different
conversation — always work from the actual current PNG in
`../screenshots/`. If a screen's state isn't covered by an existing
screenshot, say so explicitly rather than guessing at layout. The
developer runs `npm run dev` (and `crockpot-go` locally) and checks
rendered UI themselves — don't start, poll, or drive a dev server to
self-verify visual work.

## Docs

- `docs/specs/master-spec.md` — living spec + ticket backlog
- `docs/handoffs/CFE-NNN.md` — one per ticket
- `LESSONS.md` — retro log, reviewed each kickoff/grill-me
