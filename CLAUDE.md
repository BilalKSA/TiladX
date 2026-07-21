# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then production build via Vite
- `npm run lint` — lint with Oxlint
- `npm run preview` — preview the production build locally

There is no test suite configured yet.

## Architecture

React + TypeScript + Vite SPA for Tilad, an Arabic-first (RTL) educational platform. Routing is via `react-router-dom` (`BrowserRouter` in `src/main.tsx`).

- `src/App.tsx` — route table: `/` is the sign-in page, `/home` is the post-login home page
- `src/pages/Login.tsx` — sign-in page. Currently **organization sign-in only** (KFUPM, hardcoded as the sole option) — this is the default and only implemented mode; a "حساب فردي" (individual account) tab exists in the UI but is disabled/"coming soon". There is no real backend/auth wired up yet — submitting navigates straight to `/home`. Actual valid ID validation logic will be provided later.
- `src/pages/Home.tsx` — post-login page with three sections: مكتبة تلاد (Library/Resources), الفيديوهات والجلسات المباشرة (Videos & Live Sessions), الدورات (Courses)
- `src/data/courses.ts` — course catalog (currently ISEF, STEM Racing, ELO); course descriptions are placeholder copy pending real content
- `src/components/` — shared UI: `Button` (pill, variants `primary`/`secondary`/`ghost`, sizes `lg`/`md`/`sm`), `Logo` (bilingual wordmark, Arabic above Latin below), `Header` (marketing header used on Home), `ThemeToggle` (light/dark toggle, persisted to `localStorage`)

### Design system

Styling follows the Tilad Design System (maroon monochrome, bilingual, light/dark) — tokens live as CSS custom properties in `src/index.css` (colors, radii, spacing, type). Key rules to preserve:

- **Monochrome only** — maroon shades + ink/surface neutrals. Never introduce other hues; semantic states (error/success) are expressed via maroon tone + weight + icon, not red/green.
- **Pills everywhere** — buttons and badges use `--radius-pill` (999px). Cards use `--radius-card` (20px), hero/feature panels use `--radius-hero` (28px).
- Dark mode is toggled via `data-theme` on `<html>` (set by `ThemeToggle`), falling back to `prefers-color-scheme`. Dark surfaces are maroon-black, never gray-black.
- The whole app is Arabic/RTL (`<html lang="ar" dir="rtl">` in `index.html`); an English/LTR version has not been built.
- Fonts: Baloo Bhaijaan 2 (display/headings, 700–800) and IBM Plex Sans Arabic (body/UI, 400–600), loaded via Google Fonts in `index.html`.

Linting is via Oxlint (`.oxlintrc.json`), not ESLint.
