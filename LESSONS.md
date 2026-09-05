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

## 2026-08-28 — CFE-002a — Auth session/guard/Google login. Clean code; friction was test-wrapper + dev data.

- Code went in smoothly, one commit per roadmap unit, test-first. Two
  small self-inflicted snags:
  - `useLogout` hook test failed first run — `gcTime: 0` copied from
    `renderWithProviders` into the `renderHook` wrapper GC'd the
    directly-seeded session cache before the assertion (`undefined` vs
    `null`). `renderWithProviders` gets away with it because its tests
    mount real query observers; a hook test that seeds cache with no
    observer must not.
  - `types.ts` shipped `name: string` when the handoff's own `User`
    decision said `string | null`; caught at test-writing, one-line fix.
- The interactive round-trip "failure" (~1h across both repos) was not a
  code bug: a stale password-user row for the founder's own email in the
  Neon dev DB (from testing `crockpot-go`'s `/auth/register`) tripped
  `GetOrCreateUser`'s deliberate `ErrEmailRegisteredWithPassword` guard.
  `DELETE FROM users` fixed it.
- **Pattern**: when a live OAuth/identity flow fails *after* consent,
  check the dev DB's user table for a conflicting row before suspecting
  code or provider config — especially when the same email is used to
  exercise the paired backend's other auth paths.

## 2026-08-29 — CFE-003 — Landing page + palette + fonts. Good outcome; two grill misses cost rework.

- Palette went in clean because the grill got exact hex from Claude
  Design (the tool that made the mockups). Fonts didn't — the grill
  eyeballed Fraunces + Newsreader off the screenshots; the real pairing
  was Newsreader (serif) + Karla (sans), corrected mid-build with docs
  churn. Also: my Google Fonts `css2` URL was malformed (invalid
  multi-tuple), 400'd silently, and a stale cache masked it.
- The grill asserted "the old app's nav is a different component" without
  opening it. It wasn't — one auth-branched `Navbar` / `BottomMobileNav`
  — so the nav components were rebuilt as shared (`components/nav/`)
  after the founder caught it.
- Deliberate divergences from the mockup, all recorded in the handoff:
  mobile "Three steps" carousel (shadcn/Embla, manual), no Pro card
  (`crockpot-go` spec: PRO unmarketed), recipe cluster beside pricing.
- **Pattern**: for a design-tool-generated mockup, pull the
  machine-readable specs (fonts, palette, spacing) from the tool up
  front — don't reverse-engineer from screenshots. And in a grill,
  don't assert "the old app does X" without opening the file — that's
  the claim-check the process already asks for.

## 2026-09-05 — CFE-004 — Time-range slider + feature-folder reorg + code-review fixes. Slider clean; reorg script had a real bug.

- Pausing for an exact Claude Design spec dump before writing the
  slider's markup (per this project's design-grounding rule) paid off —
  zero rework, unlike this ticket's earlier card/filter-system rebuilds.
- The reorg's import-fixing script had a relative/absolute path bug that
  silently produced wrong-but-plausible import paths, and its `from`
  regex never touched `vi.mock()` target strings at all — both only
  surfaced by running the real build/tests, not by the script's own
  success output.
- **Pattern**: after any bulk find-and-replace across source files,
  verify with the project's actual build/typecheck command (`tsc -b` /
  `npm run build` here — plain `tsc --noEmit -p .` is a silent no-op on
  a solution-style tsconfig) and grep separately for `vi.mock(` targets,
  since a regex over `from "..."` imports won't catch them.

## 2026-09-05 — Tech-debt pass #1. 9 findings, 4 tickets. Fork identity confusion on the first audit attempt.

- First whole-codebase pass, covering everything shipped through
  `CFE-004` (scaffold, auth, landing, browse/search + `AppShell`).
  9 new findings (error boundary, silent-blank query failures, untested
  auth-refresh logic, `useLogout` toast-wrapper drift, import-style
  drift, duplicated toast boilerplate, a redundant Radix dep, a
  double-fetch of filter reference data, missing image lazy-loading) plus
  one carried-forward item (no route-based code splitting, seeded
  2026-09-04). Grouped into `CFE-016`–`CFE-019`. Full detail:
  `docs/findings/2026-09-05-tech-debt.md`.
- The first audit attempt used a forked subagent (`Agent` with
  `subagent_type: "fork"`) to keep the file-by-file read-through out of
  the coordinator's context. It never did the read: because a fork
  inherits full conversation history *including the coordinator's own
  act of spawning it*, the fork's later turns lost track of which side
  of that spawn it was on and replied as if it were the coordinator,
  still waiting on a sub-fork of its own that didn't exist — twice, even
  after being told directly "you are the fork." Switched to a plain
  fresh `general-purpose` agent (no inherited context, just the audit
  brief) and it completed correctly in one pass (83 tool uses).
- **Pattern**: don't use `subagent_type: "fork"` for a task whose prompt
  itself describes the act of delegating/spawning — a fork's inherited
  history can make it misidentify itself as the delegator rather than
  the delegate. Reserve forks for research/work that doesn't need to
  reason about its own dispatch; use a fresh agent when the task
  description would otherwise read as being about agent-spawning itself.
