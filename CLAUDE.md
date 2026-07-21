# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then production build via Vite
- `npm run lint` — lint with Oxlint
- `npm run preview` — preview the production build locally

There is no test suite configured yet.

## Environment

Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_ANON_KEY` (from the Supabase project's Settings → API page) to run anything that touches `src/lib/supabase.ts`. `.env.local` is gitignored — never commit real keys, and never put the Supabase *secret* key in a `VITE_`-prefixed var (it would ship in the client bundle).

`supabase/schema.sql` has the database schema (run once, manually, in the Supabase SQL Editor — this repo has no CLI/migration tooling wired up). It creates a `students` table (roster of valid IDs + activation state, RLS-locked with no direct select/insert/update policies) and three `SECURITY DEFINER` RPC functions (`resolve_login_email`, `check_student_number`, `link_student_account`) that are the only way to read/write it from the client. See `src/lib/auth.ts` for how they're used.

## Architecture

React + TypeScript + Vite SPA for Tilad, an Arabic-first (RTL) educational platform. Routing is via `react-router-dom` (`BrowserRouter` in `src/main.tsx`).

- `src/App.tsx` — route table: `/`, `/activate`, `/reset-password`, `/reset-password/confirm` are public; `/home` and everything under it (`/home/courses`, `/home/library`, `/home/videos`, `/courses/:id`) are wrapped in `<RequireAuth>` and require a Supabase session
- `src/pages/Login.tsx` — sign-in page. **Organization sign-in only** (KFUPM, hardcoded as the sole option) — this is the default and only implemented mode; a "حساب فردي" (individual account) tab exists in the UI but is disabled/"coming soon". Students sign in with a university ID, not an email — `signInWithStudentId` in `src/lib/auth.ts` resolves the ID to an email via the `resolve_login_email` RPC, then calls Supabase's normal `signInWithPassword`.
- `src/pages/Activate.tsx` — first-time account setup: ID + email + password, calls `activateStudent` (validates the ID against the roster, calls `supabase.auth.signUp`, then links the new auth user back to the roster row). New accounts are auto-confirmed (no email verification step configured yet).
- `src/pages/ResetPassword.tsx` / `ResetPasswordConfirm.tsx` — forgot-password flow via `requestPasswordReset` (`supabase.auth.resetPasswordForEmail`) and `supabase.auth.updateUser`. `ResetPassword.tsx` always shows the same "check your email" message regardless of whether the ID was found, to avoid leaking which IDs are registered.
- `src/components/RequireAuth.tsx` — route guard checking `supabase.auth.getSession()`/`onAuthStateChange`; redirects to `/` when there's no session.
- `src/pages/Home.tsx` — slim post-login landing page: welcome hero banner + three cards linking out to `/home/courses`, `/home/library`, `/home/videos`
- `src/pages/Courses.tsx` — البرامج (Programs/Courses) list, from `src/data/courses.ts`; cards link to `/courses/:id`. Courses can be marked `disabled: true` (currently STEM Racing and ELO) to render a "غير مشترك" badge and a non-clickable disabled CTA instead of a link — only ISEF is active right now.
- `src/pages/Library.tsx` — مكتبة تلاد (Tilad's Library) content categories
- `src/pages/Videos.tsx` — الفيديوهات والجلسات المباشرة (Videos & Live Sessions)
- `src/pages/CourseDetail.tsx` — per-course page (looked up from `src/data/courses.ts` by `id`), with content category cards (lessons, files, study plans) and community links; all placeholder content pending real material
- `src/data/courses.ts` — course catalog (currently ISEF, STEM Racing, ELO); course descriptions are placeholder copy pending real content
- `src/lib/supabase.ts` — Supabase client, reads `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` from env
- `src/lib/auth.ts` — auth helpers built on the Supabase client and the RPC functions in `supabase/schema.sql`: `signInWithStudentId`, `activateStudent`, `requestPasswordReset`, `signOut`
- `src/components/` — shared UI: `Button` (pill, variants `primary`/`secondary`/`ghost`, sizes `lg`/`md`/`sm`), `Logo` (renders the official PNG wordmark from `public/assets/`; defaults to an `auto` variant that CSS-swaps maroon↔white based on the active theme), `Header` (marketing header with `NavLink`s to the three section pages, used on every post-login page), `ThemeToggle` (light/dark toggle, persisted to `localStorage`), `BackLink` (pill "back" link used at the top of section/detail pages)

### Design system

Styling follows the Tilad Design System (maroon monochrome, bilingual, light/dark) — tokens live as CSS custom properties in `src/index.css` (colors, radii, spacing, type). Key rules to preserve:

- **Monochrome only** — maroon shades + ink/surface neutrals. Never introduce other hues; semantic states (error/success) are expressed via maroon tone + weight + icon, not red/green.
- **Pills everywhere** — buttons and badges use `--radius-pill` (999px). Cards use `--radius-card` (20px), hero/feature panels use `--radius-hero` (28px).
- Dark mode is toggled via `data-theme` on `<html>` (set by `ThemeToggle`), falling back to `prefers-color-scheme`. Dark surfaces are maroon-black, never gray-black.
- The whole app is Arabic/RTL (`<html lang="ar" dir="rtl">` in `index.html`); an English/LTR version has not been built.
- Fonts: Baloo Bhaijaan 2 (display/headings, 700–800) and IBM Plex Sans Arabic (body/UI, 400–600), loaded via Google Fonts in `index.html`.

Linting is via Oxlint (`.oxlintrc.json`), not ESLint.
