# Tilad Identity & Design System

Tilad's brand is **maroon monochrome, bilingual, Arabic-first**. Tokens live as CSS custom properties in [`src/index.css`](../src/index.css) — this doc explains the *rules*, not just the values, so new UI stays consistent.

## Non-negotiable rules

1. **Monochrome only.** Maroon shades + ink/surface neutrals — never introduce another hue. Semantic states (error, success, warnings) are expressed through maroon tone + font weight + icon, never red/green/yellow. E.g. the login error banner uses `--maroon-900` text on `--maroon-50` background, not red.
2. **Pills everywhere.** Buttons and badges use `--radius-pill` (999px, fully rounded). Cards use `--radius-card` (20px). Hero/feature panels use `--radius-hero` (28px). Inputs use `--radius-input` (10px).
3. **RTL first.** The whole app is Arabic (`<html lang="ar" dir="rtl">` in `index.html`). No English/LTR version exists. Don't hardcode `margin-left`/`right` — prefer logical properties (`padding-inline-start`, `inset-inline-start`, etc.) so it wouldn't silently break if LTR is ever added.
4. **Dark mode is a first-class target**, not an afterthought. Every new color usage needs both a light and dark value. Dark surfaces are **maroon-black**, never neutral gray-black.
5. **Bilingual wordmark, not translation.** The logo (`Logo` component, `public/assets/tilad-logo-*.png`) shows تلاد (Arabic) stacked above "tilad" (Latin) — official PNG assets, not a recreated/rotated/recolored version. `Logo`'s default `auto` variant CSS-swaps maroon↔white based on the active theme; only pass `variant="white"` explicitly for fixed-dark surfaces (e.g. the footer).

## Color tokens (light mode)

| Token | Hex | Use |
|---|---|---|
| `--maroon-900` | `#3f0a16` | Darkest — error text, footer background |
| `--maroon-800` | `#4a1020` | — |
| `--maroon-700` / `--primary` | `#5f182a` | Primary brand color — buttons, links, badges |
| `--maroon-600` | `#7a2a3e` | — |
| `--maroon-500` | `#9b4c5f` | — |
| `--maroon-300` | `#c79aa4` | Outline borders on tinted pills |
| `--maroon-100` | `#edd9dd` | Tinted backgrounds (disabled states, "soon" badges) |
| `--maroon-50` | `#f8f0f1` | Faintest tint — hover backgrounds, error banner bg |
| `--surface-page` | `#faf6f4` | Page background |
| `--surface-card` | `#ffffff` | Card/input background |
| `--surface-tint` | `#f3e9eb` | Login page background |
| `--border` | `#eadde0` | Default border |
| `--ink` | `#2e2226` | Primary text |
| `--ink-muted` | `#6e5c61` | Secondary text |
| `--ink-faint` | `#8a787d` | Tertiary/hint text |

Dark mode overrides `--surface-*`, `--border`, `--ink*`, and `--primary` (lighter maroon `#8c3e52` so it stays legible on dark backgrounds) — see `:root[data-theme='dark']` and the `prefers-color-scheme` fallback in `index.css`.

Theme switching: `ThemeToggle` sets `data-theme` on `<html>` and persists to `localStorage`; CSS falls back to `prefers-color-scheme: dark` when no explicit preference is stored.

## Typography

- **Display/headings** — Baloo Bhaijaan 2, weights 700–800. Rounded, friendly, high-personality — used for `h1`/`h2` and the numbered section badges (`01`/`02`/`03`).
- **Body/UI** — IBM Plex Sans Arabic, weights 400–600. Used for `h3`, body copy, buttons, form labels.
- Both loaded via Google Fonts `<link>` in `index.html` (not self-hosted).

## Spacing & radii scale

4px base unit: `--space-1` (4px) through `--space-8` (64px), doubling roughly at each step (4, 8, 12, 16, 24, 32, 48, 64). Use these instead of arbitrary pixel values.

## Voice & tone

Copy is **colloquial Saudi Arabic**, not formal MSA — e.g. "اختر القسم اللي ودّك تشوفه" (not "اختر القسم الذي ترغب في مشاهدته"). The home page greeting is gender-aware and personalized:

- Male: **هلا بصانع المستقبل [الاسم]**
- Female: **هلا بصانعة المستقبل [الاسم]**

(driven by the `gender` column on the signed-in user's `students` row — see `TECH_STACK.md`). Keep this warm, direct, second-person tone in any new user-facing copy — avoid stiff/corporate phrasing.

## Component patterns to reuse (don't reinvent)

- **`Button`** (`src/components/Button.tsx`) — variants `primary`/`secondary`/`ghost`, sizes `lg`/`md`/`sm`, built-in `loading` prop (spinner + auto-disable, see `Spinner.tsx`). Also exported as raw CSS classes (`tld-button tld-button--primary tld-button--sm`) for non-`<button>` elements like `<Link>`/`<a>` styled as buttons.
- **`.tld-card`** — standard card (white/dark surface, border, `radius-card`, flex column). `.tld-card--disabled` (opacity 0.6) + a `.tld-pill-tag.tld-course-soon` badge is the established pattern for "not available yet" content (disabled courses, previously the locked posters section).
- **`.tld-pill-tag`** / **`.tld-pill-tag--outline`** — filled or outlined maroon pill, used for tags/badges.
- **`.tld-badge`** — circular numbered badge (`01`, `02`, `03`) for ordered section headings.
- **`BackLink`** — consistent "← back" pill link at the top of sub-pages.
- **`Footer`** — shared maroon-900 brand footer (logo, tagline, social icons) used on every post-login page.

## Email design (Resend-sent HTML)

Transactional/announcement emails (`email.js`, `workshop-email.js`) intentionally mirror the web identity within email-client constraints: maroon (`#5F182A`) header block with the wordmark, white card body, IBM Plex Sans Arabic with system-font fallback (Tahoma/Arial — most mail clients strip custom `@font-face`), pill-shaped CTA button, RTL throughout. Table-based layout (`role="presentation"` tables), not flexbox/grid, for mail client compatibility.
