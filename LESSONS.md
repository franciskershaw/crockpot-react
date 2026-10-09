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

## 2026-09-06 — CFE-016–019 — Tech-debt pass #1 shipped clean; code review before close-out caught two silent defects.

- No rework between commits — the only rework came from a pre-close-out
  code review run after all four tickets were "done": a dead
  `prefers-reduced-motion` CSS override (Tailwind v4's `utilities` layer
  always outranks `base`, so the override never applied) and
  lazy-splitting all 4 routes when only the one carrying the actual
  bundle-bloat dependency (`motion`) needed it.
- **Pattern**: verify a hand-written CSS override against a
  Tailwind-generated utility by inspecting the compiled output's
  cascade-layer order — placement in `@layer base` loses to `utilities`
  regardless of media-query specificity, so a built-in variant
  (`motion-reduce:`, etc.) is safer than a hand-rolled override.

## 2026-09-08 — CFE-020 — Add-to-menu quick action. Shipped clean overall; three separate small process misses, each corrected mid-ticket.

- **TDD "red" misapplied for two pieces.** Pieces 2–3 treated "module
  doesn't exist yet" (an import crash) as a valid failing test; founder
  corrected it ("that's not 'fail for the right reason', it's a
  meaningful failure you solve in the next pass") and pieces 4+ used
  real stubs with genuine assertion-diff failures instead. Pieces 2–3
  weren't redone retroactively (founder's call: not worth the churn).
- **A simplify pass added complexity while locally looking cleaner.**
  Splitting `AddToMenuButton.tsx` into three single-use sub-components
  (`CartIconToggle`/`ServingStepper`/`ConfirmButton`) grew the file
  280→290 lines once prop-interface and call-site overhead were counted
  — caught by the founder eyeballing the line count, not by the
  simplify pass itself. Reverted the split, kept the genuinely-good part
  of that pass (the `useAddToMenuButtonState` hook extraction, which
  *did* shrink the component, to 216 lines). **Pattern**: a component
  split only pays for itself with real reuse; a sub-component rendered
  from exactly one call site is organizational, not simplifying — check
  the line count before and after, don't assume extraction ⇒ smaller.
- **Porting UI from a token-less codebase quietly imports its hardcoded
  colors.** The old app's `AddToMenuButton.tsx` has no design-token
  system, so its `green-600`/`gray-100`...`gray-800` came along
  unexamined; took three founder-driven rounds (missing hover
  consistency + cursor, wrong green, then a second green that read as
  "mud" at badge scale) before landing on this project's actual
  `--success` token. The founder named the standing preference for the
  first time here — colors should come from `src/index.css`'s tokens,
  not be hardcoded — despite the token system existing since
  `CFE-003`/`CFE-004`. Now a saved memory
  (`feedback_use_config_colors_not_hardcoded`); remaining instances in
  this file (`gray-*` on the stepper/cancel controls) seeded as tech
  debt rather than fixed piecemeal, see master-spec.
- **This project's own `/code-review` skill, run at close-out, consumed
  ~63% of a session's usage in ~15 minutes** before the founder flagged
  it as abnormal. Its architecture (8 parallel review angles → dedup
  candidates → one parallel verification fork per surviving candidate)
  is expensive by design, not confirmably a bug — but for a diff this
  size (a handful of new files, one modified component) that cost
  wasn't worth it. Stopped the run, reviewed the same diff externally
  via Cursor's Bugbot + security pass instead, which found 2 real
  issues (a menu-fetch-error UI state bug, a cross-user query-cache
  bleed on logout) for a fraction of the cost. **Pattern**: for a
  small, mechanical diff, an external lightweight review tool is worth
  trying before this project's own multi-agent `/code-review` — reserve
  the heavier tool for larger or riskier diffs where the extra
  verification depth is actually buying something.

## 2026-09-08 — CFE-021 — Match/ranking badges + seed wiring. Clean ticket.

- No rework — every TDD stub failed for the right reason, no locked-test
  violations. Grilled scope grew twice from checking real sources
  (`CROC-042`'s seed-ownership assumption against what `CFE-020` actually
  shipped; real category-distribution data surfacing the star-suppression
  rule) rather than from the ticket's own original text.
- **Pattern**: a recorded grill plan can go stale by build time — check
  current source per piece, not just the plan. Cut a planned
  `BrowseRecipesPage`→`RecipeGrid` prop hop once `RecipeGrid` turned out
  to already receive the full `params` object.
- **Pattern**: a ticket's own seeded tech-debt note can drift stale
  within the same branch (7→8→9 files, as later pieces added their own
  copies) before the ticket even closes — recount at close-out, not just
  at write time.

## 2026-09-18 — CFE-005 — Recipe detail page. One guess-based fix needed a redo; rest was clean.

- The instruction-number alignment fix guessed a padding-top pixel value
  from font-metric math instead of reaching for CSS's own `items-baseline`
  alignment — wrong on the first pass, corrected only after the founder
  sent a screenshot.
- **Pattern**: for a first-line/badge alignment problem, reach for
  `items-baseline` (or the equivalent CSS-native mechanism) before
  guessing a padding/margin pixel value — a guess can look close in
  isolation but won't hold across content variations (single-line vs.
  multi-line instructions here).

## 2026-09-18 — CFE-031 — Feature-folder reorg (recipes split + data/ bucket + follow-on cleanup). Mode switched mid-ticket; two grill-time corrections, no rework after landing.

- Grilled hand-written, switched to AI-driven partway through once the
  founder hit real friction on import-editing volume — clean handoff, no
  rework from the switch itself. Grill-time corrections: a grep
  false-positive (`RecipeCard` substring-matched the unrelated
  `RecipeCardPlaceholder`) wrongly called it browse-only, corrected once
  the founder pushed back with a concrete future-reuse claim; the
  `add-to-menu/` folder's "tight cluster" exception broke once
  `AddToMenuCTA` moved to a different top-level feature, so it flattened
  rather than being renamed.
- The `vi.mock()` trap `CFE-004` flagged (2026-09-05) recurred twice
  more: a bare `vi.mock("../x", ...)` string is invisible to `tsc`
  (only the `importOriginal<typeof import("../x")>()` generic form is
  type-checked), so a stale mock target fails silently rather than
  loudly. The handoff doc's own explicit grep-for-`vi.mock` verification
  line — not trust in `tsc -b` alone — is what caught both instances.
- **Pattern**: checking whether a component is actually used anywhere
  needs a word-boundary/JSX-usage grep (`<ComponentName\b`), never a
  bare substring — a same-prefixed but unrelated component will
  false-positive silently.

## 2026-09-18 — Tech-debt pass #2. 7 findings, 4 tickets. One live numbering collision, worked around.

- Second whole-codebase pass, covering everything shipped since pass #1
  (`CFE-005`, `CFE-020`, `CFE-021`, `CFE-022`). 7 findings — 2 reopened
  from pass #1's seeded notes (hardcoded colors on `AddToMenuButton`,
  narrower than feared; the duplicated `RecipeCard` test fixture, grown
  9→15 files) plus 5 new (duplicated serves-clamp logic across two
  tickets' hooks, a new a11y lint violation, duplicated icon-button
  classes across three hero actions, an uncancelled `setTimeout` in
  `FilterOptionList`, a missing regression test for an already-shipped
  bug fix). Grouped into `CFE-027`–`030`. Full detail:
  `docs/findings/2026-09-18-tech-debt.md`.
- While the audit agent was running, the founder appended a new bug
  entry directly to `docs/specs/master-spec.md`, claiming `CFE-023` —
  the same number this pass had already assigned its first ticket.
  Caught by the Edit tool's own stale-file warning (it flags when a file
  changed on disk since last read), not by any check of mine before
  writing. Renumbered this pass's tickets to `CFE-027`–`030` to leave
  headroom rather than collide, and left the founder's in-progress entry
  untouched.
- **Pattern**: ticket numbers are a shared, mutable resource the founder
  can be actively writing to while an agent works — re-read the
  backlog's current tail immediately before assigning new ticket
  numbers, don't reuse numbers computed at the start of a long-running
  pass.

## 2026-09-19 — CFE-033 — Browse page size + card-animation replay. Clean.

- Two independently-reversible fixes, each red-then-green; no rework. Reading the code first corrected the ticket's premise (server default was 20, not 10).

## 2026-09-19 — CFE-027 — Shared RecipeCard/RecipeDetail test fixtures + `useMenuEntry` regression test. Clean.

- 15 files migrated; suite and `tsc -b` green before and after. The finding's file paths had gone stale after `CFE-031`'s reorg, so the file list was re-derived by grep rather than trusted. Divergent per-file defaults were kept as thin local wrappers so no assertion changed. The regression test was mutation-checked (removing `|| isError` fails it).

## 2026-09-19 — CFE-034 (with CFE-028/030) — Lint-warning cleanup bundle. One hollow test caught and deleted; rest clean.

- oxlint 16 → 9; the 9 left are each owned or deliberate (recorded in the spec). The whole-project warning list, not the 3 I'd seen earlier, is what made the "which are worth fixing" sort possible.
- A drafted "no scroll after unmount" test passed before any fix (`sectionRef.current?.` is already null after unmount), so it was deleted instead of kept. A first fake-timer attempt timed out rather than failing on an assertion, which isn't a valid red; copying the repo's existing `SearchBar` test setup fixed it.
- **Pattern**: a debounce effect that deliberately omits `onChange`/`value` from its deps is what `useEffectEvent` (React 19.2) is for; don't add the deps or suppress the lint rule.

## 2026-09-19 — CFE-029 — Shared bounded-serves hook + icon-button classes. Clean code; one rule-following miss that cost a layout rework.

- The serves hook went pin-test → red stubbed tests → green; pinning first exposed a stale-value quirk (a removed recipe kept its last menu serves), fixed as an approved behaviour change. `useAddToMenuButtonState` had no test for the effect being replaced, so the pin was necessary, not optional.
- I placed two new helper files loose at a feature root because `CLAUDE.md` explicitly allowed it, without flagging that the same file records your preference against loose root files. You caught it; the fix was a `utils/` bucket and moving the existing loose files in, which left every feature root empty. Moving files also broke a type-only import that vitest couldn't see (only `tsc -b` did) and two bare `vi.mock` strings.
- **Pattern**: when a rule permits an exception, check the rest of the same document for a stated preference against it before relying on the exception, and flag the tension instead of choosing silently. After any file move, `tsc -b` and a grep of `vi.mock` strings are the gate, not `vitest run` alone.

## 2026-09-19 — CFE-036 — Infinite-scroll stall. Diagnosed first, then one added-and-removed gate.

- A temporary console trace, run by the founder in the real browser, identified the cause before any fix (a debounce that dropped an in-view event whose observer never re-fired). The fix then went red-to-green on a fake `IntersectionObserver` that only reports when told to.
- The state-driven fix removed the old debounce, which had been rate-limiting chained fetches by accident. A rest-based gate then stopped the chaining but moved the fetch start from before the user reaches the end to after they stop, which cost the prefetch that makes infinite scroll feel smooth. It was removed for a wider prefetch margin instead.
- **Pattern**: when removing a mechanism that looks like a bug, ask what it was silently limiting; and don't fix a rare edge case with something that taxes the common path. Judge the feel of scroll timing in the browser, not in tests.

## 2026-09-19 — CFE-032 — Delayed skeletons (detail page, then browse grid). One wrong idea caught before building.

- A CSS-only delayed fade-in (already-installed `tw-animate-css`) replaced the JS delay-plus-minimum-display hook the spec anticipated: no state, no latency cost. The two halves shipped as separate units so the grid version could be dropped independently; timing feel was judged in the browser, and the compiled CSS was read directly (a class-name test would only mirror the code).
- I had proposed a content fade-in to "soften" the skeleton-to-content swap; caught before building — an unmounted skeleton can't cross-fade, so it would dip to blank instead.
- **Pattern**: for a "don't flash on fast loads" problem, try a delayed CSS animation before reaching for a timer hook, and check that a proposed transition has both sides mounted before promising a cross-fade.

## 2026-09-19 — Branch review of the day's work (`d2a3782..HEAD`). No bugs or security findings; four debt notes.

- The skill defaults to the current branch vs `main`, which is empty when working directly on `main`; an explicit base range (`<last commit before the day>..HEAD`) is the way to review a day's commits. The two agents got the production-code diff only (import-only hunks and a whitespace re-indent trimmed, tests and docs left to the quality pass) to keep the pasted prompt bounded.
- The agents' two low-confidence flags were resolved by reading the code (one caller of `listRecipes`; a failed page fetch surfaces as `isError`), not passed on as unverified. One of my own tests turned out to lock behaviour a queued ticket (`CFE-037`) will change.
- **Pattern**: when writing a test that awaits a UI state produced by known-unwanted behaviour (here, the error panel), note it against the ticket that will change that behaviour at the time, not at review.


## 2026-09-27 — CFE-006 — Menu tab + shopping list shipped (desktop + mobile). Visual work kept being handed over as "done" before the founder had seen it run.

- Nearly every visual/animation piece went red → green → commit message with nothing to look at; the founder had to ask for a temporary mount each time, and the real problems (quantity editor feel, footer pill position, sheet with no close route, jumpy drawer, jarring removals) only surfaced then. Also: two backend gaps (CROC-052/053) blocked mid-build because the grill never tested add-extra against existing rows; the shadcn CLI added the `cn` package again (second time) plus OS-following `dark:` classes; the branch review found optimistic hooks cancelling a refetch with no refetch-on-settle, already copied into 7 hooks.
- **Pattern**: for anything visual, get it on screen where the founder can see it and wait for their look before offering a commit message — green tests are not "done". An optimistic hook that cancels a query must refetch when it settles (guarded by `isMutating`). After any `shadcn add`, check `package.json` for `cn` and grep the new file for `dark:`.

## 2026-09-27 — Tech-debt pass #3. 12 findings, 6 tickets. Clean pass.

- Whole codebase, with a full read of `CFE-006`'s new features. 12 findings, 2 of them reopened: the eager bundle regained `motion`/`zod`/`react-hook-form` via `MenuPage`, and blank-on-failure query states came back on the two new surfaces. Grouped into `CFE-039`–`044` (`CFE-044`, security headers, is blocked on the first deploy). Full detail: `docs/findings/2026-09-27-tech-debt.md`.
- Both reopened items are a decision made for one ticket's code (eager `MenuPage`, error states on browse) that the next big ticket quietly outgrew. The build's chunk warning was the only signal, and nothing reads it.
- **Pattern**: when a ticket adds imports to a route an earlier ticket kept eager on purpose, re-run `npm run build` and check the chunk warning as part of verification.

## 2026-09-27 — CFE-038 + CFE-043 — Tech-debt batch. Mechanical items clean; the "confirm spacing intent" item was a real bug.

- The code items went straight through with one red-to-green test (query key now includes `limit`). The spacing note hid a logged-out layout bug: the mobile sticky action row collapsed with no buttons. A first fix (fixed row height) stopped the overlap but left an empty dark band once stuck, which only the founder's scrolled screenshot showed; the real fix drops the row when there are no actions.
- **Pattern**: for layout driven by auth-dependent content, check both auth states and the scrolled/stuck state before calling it fixed.

## 2026-09-27 — CFE-039 — Lazy-load the Your Crockpot routes. Clean.

- Verified by build output (a source-map check of which chunk holds each heavy dependency), not tests. Keeping the layout eager with its own `Suspense` kept the page header visible while the tab chunk loads. Adding a second caller moved `RouteFallback` out of `nav/` under the caller-count rule.

## 2026-09-27 — CFE-041 — Menu cache consistency. Grill caught two hidden facts; one design gap found while building.

- Reading crockpot-go at the grill showed the client/server menu order mismatch and a backend shopping-list gap (`CROC-058`), neither in the ticket. Writing the hook tests found that "refetch only if last to settle" lost the refetch when a failure overlapped a success; fixed by marking the menu stale and having the last settler refetch.
- **Pattern**: for a "refetch only when the last one settles" guard, test a failure overlapping a success, not just two failures.

## 2026-09-27 — CFE-042 — Shopping-list duplication. Clean; checking the backend changed the rule.

- No rework. Checking crockpot-go's column (`NUMERIC(10, 2)`) and real recipe quantities in grams showed that the add box's 4-digit cap would have broken editing, so the shared rule became 6 digits rather than either existing one.

## 2026-09-27 — CFE-040 — Menu and shopping-list loading/error states. Clean.

- No screenshot drew these states, so they were built from existing components (skeletons copied from the real components' geometry, `StatePanel`) rather than blocking on a design spec. The only error shown is on a first-load failure, which avoids the `CFE-037` trap of losing loaded data to one failed refresh. Two self-inflicted slips were caught by the gate: stray JSX parens after replacing an `x && (…)` wrapper, and a test helper that rendered twice.
- **Pattern**: for loading/error states with no design, copy the loaded component's geometry, and show the error only when there's no data.

## 2026-09-27 — CFE-007 — Favourites tab. Most rework was design only visible on screen; review caught three real undo/paging bugs.

- Two grill decisions (undo restores the slot; refetch once the last change settles) contradicted each other and surfaced mid-build, because a "cheap" grill never composed them. Five visual rounds followed once Favourites showed off-menu recipes, exposing `CFE-006`'s mobile row; undo grew from one tile to a shared, pausable queue. The branch review found a pause leak, a misplaced tile, a refetch loop, and a red-phase guard test protecting a wrong count.
- **Pattern**: for a new screen, build a thin visible slice first (list + empty state), then the logic layers, so there's something to look at by the first commit.
- **Pattern**: a test that passes on red gets the same scrutiny as new code — ask whether the behaviour it guards is right, not just that it's guarded.

## 2026-09-28 — CFE-046 — Library tab. One bug, found by the founder on screen.

- Tests passed, but switching Menu → Library blanked the whole page: the `/library` redirect sat outside the layout route, so the layout unmounted and remounted. Fixed by linking the pill straight to the default sub-tab and moving the redirect inside the layout, with a test counting layout mounts. The pill's `transition-colors` also faded the background while the shadow and weight snapped.
- **Pattern**: a redirect route belongs inside the layout it redirects within, and a nav link should target the final path rather than rely on a redirect hop.

## 2026-09-28 — CFE-008 — My recipes. Clean build; review caught a stale-cache bug the grill missed.

- Three pieces, no rework on screen. Keying the list under `recipeKeys.lists()` got favourite and delete sync for free, but the review found that delete only filtered cached pages: `total` stayed stale and later pages skipped a recipe. Favourites had the same gap since CFE-007 (a deleted favourite stayed listed). Fixed by counting it off `total` and marking the lists stale.
- The grill's "the shared key keeps it in sync" held for which rows show, not for counts or paging. I also claimed a backend endpoint filtered before reading its SQL; the founder's pushback caught it before it went into the plan.
- **Pattern**: when a paginated list relies on another hook's cache patch, check the patch keeps `total` and server page boundaries true, not just the rows. Read the query, not just the param parsing, before calling an endpoint's behaviour verified.

## 2026-09-30 — CFE-010 — Grill amended after a discarded first pass.

- The first build pass reached 22 changed files before a stop, and its ingredients section had no design behind it: the grill had cut the paste box, the design's main entry point, without asking whether the remaining layout still made sense. The founder redesigned ingredients, instructions and categories; re-grilling also found that the new search dropdown implied a default unit the data doesn't have (335 of 387 items have 2+ allowed units, returned in UUID order).
- **Pattern**: when a grill cuts part of a design, re-check that what's left still works as a layout, not just each cut on its own. Cut pieces so every new visual component gets its own on-screen approval before it's wired; a piece sized by behaviour alone grows too big to review.

## 2026-10-02 — CFE-010 — Manual recipe form done. Bottom-up pieces held; one self-inflicted near miss.

- Scope moved mid-build at the founder's call: a step cap, a description field and a House-category guard were added, and drafts went to `CFE-048`. The description had been cut as "not in the design", but the detail page already rendered one and nothing could write it. A scripted multi-file edit failed partway and left the edit page navigating past `done`, which would prompt after every save. It type-checked and the suite was green; rereading the failed script caught it, and each page now has a save-without-prompt test.
- **Pattern**: when a batch edit fails partway, check which files changed before re-running; a half-applied change that still type-checks won't fail the suite.
- **Pattern**: when a grill cuts a field because the design doesn't show it, check whether another screen already reads that field.

## 2026-10-02 — CFE-049 — Recipe photos. Built alongside CROC-040; reading the backend's code found a contract gap.

- Checking the multipart contract against crockpot-go's committed code before piece 4 found that CORS hid `Retry-After`; the backend session fixed it. A page test caught a real bug: the React Compiler memoised `form.getValues("image")` from the first render, so a photo 429 said "requests". Review found one race (the label reopened the picker mid-shrink).
- **Pattern**: in components the React Compiler optimises, read form values that affect rendering with `useWatch`, never `getValues`.

## 2026-10-02 — Tech-debt pass #4. 12 findings, 4 tickets. One real gap, the rest duplication.

- Whole codebase, with a full read of everything since pass #3 (`CFE-007`/`008`/`010`/`046`/`049`, 208 files). 12 findings, including the seeded catalogue-map note, grouped into `CFE-050`–`053`. Full detail: `docs/findings/2026-10-02-tech-debt.md`. Build, lint and tests were clean. Also flagged for `crockpot-go`, not filed: its flat 10s `ReadTimeout` covers multipart photo uploads.
- The one medium finding (a dead session leaves the app logged in) sat in auth code untouched since pass #1. Earlier passes checked that refresh failure *throws* and that logout revokes, but never what the UI does afterwards. Most of the rest is the same shell, panel or hook being re-typed by the next page instead of reused.
- **Pattern**: when auditing an error path, follow it through to what the user sees, not just to where it throws.

## 2026-10-03 — CFE-050 — Session expiry ends the session cleanly. One grill claim was wrong.

- The grill said every optimistic rollback was already safe once its cache was wiped. I had only read the ones I expected to be safe. Building the test found 4 of 7 recreated the signed-out user's menu or shopping list. The grill also first ruled out the external-store option because "CFE-002a decided otherwise". The founder pushed back, and judging it on its merits still picked option 1.
- **Pattern**: when a design leans on "all X already handle Y", list every X with a grep and check each one, not a sample. Never cite an earlier ticket's decision as the reason; give the reason it was made.

## 2026-10-03 — CFE-051 — Your Crockpot duplication. Mostly clean; the grill undercounted callers.

- The grill first rejected the list/grid helper on three differences; the founder pushed back, and reading the props showed two weren't real and My recipes was a third caller I'd missed. Building found the skeletons shared the grid classes too, and the review found browse's grid had the same sidebar problem. Container queries replaced per-page breakpoints across all four grids.
- **Pattern**: before rejecting an extraction as "too many differences", diff the actual props and grep every caller, skeletons included; a count from memory undercounts.

## 2026-10-03 — CFE-002b — Email/password auth. Built clean; rework came from things nobody re-read.

- Reading crockpot-go's handlers at the grill caught a contract gap (CROC-067). But the shadcn CLI quietly installed an unrelated `cn` npm package while I only fixed the file it generated. A toggle choice slipped into a revision unagreed and reached the mockups. The hero's "continue with email" link, cut at CFE-003 before password auth existed, was only restored when the founder asked.
- **Pattern**: after a CLI or generator adds code, review its whole diff, `package.json` included, not just the generated file.
- **Pattern**: when a ticket adds a new way into something, check every existing entry point and the original design for elements earlier tickets cut because the feature didn't exist yet.

## 2026-10-07 — CFE-015 — Regulars. Two design changes mid-build; review found state that assumed the list never unmounts.

- Uppercase category labels became inset cards, and the empty state moved into Edit; its first cut derived the view from the regulars count, so adding the first one bounced back to restock. Three reds failed for the wrong reason (stubs rendering nothing, a test leaning on an unbuilt prop, `setup({ x: undefined })` taking the default). The review found an old highlight replaying: splitting the panel into views made the list unmountable.
- **Pattern**: when a change lets a long-lived component unmount, re-check any state it kept on the assumption it never would.
- **Pattern**: store a mode the user is in; don't derive it from data they're in the middle of changing.

## 2026-10-08 — CFE-055 — Account settings. Built ahead of the API on the pinned contract; the compiler broke form resets.

- Saving the name a second time sent the first value: under the React Compiler, `register()` isn't re-run after React Hook Form's `reset()`, so later typing never reached the form. Both cards had it, and no test saved twice. Review also found a password change reported as failed when only the follow-up `/me` fetch failed (a shape copied from `useResetPassword`), and a delete dialog that could be closed mid-request.
- **Pattern**: never call React Hook Form's `reset()` in this codebase; use `setValue`, or remount the form with a `key`. Give every form test a submit-twice case.
- **Pattern**: when a mutation chains a follow-up after the request that matters, a failure in the follow-up mustn't report the main request as failed.

## 2026-10-09 — CFE-045 — Menu write errors show copy. Clean.

- No rework. One piece, built against `crockpot-go` `CROC-059` after it was green. Putting the copy map in `useOptimisticMenuMutation` covered all four menu writes and the undo re-add in one place, and folded in `CFE-054`'s `shopping_list_quantity_too_large`. Skipped a pre-disable at the cap: the 409 path was needed anyway, and a disabled state would have needed a design.
- **Pattern**: a code-to-copy map keyed on server strings needs `Object.hasOwn`, and a test with a prototype key like `"constructor"` to prove it.

## 2026-10-09 — CFE-014 — Admin approval. Banner took two rounds; review found a latent stale-state bug.

- The admin banner was first built as a copy of the owner's, then merged with the page still choosing between two renders; the founder wanted one component that decides who's looking. Review found the unkeyed detail route would carry approve state into an already-cached recipe. The `isAdmin` sweep nearly shadowed a local `isAdmin` into an always-true check; a grep caught it, not the typechecker.
- **Pattern**: for a role or state variant of an existing component, have the component decide for itself and the page render it once.
- **Pattern**: key a route's page by its id when it holds per-item mutation state.

## 2026-10-09 — CFE-035 — Card link firing through the add-to-menu controls. Clean.

- No rework. A catch-all stop on the wrapper replaced the ticket's "repro first" step, since it closes every gap without needing to know which one was hit.
- **Pattern**: an interactive control nested inside a link needs its click stopped on its wrapper, not just on each button; gaps, mid-animation slots and disabled buttons never run a button's handler.

## 2026-10-09 — CFE-052 — Recipe-layer drift. Clean.

- No rework. Re-reading the week-old findings at the grill caught two drifts (`isOwnPendingRecipe` gone at `CFE-014`; the back buttons checked history at different times). The branch review found the new shared `HistoryBackLink` silently dropped a caller's `onClick`; fixed with a test.
- **Pattern**: when extracting a wrapper that spreads a primitive's props, compose the handlers it overrides or drop them from the prop type.

## 2026-10-09 — CFE-053 — Recipe-form housekeeping. Mostly clean; two premises were wrong.

- Finding 11 assumed `RecipeForm.test` only needed the router handle back; it needed real routes, so it was narrowed mid-build. The grill dropped `useMemo`s on the claim the React Compiler builds each map once per fetch; compiling `IngredientsSection` showed it folds them into a larger block that re-runs per keystroke. Harmless here, but the spec had to be corrected.
- **Pattern**: before leaning on "the React Compiler memoises this", compile the file and look; it memoises per reactive block, not per value.

## 2026-10-09 — CFE-056 — Return-to-page after sign-in, backlogged mid-build. Undersized.

- Called it "modest, one commit" from the mechanism alone (two sign-in links, two redirect sites). Building it surfaced six auth-page links carrying `email`, three Google callers and a logout interaction in `RequireAuth`. That surprise was the cue to stop and re-size, but I kept going until the founder halted it at ~15 files; the diff was thrown away.
- **Pattern**: before sizing a change, list every file the value has to pass through, not just where it starts and ends. A new touch point found mid-build means stop and re-size with the founder, not absorb it.

## 2026-10-09 — CFE-059 — Recipe hero grey flash. Abandoned after four experiments; backlogged.

- Four fixes in a row went to the founder without a measurement of where the wait was. Each was judged by eye under conditions I set, and I told the founder to test with DevTools "Disable cache", which made the press-time preload impossible to judge and made Cloudinary look uncached. The founder lost confidence in the image optimisation, which turned out to be sound once measured (cards ~20KB vs ~400KB originals).
- **Pattern**: for a perceived-latency bug, get a Network waterfall of the real case before proposing fixes, and test with the cache on, the way users experience it.
