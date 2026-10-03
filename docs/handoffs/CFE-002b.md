# CFE-002b — Email/password auth suite

Register (with 6-digit code confirmation and resend), login, forgot
password and reset password from the emailed link, against
`crockpot-go`'s existing password endpoints. Also stops a wrong password
failing silently through `apiFetch`'s 401 → refresh retry. Grilled
2026-10-03.

**Implementation mode**: AI-driven, in pieces (roadmap below).

**Status**: pieces 1–3 can start now. Pieces 4–8 are blocked on
Claude-Design screens built from the design brief below, and piece 5 is
also blocked on `crockpot-go` `CROC-067`.

## Facts this rests on (checked 2026-10-03)

All in `crockpot-go/internal/handler/auth_handler.go` unless noted.

- Routes: `POST /auth/{register,confirm,resend-confirmation,login,
  forgot-password,reset-password}`, all behind one per-IP limiter of 10
  requests/minute shared across the whole group (`main.go:40`, `:130-139`).
  The limiter returns 429 `rate_limit_exceeded` with a `Retry-After`
  header (`internal/middleware/rate_limit.go:37-38`). Malformed bodies
  return 400 `invalid_request` (`validation.go:14`).
- `register` `{email, password, name}`, all required (`:243-247`) → 201.
  Errors: 400 `password_too_short` (< 8) / `password_too_long` (> 72
  **bytes**) (`:23-28`, `:255-261`), 409 `email_registered_with_google`,
  409 `email_already_registered`, 429 `resend_too_soon`. Re-registering an
  unconfirmed email re-sends a code and keeps the original password
  (`:280-287`).
- `confirm` `{email, code}` → 200 `{message}` only. **No token and no
  cookie** (`:412`). Errors: 400 `code_invalid` (also covers an unknown
  email, deliberately), `too_many_attempts` (5), `code_expired` (10 min)
  (`:367-399`).
- `resend-confirmation` `{email}` → 200. Errors: 400 `email_not_found`,
  400 `already_confirmed`, 429 `resend_too_soon` (`:428-451`).
- `login` `{email, password}` → 200 `{accessToken}` and sets the refresh
  cookie. Errors: **401** `invalid_credentials`, **401**
  `google_account_no_password`, 403 `email_not_confirmed`, which is only
  returned once the password has matched (`:470-493`).
- `forgot-password` `{email}` → 200. Errors: 400 `email_not_found`,
  **401** `google_account_no_password`, 429 `resend_too_soon`
  (`:530-552`). The link is `${FRONTEND_URL}/reset-password?token=…`
  (`:599`) and lasts 1 hour (`master-spec.md:401`).
- `reset-password` `{token, newPassword}` → 200 `{accessToken}` and sets
  the refresh cookie (`:708-711`). It also confirms the email and revokes
  every other session (`:672-690`). Errors: 400 `token_invalid`,
  `token_expired`, `password_too_short`/`_too_long`. There is no endpoint
  to check a token without submitting.
- `resend_too_soon` sends `retryAfterSeconds` in the JSON body only, with
  no header (`:297-300`, `:445-448`, `:547-550`). The cooldown is 60s per
  email (`:25`). `ApiError.retryAfterSeconds` reads only the header
  (`client.ts:37-40`).
- Today a wrong password is silent. The 401 calls `refreshAccessToken()`
  (`client.ts:90-93`). With no cookie, the refresh 401s, which throws
  `SessionExpiredError` (`:55-59`). `endSession` returns false because
  there's no user (`endSession.ts:9`), so `AuthProvider` sends no toast
  (`AuthContext.tsx:42-48`). `toastApiError` skips `SessionExpiredError`
  (`toastApiError.ts:7`).
- Recipe query keys aren't scoped to a user (`recipes/data/queryKeys.ts`)
  and the payloads carry `isFavourite` (`recipes/data/types.ts:15`), so
  data cached while signed out is wrong once signed in.
- "Sign in" goes straight to Google from `SiteHeader.tsx:67`,
  `MobileTabBar.tsx:45`, `Hero.tsx:49` and `Pricing.tsx:60`.
- Local dev sends real email through Resend (`crockpot-go/main.go:89`).

## Decisions

1. **Pre-session calls opt out of the 401 → refresh retry with a named
   option.** `apiFetch(path, init, { refreshOn401: false })`, with the
   current positional `hasRetried` folded into the same options object.
   All six password endpoints pass it, not just the two that 401 today:
   none of them can have a session to refresh, and a future backend 401
   then shows its real error instead of going silent.
   Rejected:
   - a path list inside `client.ts`: transport ends up holding auth
     paths, and a renamed path silently reintroduces the bug;
   - "only refresh when a token was sent": it changes every request, and
     a request fired on load before `fetchSession` sets the token would
     stop recovering. Proving it safe would need a timing audit of every
     request in the app.
2. **Error copy is specific and offers a next step.** The API already
   reveals whether an email exists and how it signs in, through five
   channels (register 409s, login/forgot `google_account_no_password`,
   forgot/resend `email_not_found`, the Google callback's
   `email_registered_with_password`). Vague copy hides nothing and leaves
   real users stuck. That's the tradeoff `crockpot-go` `CROC-005.md:108-118`
   weighed and accepted (low-severity app, no compliance driver).
   Confirm's `code_invalid` stays generic, as the backend intends. Closing
   enumeration would be a `crockpot-go` ticket across all five channels,
   not a copy change here.
3. **Confirming signs you in automatically. If that fails, show "please
   sign in" (fallback B).** The flow component holds the email and
   password in **React state only**: never router state (the browser
   serialises `history.state` and it survives reloads), never a URL,
   never storage. After a successful confirm it calls `/auth/login` with
   them. If it has no password (the page was reloaded), or the automatic
   login fails for any reason (most likely a 429, because the IP's budget
   of 10/min is shared), it shows "Email confirmed, please sign in" with
   the email prefilled and any error inline. Confirming the email never
   reads as a failure. Rejected: having `/confirm` issue a session
   (turns a 6-digit code into a login credential and reopens CROC-005 in
   the other repo).
4. **The code step is a second step inside `/register` and `/login`, not
   a route.** One shared `ConfirmCodeStep`. Login's 403
   `email_not_confirmed` calls resend automatically (the original code
   may have expired) and shows the code step. A 429 `resend_too_soon` on
   that automatic resend is treated as "a code was sent recently", not as
   an error.
5. **Resend countdown.** After any successful send (code or reset link),
   Resend is disabled for 60s straight away. That copies CROC-005's
   documented cooldown, so an impatient click doesn't spend one of the
   IP's 10/min just to learn "wait". If a 429 still happens (for example
   after a reload), count down from `ApiError.retryAfterSeconds`, which
   needs `CROC-067`'s header. Rejected: having `apiFetch` also read
   `body.retryAfterSeconds`, which would leave the client accepting two
   conventions for one thing.
6. **Routes: `/login`, `/register`, `/forgot-password`,
   `/reset-password`, as pages, not a modal.** `/reset-password` has to
   be a page because it's the email link. The others follow it, and a
   modal's only advantage (keeping your place) has no use without
   return-to.
7. **All four routes are for signed-out users only.** A signed-in user
   is redirected to `DEFAULT_AUTHENTICATED_ROUTE`, the same way `/` behaves
   (`AppRoutes.tsx:63-68`). That includes `/reset-password`, because a
   reset for a different account would hand over that account's token
   while your own cached data is still loaded. **This guard is the only
   thing that navigates after a sign-in.** Success handlers don't call
   `navigate()`, so there's no second redirect racing the first.
8. **Entry points.** Header "Sign in" and mobile "Login" go to `/login`.
   Pricing "Get started free" goes to `/register`. Hero "Continue with
   Google" stays Google, because its label says so. `/login` and
   `/register` each show the email form and a Continue-with-Google button.
9. **`startSession(queryClient, accessToken)`** in `auth/utils/`, the
   counterpart to `endSession`. It sets the token, then `await fetchMe()`
   (on failure it clears the token and rethrows), then removes every
   query except the session (same predicate as `endSession.ts:13-15`),
   then writes the user to `AUTH_SESSION_QUERY_KEY`. Removal comes before
   the write so `RequireAuth`'s children can't mount and start fetching
   in between. Login, the confirm step's automatic login, and reset all
   use it.
   Rejected:
   - invalidating the session query: it reruns `fetchSession`, which
     rotates the refresh cookie we were just issued and spends a request
     against the refresh limiter;
   - a full page reload: it throws away the token we were just given and
     flashes a blank page mid-flow.

   Known and accepted: if `/me` 5xxs, the server has already set the
   cookie, so a reload finds you signed in. That's rare and harmless.
10. **Errors follow `recipes-form/utils/saveErrors.ts`'s split**, in one
    pure `auth/utils/authErrors.ts`:
    - **Browser checks before sending (Zod):** email format, password
      8–72 **UTF-8 bytes**, password/confirm mismatch, name required on
      register, code is 6 digits.
    - **Field errors:** password-length codes on the password field;
      `code_invalid`/`code_expired`/`too_many_attempts` on the code
      field.
    - **An inline message above submit** that stays visible and can hold
      a link or button: `email_already_registered`,
      `email_registered_with_google`, `google_account_no_password`,
      `email_not_found`, `invalid_credentials`,
      `token_invalid`/`token_expired`, and both 429s ("try again in N
      minutes").
    - **Toast:** everything else, through `useApiMutation`'s
      `isHandledError`.
    - Google-callback codes stay as toasts on `/auth/callback`.
      `getAuthErrorMessage` gets a real `email_registered_with_password`
      message ("This email has a password — sign in with email instead").
11. **Password fields: a new password field plus a confirm field on
    register and reset, and a show/hide toggle on every password field.**
    Confirming signs you in automatically (decision 3), so a typo would
    otherwise only surface weeks later on a new device. The mismatch
    check happens in the browser and costs nothing. `autocomplete`:
    `email`, `current-password` (login), `new-password` (register,
    reset), `one-time-code` (code input).
12. **Reset page states.**
    - **No `?token=`:** "This link isn't valid" with "Request a new link"
      (to `/forgot-password`), and no form.
    - **Token present:** the form. `token_invalid`/`token_expired` on
      submit shows the inline message with the same action.
    - **Success:** `startSession`, the guard redirects, and a toast:
      "Password updated. You've been signed out on other devices."

    The token stays in the URL. It's single-use and lasts an hour, the
    default referrer policy sends only the origin cross-origin, and
    stripping it would break a reload mid-form.
13. **Forgot-password success switches the page in place** to "We've
    sent a reset link to {email}. It expires in 1 hour.", with Resend
    (countdown per decision 5) and "Back to sign in". A reload brings the
    form back.

## Design brief (for Claude Design, before pieces 4–8)

Every state below needs a mockup, plus the spec dump `CLAUDE.md`
requires (fonts, sizes, hex values, spacing, borders and shadows). Every
form state also needs an **inline-error** variant (the message above
submit, holding an action) and a **field-error** variant.

- **Login**: email, password (toggle), submit, Continue with Google,
  "Forgot password?", "Create an account".
- **Register, form**: name, email, password + confirm (both with
  toggles), submit, Continue with Google, "Already have an account? Sign
  in".
- **Code step** (shared by register and login): "We sent a code to
  {email}", a 6-digit input, submit, and Resend in both its ready and
  counting-down states.
- **Confirmed, please sign in** (fallback B): a success message and a
  sign-in form with the email prefilled.
- **Forgot, form**: email, submit, "Back to sign in".
- **Forgot, sent**: the confirmation copy, Resend (ready and counting
  down), "Back to sign in".
- **Reset, form**: new password + confirm (toggles), submit.
- **Reset, invalid link**: message plus "Request a new link".
- Desktop plus the one mobile breakpoint, as for every other screen.

## Acceptance criteria

Visual acceptance criteria per screen get added here once the
screenshots exist.

- [ ] `apiFetch` takes an options object `{ refreshOn401?: boolean }`
      (default `true`) and `hasRetried` has moved into it. Every existing
      caller still behaves the same.
- [ ] With `refreshOn401: false`, a 401 throws `ApiError` with the body's
      code. `/auth/refresh` is not called and no session-expired listener
      fires.
- [ ] `auth/data/api.ts` has `register`, `confirmEmail`,
      `resendConfirmation`, `login`, `forgotPassword` and `resetPassword`,
      each passing `refreshOn401: false`.
- [ ] `authErrors.ts` maps every code under decision 10 to field, inline
      or toast. `getAuthErrorMessage` has its
      `email_registered_with_password` entry.
- [ ] Zod: password limit counted in UTF-8 bytes (e.g. a 72-character
      password with multi-byte characters is rejected), mismatch error on
      the confirm field, code must be exactly 6 digits.
- [ ] `startSession`: sets the token; on `/me` failure clears it and
      rethrows; removes non-session queries before writing the session.
- [ ] The four routes exist; signed-in users are redirected to `/menu`;
      no success handler calls `navigate()`.
- [ ] Wrong password shows "invalid credentials" inline (the original bug,
      fixed).
- [ ] Register → code → lands on `/menu` without retyping the password.
- [ ] Reload on the code step brings back the form. Confirming without a
      held password (or after a failed automatic login) shows fallback B
      with the email prefilled.
- [ ] Login as an unconfirmed user sends a code and shows the code step;
      a `resend_too_soon` on that automatic resend shows no error.
- [ ] Resend is disabled for 60s after a send; on a 429 it counts down
      from `Retry-After`.
- [ ] Forgot → "sent" state → link → reset → `/menu` with the
      signed-out-elsewhere toast.
- [ ] `/reset-password` with no token shows the invalid-link state; a
      used or expired token shows the inline message with "Request a new
      link".
- [ ] Header/mobile sign-in go to `/login`; pricing goes to `/register`;
      Hero's Google button is unchanged.
- [ ] `autocomplete` attributes per decision 11.
- [ ] `npm test`, `npm run build`, `npm run lint`, `npm run format:check`
      clean.

## Non-goals

- Returning users to where they were before sign-in. Every sign-in lands
  on `DEFAULT_AUTHENTICATED_ROUTE`, as Google does. Doing it properly
  means threading it through the OAuth redirect too, so it's a separate
  ticket.
- Closing account enumeration (a `crockpot-go` change across five
  channels; flag only).
- Changing your password while signed in (`crockpot-go`
  `master-spec.md:841`).
- A backend endpoint to check a reset token before submitting.
- Showing users how strong their password is, beyond the 8–72 byte rule.

## Verification modes

- **Logic, test-first** (`npm test`): `client.test.ts` (the option);
  `authErrors.test.ts` and the schema tests (table cases); `startSession`
  (order of operations, `/me` failure); the countdown hook; the code
  step's automatic login and its fallback to B.
- **Service boundary, per piece**, against local `crockpot-go` and the
  real Neon dev DB: each screen piece runs its real endpoint before it's
  called done, not in one batch at the end. Codes and links arrive by
  real Resend email. Per CFE-002a's lesson, expect to
  `DELETE FROM users WHERE email = …` between runs, and check that table
  first if a flow fails unexpectedly.
- **Visual**: each screen state is compared with its Claude-Design
  screenshot, by you, on the running app (`npm run dev`). Each screen
  piece is approved on screen before it's wired up.
- **Interactive (you, at close-out)**:
  1. Register → email code → `/menu`.
  2. Log out, then wrong password → inline error.
  3. A Google account through the email login → "uses Google sign-in"
     with a Google button.
  4. Register without confirming, reload, log in → code step → `/menu`.
  5. Forgot → email link → reset → `/menu` + toast; open the same link
     again → `token_invalid` state.
  6. `/reset-password` with no token → invalid-link state.
  7. Signed in, visit `/login` → redirected to `/menu`.
  8. Browse recipes signed out, sign in by email, back to browse → the
     hearts show your real favourites.
- **Limits, through the real client**: click Resend, then click it again
  before 60s are up. After a reload, Resend → countdown from the
  server's value. 11 wrong passwords in a minute → inline "try again in
  N minutes".

## Roadmap

One commit per piece, lowest layer first.

0. **`crockpot-go` `CROC-067`** (you, alongside the designs): `Retry-After`
   on the three `resend_too_soon` responses.
1. `apiFetch` options object + tests.
2. Auth data layer: six `api.ts` calls, `authErrors.ts`,
   `getAuthErrorMessage` entries, Zod schemas + tests.
3. `startSession` + tests.
4. `/login`, a thin visible slice (form, Google, links, the signed-out
   guard): on-screen approval, then wire submit and errors through
   `startSession`. *Needs designs.*
5. `/register` + `ConfirmCodeStep` + countdown + automatic login with
   fallback B. *Needs designs and CROC-067.*
6. Login's 403 → code step.
7. `/forgot-password` + sent state. *Needs designs.*
8. `/reset-password` states. *Needs designs.*
9. Entry points rewired + Google-callback copy.
