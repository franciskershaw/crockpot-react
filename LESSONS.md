# Lessons

Running retro log for this repo. One entry per ticket close-out: what
caused rework (if anything), what pattern should become a standing rule,
and whether this file or the project's own `CLAUDE.md` needed a new line
as a result. Reviewed at the start of every new ticket's `grill-me` and at
project kickoff.

## 2026-08-11 — Kickoff

Project set up via `project-kickoff`, alongside `crockpot-go` in the same
session. The framework decision (Vite SPA vs. Next.js vs. Astro) got real
back-and-forth before landing: Next.js ruled out on stated developer-
experience friction plus a genuine cold-start concern for any Vercel
function proxying to the Go API; Astro considered seriously (would give
real SSR/SEO for recipe pages via ISR, and runs on Vite under the hood so
the switching cost either direction is moderate, not extreme) but deferred
in favour of shipping the simpler single-framework Vite SPA now — with an
explicit constraint recorded in the master spec (thin, router-decoupled
data-fetching on the 3 SEO-relevant pages) so that deferral doesn't
quietly foreclose the option later. Lesson: for a framework choice with a
real, boundable migration cost either direction, it's worth designing the
"cheap to change later" constraint into the spec rather than treating the
decision as fully closed. No code written yet.

## 2026-08-28 — CFE-001 — Project scaffold. Clean ticket.

- No rework. Founder hand-implemented and went a little past the ticket
  (http client + TanStack wrappers ported early from CFE-002) plus a few
  deliberate naming/dependency calls — all captured in
  `docs/handoffs/CFE-001.md`'s "Deltas from the plan" section, since none
  was a mistake or a reusable pattern.
- Prettier was rewrapping the hand-wrapped Markdown docs and breaking
  list rendering in preview; added `*.md` to `.prettierignore`.
- **Pattern**: none.
