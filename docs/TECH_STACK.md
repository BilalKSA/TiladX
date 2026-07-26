# Tilad — Tech Stack & Structure

## Stack summary

| Layer | Choice | Notes |
|---|---|---|
| Frontend framework | React 19 + TypeScript | Vite 8 (`@vitejs/plugin-react`) |
| Routing | `react-router-dom` v7 | `BrowserRouter` in `src/main.tsx`, nested `<Route>` for auth-gated pages |
| Backend | Supabase (Postgres + Auth) | No custom server — client talks to Supabase directly via `@supabase/supabase-js` |
| Hosting | Firebase Hosting | Static SPA only; Supabase has no static-hosting product, so this is a separate service from the backend |
| Email | Resend (SMTP + REST API) | Both for Supabase Auth emails (password reset) and standalone announcement scripts |
| Linting | Oxlint (`.oxlintrc.json`) | Not ESLint |
| Package manager | npm | `package-lock.json` committed |

No test suite is configured. No SSR/meta-framework (plain Vite SPA) — routing is fully client-side, so Firebase Hosting rewrites every path to `index.html` (`firebase.json`).

## Commands

```bash
npm run dev       # Vite dev server with HMR
npm run build     # tsc -b && vite build
npm run lint      # Oxlint
npm run preview   # preview the production build locally
npm run deploy    # build + firebase deploy --only hosting
```

`npm run deploy` requires a one-time `firebase login` (interactive Google OAuth — must be run by a human, not automatable) and `firebase use --add` to link a project (writes `.firebaserc`, currently linked to `tilad-sa`).

## Environment variables

`.env.local` (gitignored) is copied from `.env.example`:

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — read by `src/lib/supabase.ts` via `import.meta.env`. **Public/client-safe** (protected by RLS) — the `VITE_` prefix means Vite bundles these into the shipped JS, which is intentional for the anon key.
- `RESEND_API_KEY` — used only by `email.js`/`workshop-email.js`, standalone Node scripts run via `node --env-file=.env.local <script>`. **Not** `VITE_`-prefixed, so it never reaches client code — this distinction matters, never rename it to start with `VITE_`.

Never put a Supabase *secret*/service-role key in this project at all — nothing here needs it (see Auth architecture below), and doing so would be a standing risk.

## Directory structure

```
src/
  App.tsx              route table (see Routing below)
  main.tsx             entry point, wraps App in BrowserRouter
  index.css            design tokens + global styles (see docs/IDENTITY.md)
  pages/                one file per route
  components/           shared UI (Button, Logo, Header, Footer, ThemeToggle, BackLink, Spinner, RequireAuth)
  data/courses.ts       static course catalog (not in Supabase — see below)
  lib/
    supabase.ts         Supabase client singleton
    auth.ts             auth helper functions wrapping Supabase Auth + the RPCs in supabase/schema.sql
supabase/
  schema.sql             DB schema — run manually in the Supabase SQL Editor, no migration tooling
public/
  assets/                logo PNGs, poster PDFs — static, served as-is
firebase.json             Hosting config (SPA rewrite to index.html)
email.js                  welcome/activation email — dry-run by default, --send to actually email the roster
workshop-email.js         one-off announcement email — sends to admin only by default, --send for the roster
docs/
  PROJECT.md              this project's purpose/status (start here)
  IDENTITY.md             brand/design system
  TECH_STACK.md           this file
```

## Routing (`src/App.tsx`)

Public routes: `/`, `/activate`, `/reset-password`, `/reset-password/confirm`.

Everything else is wrapped in a parent `<Route element={<RequireAuth />}>`, which requires a live Supabase session (redirects to `/` otherwise): `/home`, `/home/courses`, `/home/library`, `/home/videos`, `/courses/:id`.

| Path | Page | Notes |
|---|---|---|
| `/` | `Login.tsx` | Organization sign-in by account number, org selector locked to a single option |
| `/activate` | `Activate.tsx` | First-time setup: account number + email + password |
| `/reset-password` | `ResetPassword.tsx` | Request a reset link by account number |
| `/reset-password/confirm` | `ResetPasswordConfirm.tsx` | Lands here from the emailed recovery link, sets new password |
| `/home` | `Home.tsx` | Personalized greeting + links to the 3 sections |
| `/home/courses` | `Courses.tsx` | البرامج — from `src/data/courses.ts` |
| `/home/library` | `Library.tsx` | مكتبة تلاد — content categories + posters subsection |
| `/home/videos` | `Videos.tsx` | الفيديوهات والجلسات المباشرة |
| `/courses/:id` | `CourseDetail.tsx` | Per-course page, looked up by `id` from `courses.ts` |

## Auth architecture

Students authenticate by an **account number** (e.g. `100001`), not email — but Supabase Auth only supports email/phone sign-in. The `students` table bridges this: it maps account number → real email, and the client resolves the email *before* calling Supabase's normal password auth.

### `students` table (`supabase/schema.sql`)

```
id, student_number (unique), full_name, organization, email, phone, gender,
role ('student' | 'admin'), auth_user_id (→ auth.users), activated_at, created_at
```

RLS is enabled with **no direct select/insert/update policies** — the table is only reachable through `SECURITY DEFINER` RPC functions, so the anon/authenticated client can never scrape the roster, emails, or phone numbers directly:

- **`resolve_login_email(student_number)`** — returns the email *only if activated*. Used at sign-in and password-reset time. Granted to `anon, authenticated`.
- **`check_student_number(student_number)`** — true if the number exists and is *not yet* activated. Used at activation time to validate before asking for a password. Granted to `anon`.
- **`link_student_account(student_number, email)`** — sets `auth_user_id = auth.uid()` and `activated_at = now()`. Must be called with the new user's own session right after `signUp` (relies on `auth.uid()`). Granted to `authenticated` only.
- **`get_my_profile()`** — returns the caller's own `full_name`/`gender`/`role`, scoped to `auth.uid()`. Used by `Home.tsx` for the personalized greeting. Granted to `authenticated`.

### Flows (`src/lib/auth.ts`)

- **Sign in** (`signInWithStudentId`): resolve email via RPC → `supabase.auth.signInWithPassword`. A single generic error message covers "ID not found," "not activated," and "wrong password" alike — never reveals which case it is (avoids account enumeration).
- **Activate** (`activateStudent`): `check_student_number` → `supabase.auth.signUp` → `link_student_account`. New accounts are **auto-confirmed** (email confirmation is disabled in the Supabase Auth dashboard) so activation signs the user in immediately with no email round-trip.
- **Reset password** (`requestPasswordReset`): resolves email, and **silently no-ops if not found** (same anti-enumeration principle — the UI always shows the same "check your email" message regardless).
- **Route guard** (`RequireAuth.tsx`): checks `supabase.auth.getSession()` + subscribes to `onAuthStateChange`; renders `<Outlet />` or redirects to `/`.

### ⚠️ Known footgun: orphaned auth.users rows

If `signUp` succeeds but `link_student_account` fails or never runs (e.g. because "Confirm email" was accidentally left on, so no session existed to authorize the RPC), you get an `auth.users` row with a real email but **no working password known to anyone**, while the `students` row still shows as unactivated. Symptom: activation says "already activated" (misleading — it's actually just checking `activated_at`) or a fresh `signUp` fails with `user_already_exists`, while `resolve_login_email` still returns null (not linked). This happened once with the admin account. Fix: trigger `/auth/v1/recover` directly for that email (bypasses the app-level `students`-table gate, which doesn't apply to a real `auth.users` row) to let them set a password on the existing auth account, then manually run:

```sql
update public.students
set auth_user_id = (select id from auth.users where email = '<email>'),
    activated_at = now()
where student_number = '<number>';
```

## Courses (`src/data/courses.ts`)

Static, hardcoded array (`Course[]`) — **not** stored in Supabase. Each course has `id`, `tag`, `title`, `description`, optional `disabled`. Disabled courses (currently `stem-racing`, `elo`) render a "غير مشترك" badge and a non-clickable disabled CTA instead of linking to `/courses/:id`. Only `isef` is currently active. If/when course content needs to be admin-editable, this would need to move into Supabase — it hasn't yet.

## Email infrastructure

Two standalone Node scripts at the repo root (run directly with `node`, not part of the Vite build):

- **`email.js`** — welcome/activation email (name + account number + "فعّل حسابك الآن" CTA to `/activate`). Default (no args) is a **dry run**: renders one HTML file per student into `email-previews/` (gitignored) for review, sends nothing. `--send` actually emails the full roster via Resend.
- **`workshop-email.js`** — template for one-off announcement emails (currently: a workshop presentation link). Default sends **only to the admin** for preview; `--send` reaches the full roster.

Both read the roster from a CSV **outside this repo** (`~/Desktop/tilad-student-import/students_account_numbers.csv` by default, overridable via `ROSTER_PATH`) — see `docs/PROJECT.md` for why student PII is never committed.

**Sending domain**: `noreply@tilad.org` via Resend. As of this writing, `tilad.org` has DKIM but is **missing an SPF record**, and its DMARC policy (`p=quarantine`) actively spam-folders unauthenticated mail as a result — this has caused repeated real delivery failures. Fix is a single DNS TXT record (`v=spf1 include:resend.net ~all`) on the root domain; verify with `dig +short TXT tilad.org` before assuming email works.

Supabase Auth's own emails (password reset) go through whatever SMTP is configured in the Supabase dashboard (Authentication → Settings) — ideally also routed through Resend for consistent deliverability, though this is a separate configuration surface from the two scripts above.
