# CFE-002a — Auth session, guard, and Google login

Grilled 2026-08-28. Not implemented yet. Absorbs CFE-002 (the HTTP
transport it needed — `client.ts` + `tokenStore.ts` — shipped in
CFE-001, so CFE-002 as a standalone ticket is folded in here).

**Implementation mode: hand-written (founder).** The founder writes the
implementation against this doc plus the cited `packing-list-react`
files. **Still test-first** — the roadmap marks each unit that needs a
test; at those steps Claude writes the failing test(s) and confirms red,
then the founder implements to green. Claude writes no implementation
code. A `code-review` pass on the diff and the interactive verification
below are the close-out gate.

### Picking this up cold (fresh session)

The founder starts a new session per test / question, so assume no prior
context. Before acting:

1. Read this whole doc, plus `docs/handoffs/CFE-001.md`'s "Deltas from
   the plan" (explains the `lib/http` naming, `sonner`, the oxlint
   carve-out for `src/components/ui/**`, `*.md` being Prettier-ignored).
2. Read `src/lib/http/{client,tokenStore}.ts` for the real `ApiError` /
   `refreshAccessToken` / `apiFetch` signatures, and
   `src/lib/http/client.test.ts` as the test-style reference (Vitest,
   explicit imports — no globals, `vi.spyOn(globalThis, "fetch")`).
3. `git log --oneline` / `git status` to see which roadmap steps are
   already done — the founder will also name the step.

Test files are co-located: `Foo.test.ts(x)` next to `Foo.ts(x)`, as
`client.test.ts` sits next to `client.ts`.

## Summary

Wire the auth session into the app: an `AuthProvider` that resolves the
current user from the refresh cookie on load, a `RequireAuth` route
guard, a real `/auth/callback` component that handles `crockpot-go`'s
`?error=` redirects, Google sign-in from a throwaway placeholder at `/`,
a throwaway `/menu` stub as the post-login verification surface, and
`useLogout`. End state: the Round 1 log-in milestone works end to end
against a locally-running `crockpot-go` — land on `/`, Continue with
Google, consent, land on `/menu` showing the `/me` identity, reload,
log out.

Close port of `packing-list-react/src/features/auth/*` and
`src/app/{App,AppRoutes}.tsx`, with the deltas below.

## Decisions and why

### The `User` type — `src/features/auth/types.ts`

```ts
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: "FREE" | "PREMIUM" | "PRO" | "ADMIN";
}
```

- `name` / `image` are `*string` in `crockpot-go`'s model and serialise
  to `null` from `/me`. Password users (CFE-002b) start with no name.
  Typing them non-null pushes a lie into every consumer; the cost of
  honesty is one `user.name ?? user.email` per display site.
- `role` as a union, not `string` — CFE-012 gates on `PREMIUM`, CFE-014
  on `ADMIN`; a union makes those checked comparisons. `PRO` is in the
  DB `CHECK` constraint even though nothing uses it, so the type must
  admit it.
- Lives in `types.ts` (not `api.ts`, not `AuthContext.tsx`) because the
  auth feature owns the identity type, `types.ts` is the unsurprising
  place to import it from, and the `/auth/callback` error codes want a
  type + message map right next to it. Not a central `src/types/` —
  `User` is an auth-domain concept, and crockpot has no such dir.

### `fetchSession` — 401-only catch, rethrow the rest

`packing-list`'s blanket `catch { return null }` conflates "logged out"
with "`crockpot-go` unreachable", so a transient blip bounces an
authenticated user to sign-in. Instead: a 401 from `/auth/refresh` or
`/me` is the one unambiguous "not logged in" signal (`crockpot-go`
returns exactly that for a missing/invalid refresh cookie and for
CROC-009's deleted-user path). Anything else (500, `fetch` `TypeError`)
is transient — let the query see the rejection so it can retry.

### Session query — `retry: 1`, `staleTime: Infinity`

crockpot's `queryClient.ts` defaults to `retry: false`. Override to
`retry: 1` on the session query only: absorbs a single transient
failure (~1s extra blank), gives up fast on a real outage rather than
the default 3× (~7s blank). `staleTime: Infinity` — the session
resolves once on load; the 15-min access token is refreshed
transparently by `apiFetch`'s 401→refresh→retry for every resource
call, so the session query itself never needs to refetch.

### `useAuth()` surface — three fields, no more

`{ user: User | null, isAuthenticated: boolean, isLoading: boolean }`.
Minimal correct set for `RequireAuth`, `AppRoutes`, `/auth/callback`,
and the `/menu` stub. No `isError` / `error` / `refetch` until the
error-state screen that needs them exists — an unused escape hatch
invites a half-baked caller. `isLoading` sourced from the query's
`isPending`.

### No global `isLoading` gate in `AppRoutes`

`packing-list` blocks the entire route tree until the session resolves.
crockpot doesn't — that would make CFE-003's public landing wait on a
session check every load. Instead:

- `RequireAuth` owns the wait: `isLoading → null`, then
  `!isAuthenticated → <Navigate to="/">`, else children.
- `/` self-gates: `isLoading ? null : isAuthenticated ? <Navigate to
  DEFAULT> : <SignInPlaceholder>`.
- Public routes render immediately — nothing for CFE-003 to unpick.

Cost: a logged-in user who reloads on `/` sees the placeholder for ~1
RTT before redirect. Acceptable for a placeholder; CFE-003 decides how
the real landing behaves for a signed-in visitor.

### `/auth/callback` — a real component

`crockpot-go` redirects here with no params on success and
`?error=<code>` on failure (8 codes: `missing_code`, `missing_state`,
`invalid_state`, `exchange_failed`, `verify_failed`,
`email_not_verified`, `email_registered_with_password`, `server_error`).
`packing-list` just blind-`<Navigate>`s. crockpot needs a component
that reads the param, fires one `toast.error`, and redirects.

**One generic message for every code in CFE-002a.** Every code except
`email_registered_with_password` is an internal fault the user can't
act on. `email_registered_with_password` is unreachable in Round 1 —
no user can have a password until CFE-002b builds registration. So
per-code messages are genuinely CFE-002b's job. `getAuthErrorMessage`
is a `Record<string, string>` that's `{}` + a fallback for now, typed
and ready to fill.

Pass a stable sonner `id` on the toast — `AuthCallback`'s effect
double-fires under dev StrictMode, and sonner dedupes on `id`.

### `DEFAULT_AUTHENTICATED_ROUTE` — `src/app/routes.ts`

`packing-list` puts it in `AuthContext.tsx`; the auth context has no
business knowing route paths. It's a routing constant. Not the
`AppRoutes.tsx` component file either — `AuthCallback` (a feature)
needs it, and a feature importing from an `app/` component is a
dependency inversion; a leaf constants module isn't. `/recipes`,
`/favourites` etc. accumulate here from CFE-003 on. Promote to a
`ROUTES` object when there's a second constant.

`AUTH_SESSION_QUERY_KEY` stays in `AuthContext.tsx` — same-feature use
only (`AuthContext` defines the query, `useLogout` mutates it).

### Provider composition — `App.tsx` is the single root

CFE-001 left `TanstackQueryProvider` in `main.tsx`. Move it down so
`App.tsx` assembles the whole stack —
`TanstackQueryProvider → AuthProvider → BrowserRouter →
(AppRoutes + Toaster)` — and `main.tsx` is just
`createRoot(...).render(<StrictMode><App /></StrictMode>)`. One file to
read for the app's shape, and `App` is testable as a unit. `AuthProvider`
outside `BrowserRouter` (uses no router hooks), inside
`TanstackQueryProvider` (needs the client). No `ToastProvider` —
`sonner` needs no provider.

### `useLogout` — port as-is, `onSettled`, no cache clear

```ts
useMutation({
  mutationFn: logout,
  onSettled: () => {
    setAccessToken(null);
    queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null);
  },
});
```

`onSettled` not `onSuccess` — logged out locally even if `crockpot-go`'s
logout 500s (it can, deliberately). Raw `useMutation`, not the
`useApiMutation` wrapper — a failed logout shouldn't toast, the user's
gone anyway. **Not** `queryClient.clear()` — no other cached data in
Round 1, and `clear()` would force a pointless `fetchSession` refetch.
Full-cache-clear-on-logout belongs in CFE-006.

### `client.ts` — fail loud on missing env

```ts
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) throw new Error("VITE_API_URL is not set");
```

Part of "verify the ported client against real `crockpot-go`" that
folded in from CFE-002. Without it a missing `.env.local` gives
`fetch("undefined/auth/refresh")` and a baffling failure.

## Acceptance criteria

- [ ] `src/features/auth/types.ts` — `User` (nullable `name`/`image`,
      `role` union), `AuthCallbackErrorCode`, `getAuthErrorMessage`.
- [ ] `src/features/auth/api.ts` — `fetchMe(): Promise<User>`,
      `logout(): Promise<{ message: string }>`.
- [ ] `src/features/auth/AuthContext.tsx` — `AuthProvider`, `useAuth`,
      `fetchSession` (401→null+clear, else rethrow),
      `AUTH_SESSION_QUERY_KEY`; session `useQuery` has `retry: 1`,
      `staleTime: Infinity`.
- [ ] `fetchSession` tests green: (a) refresh 401 → `null` + token
      cleared; (b) refresh non-401 → throws; (c) refresh ok + `/me` ok →
      `User`; (d) refresh ok + `/me` 401 → `null` + token cleared.
- [ ] `src/features/auth/RequireAuth.tsx` — `isLoading → null`,
      `!isAuthenticated → <Navigate to="/">`, else children.
- [ ] `RequireAuth` tests green: loading renders nothing; unauthed
      redirects to `/`; authed renders children.
- [ ] `src/features/auth/AuthCallback.tsx` — reads `?error`, one
      `toast.error` with stable `id`, redirect logic per the snippet.
- [ ] `AuthCallback` tests green: `?error=x` → toast fired + at `/`;
      no error + loading → nothing; no error + authed → at DEFAULT;
      no error + unauthed → at `/`.
- [ ] `src/features/auth/useLogout.ts` — per snippet.
- [ ] `useLogout` test green: after `mutate`, `getAccessToken()` is
      `null` and session cache is `null`.
- [ ] `src/app/routes.ts` — `DEFAULT_AUTHENTICATED_ROUTE = "/menu"`.
- [ ] `src/app/AppRoutes.tsx` — routes per snippet, no global
      `isLoading` gate, catch-all `* → /`.
- [ ] `src/app/App.tsx` — full provider stack per snippet.
- [ ] `src/main.tsx` — reduced to `<StrictMode><App /></StrictMode>`.
- [ ] `src/lib/http/client.ts` — throws at module load if
      `VITE_API_URL` is unset.
- [ ] `src/features/auth/SignInPlaceholder.tsx`,
      `src/features/menu/MenuScreen.tsx` — per snippets.
- [ ] `src/test/renderWithProviders.tsx` — fresh `QueryClient`
      (`retry: false`, `gcTime: 0`) + `MemoryRouter`, for the
      component/hook tests.
- [ ] `src/app/App.test.tsx` — updated: `fetch` mocked, asserts the
      sign-in placeholder renders (not the old `Crockpot` heading).
- [ ] `npm test`, `npm run build`, `npm run lint`, `npm run format:check`
      all clean.
- [ ] Interactive Google round-trip (below) passes against local
      `crockpot-go`.

## Non-goals

- Email/password anything — CFE-002b.
- Per-code auth error messages — CFE-002b. `email_registered_with_
  password` is unreachable until then.
- Designed screens. `SignInPlaceholder` is replaced by CFE-003's
  landing; `MenuScreen` by CFE-006's Menu tab. No screenshots — these
  are verification surfaces, not design targets.
- Dedicated "session check failed / service down" UI — blank during
  load, sign-in on failure. Revisit CFE-006.
- Full query-cache clear on logout — revisit CFE-006.
- `AppShell` / nav / layout route / `<Outlet>` — CFE-006.
- Loading spinners — bare `null`. Revisit with CFE-003's design.
- `useDocumentTitle` — add with the first real screen.

## Verification mode

**Logic — test-first** (`npm test`; Claude writes the failing tests at
the roadmap's test steps, founder implements to green):

- `fetchSession` — 4 cases (AC above). Mock `refreshAccessToken` /
  `fetchMe` (or `apiFetch`).
- `RequireAuth` — 3 cases. Mock `useAuth`, render inside `MemoryRouter`
  + a `<Routes>` with a `/` sink, assert on what renders.
- `AuthCallback` — 4 cases. Mock `useAuth`, `MemoryRouter initialEntries`
  with the `?error=` query, assert redirect target + `toast.error` spy.
- `useLogout` — 1 case. `renderHook` with a `QueryClientProvider`
  wrapper; assert token + cache cleared after `mutate`.
- Skipped: `getAuthErrorMessage` (`MAP[code] ?? FALLBACK`, empty map) —
  test in CFE-002b when the map has entries.

**Interactive — hands-on by the founder.** `crockpot-go` running
locally (real Neon dev DB, Google OAuth dev credentials with
`http://localhost:8080/auth/google/callback` whitelisted) + `npm run
dev`:

1. `/` → sign-in placeholder.
2. "Continue with Google" → real Google consent.
3. consent → `/auth/callback` → `/menu`.
4. `/menu` shows your real name / email / role (`FREE`).
5. reload `/menu` → still authed.
6. visit `/` while authed → redirects to `/menu`.
7. "Log out" → `/`; then `/menu` → redirects to `/`.
8. manually visit `/auth/callback?error=server_error` → generic error
   toast, lands on `/`.

**Service boundary.** Real `/auth/refresh` + `/me` calls are exercised
by steps 2–4 — no separate step. **Watch CORS**: browser `:5173` → API
`:8080`, cross-origin + credentials. If login silently fails, check
`crockpot-go`'s `.env` has `FRONTEND_URL=http://localhost:5173`
(CROC-009a's CORS allows exactly that origin).

**No screenshots** — deliberate, per non-goals.

## Roadmap

Build lower layers first. Reference files are in
`../../packing-list/packing-list-react/`. Straight ports are cited;
everything new or divergent has a snippet below.

### 1. `client.ts` env guard + test helper

- `src/lib/http/client.ts`: add after the `API_URL` line —
  ```ts
  if (!API_URL) throw new Error("VITE_API_URL is not set");
  ```
- `src/test/renderWithProviders.tsx` (new):
  ```tsx
  import { type ReactElement } from "react";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  import { render } from "@testing-library/react";
  import { MemoryRouter } from "react-router-dom";

  export function renderWithProviders(
    ui: ReactElement,
    { route = "/" }: { route?: string } = {},
  ) {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </QueryClientProvider>,
    );
  }
  ```

### 2. `types.ts` + `api.ts` (no tests)

- `src/features/auth/types.ts` (new):
  ```ts
  export interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: "FREE" | "PREMIUM" | "PRO" | "ADMIN";
  }

  export type AuthCallbackErrorCode =
    | "missing_code"
    | "missing_state"
    | "invalid_state"
    | "exchange_failed"
    | "verify_failed"
    | "email_not_verified"
    | "email_registered_with_password"
    | "server_error";

  const MESSAGES: Partial<Record<AuthCallbackErrorCode, string>> = {};
  const FALLBACK = "We couldn't sign you in. Please try again.";

  export function getAuthErrorMessage(code: string): string {
    return MESSAGES[code as AuthCallbackErrorCode] ?? FALLBACK;
  }
  ```
- `src/features/auth/api.ts` (new) — same endpoints as
  `packing-list-react/src/features/auth/api.ts`, but `User` is imported
  from `./types`, not declared inline:
  ```ts
  import { apiFetch } from "../../lib/http/client";
  import type { User } from "./types";

  export function fetchMe(): Promise<User> {
    return apiFetch<User>("/me");
  }

  export function logout(): Promise<{ message: string }> {
    return apiFetch<{ message: string }>("/auth/logout", { method: "POST" });
  }
  ```

### 3. `AuthContext.tsx`

- **Claude writes the `fetchSession` tests, confirm red** (4 cases, AC
  above), then implement.
- Context / `useAuth` / provider shell — straight port of
  `packing-list-react/src/features/auth/AuthContext.tsx`, with:
  `import` from `../../lib/http/client` and `../../lib/http/tokenStore`;
  `User` from `./types`; **drop `DEFAULT_AUTHENTICATED_ROUTE`** (moves to
  `src/app/routes.ts` in step 6).
- `fetchSession` + query config (divergent):
  ```ts
  import { ApiError, refreshAccessToken } from "../../lib/http/client";
  import { setAccessToken } from "../../lib/http/tokenStore";

  async function fetchSession(): Promise<User | null> {
    try {
      await refreshAccessToken();
      return await fetchMe();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setAccessToken(null);
        return null;
      }
      throw e;
    }
  }

  // in AuthProvider:
  const { data: user, isPending } = useQuery({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: fetchSession,
    retry: 1,
    staleTime: Infinity,
  });
  // value: { user: user ?? null, isAuthenticated: !!user, isLoading: isPending }
  ```

### 4. `RequireAuth.tsx`

- **Claude writes the tests, confirm red** (3 cases), then implement.
- Divergent from `packing-list` (adds the `isLoading` branch):
  ```tsx
  import type { ReactNode } from "react";
  import { Navigate } from "react-router-dom";
  import { useAuth } from "./AuthContext";

  export function RequireAuth({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return null;
    if (!isAuthenticated) return <Navigate to="/" replace />;
    return children;
  }
  ```

### 5. `AuthCallback.tsx`

- **Claude writes the tests, confirm red** (4 cases), then implement.
- New — no `packing-list` equivalent:
  ```tsx
  import { useEffect } from "react";
  import { Navigate, useSearchParams } from "react-router-dom";
  import { toast } from "sonner";

  import { DEFAULT_AUTHENTICATED_ROUTE } from "../../app/routes";
  import { useAuth } from "./AuthContext";
  import { getAuthErrorMessage } from "./types";

  export function AuthCallback() {
    const [params] = useSearchParams();
    const error = params.get("error");
    const { isLoading, isAuthenticated } = useAuth();

    useEffect(() => {
      if (error) {
        toast.error(getAuthErrorMessage(error), { id: "auth-callback-error" });
      }
    }, [error]);

    if (error) return <Navigate to="/" replace />;
    if (isLoading) return null;
    return (
      <Navigate
        to={isAuthenticated ? DEFAULT_AUTHENTICATED_ROUTE : "/"}
        replace
      />
    );
  }
  ```

### 6. `useLogout.ts` + `routes.ts`

- `src/app/routes.ts` (new):
  ```ts
  export const DEFAULT_AUTHENTICATED_ROUTE = "/menu";
  ```
- **Claude writes the `useLogout` test, confirm red** (1 case), then
  implement — straight port of
  `packing-list-react/src/features/auth/useLogout.ts` with the
  `../../lib/http/tokenStore` import path.

### 7. Wiring — `AppRoutes.tsx`, `App.tsx`, `main.tsx`

Verified interactively, no unit tests (App.test.tsx updated in step 9).

- `src/app/AppRoutes.tsx` (divergent — ref
  `packing-list-react/src/app/AppRoutes.tsx` for the pattern, but no
  global loading gate, real callback component, catch-all):
  ```tsx
  import { Navigate, Route, Routes } from "react-router-dom";

  import { AuthCallback } from "../features/auth/AuthCallback";
  import { RequireAuth } from "../features/auth/RequireAuth";
  import { SignInPlaceholder } from "../features/auth/SignInPlaceholder";
  import { useAuth } from "../features/auth/AuthContext";
  import { MenuScreen } from "../features/menu/MenuScreen";
  import { DEFAULT_AUTHENTICATED_ROUTE } from "./routes";

  export function AppRoutes() {
    const { isAuthenticated, isLoading } = useAuth();
    return (
      <Routes>
        <Route
          path="/"
          element={
            isLoading ? null : isAuthenticated ? (
              <Navigate to={DEFAULT_AUTHENTICATED_ROUTE} replace />
            ) : (
              <SignInPlaceholder />
            )
          }
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/menu"
          element={
            <RequireAuth>
              <MenuScreen />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }
  ```
- `src/app/App.tsx` (divergent):
  ```tsx
  import { BrowserRouter } from "react-router-dom";

  import { Toaster } from "../components/ui/sonner";
  import { AuthProvider } from "../features/auth/AuthContext";
  import TanstackQueryProvider from "../lib/Tanstack/TanstackQueryProvider";
  import { AppRoutes } from "./AppRoutes";

  function App() {
    return (
      <TanstackQueryProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </TanstackQueryProvider>
    );
  }

  export default App;
  ```
- `src/main.tsx` (divergent — strip the provider):
  ```tsx
  import { StrictMode } from "react";
  import { createRoot } from "react-dom/client";

  import "./index.css";

  import App from "./app/App.tsx";

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  ```

### 8. Stubs — `SignInPlaceholder.tsx`, `MenuScreen.tsx` (no tests)

- `src/features/auth/SignInPlaceholder.tsx` (new — minimal, not
  `packing-list`'s designed `SignInScreen`):
  ```tsx
  import { Button } from "../../components/ui/button";

  export function SignInPlaceholder() {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1>Crockpot</h1>
        <Button
          onClick={() => {
            window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`;
          }}
        >
          Continue with Google
        </Button>
      </div>
    );
  }
  ```
- `src/features/menu/MenuScreen.tsx` (new stub):
  ```tsx
  import { Button } from "../../components/ui/button";
  import { useAuth } from "../auth/AuthContext";
  import { useLogout } from "../auth/useLogout";

  export function MenuScreen() {
    const { user } = useAuth();
    const logout = useLogout();
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2">
        <p>{user?.name ?? "—"}</p>
        <p>{user?.email}</p>
        <p>{user?.role}</p>
        <Button
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          Log out
        </Button>
      </div>
    );
  }
  ```

### 9. Update `App.test.tsx`, run the full AC checklist

- **Claude rewrites `src/app/App.test.tsx`**: stub `global.fetch` (reject
  or 401) so `fetchSession` settles fast, assert
  `getByRole("button", { name: /continue with google/i })` renders.
- `npm test` / `build` / `lint` / `format:check` all green.
- Then the interactive Google round-trip. Commit.
