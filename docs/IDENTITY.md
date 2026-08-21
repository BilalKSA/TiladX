# Tilad Identity & Design System

Tilad's brand is **maroon monochrome, bilingual, Arabic-first**. Tokens live as CSS custom properties in [`src/index.css`](../src/index.css) — this doc explains the *rules*, not just the values, so new UI stays consistent.

## Non-negotiable rules

1. **Monochrome UI on a pastel ground.** Every interface element — text, buttons, badges, borders, icons, states — stays maroon + ink/surface neutrals. Semantic states (error, success, warnings) are expressed through maroon tone + font weight + icon, never red/green/yellow. E.g. the login error banner uses `--maroon-900` text on `--maroon-50` background, not red.

   The **one** exception is the brand background (`public/assets/tilad-background.webp`), the lilac/blue/peach gradient from the 2026 guidelines, applied on `:root` in `index.css`. It is a backdrop, not a palette — nothing in the UI should sample colours from it. Dark mode drops the image and keeps the flat maroon-black surface, since the pastels turn to haze against it.

   *(This replaces the previous "never introduce another hue" rule, which predated the 2026 guidelines.)*
2. **Pills everywhere.** Buttons and badges use `--radius-pill` (999px, fully rounded). Cards use `--radius-card` (14px). Hero/feature panels use `--radius-hero` (20px). Inputs use `--radius-input` (8px). Panels use `--radius-panel` (12px). Everything except pills is deliberately on the tight side — the softness comes from the pills, not from rounding every rectangle.
3. **RTL first.** The whole app is Arabic (`<html lang="ar" dir="rtl">` in `index.html`). No English/LTR version exists. Don't hardcode `margin-left`/`right` — prefer logical properties (`padding-inline-start`, `inset-inline-start`, etc.) so it wouldn't silently break if LTR is ever added.
4. **Dark mode is a first-class target**, not an afterthought. Every new color usage needs both a light and dark value. Dark surfaces are **maroon-black**, never neutral gray-black.
5. **Bilingual wordmark, not translation.** The logo (`Logo` component, `public/assets/tilad-logo-*.webp`) shows تلاد (Arabic) stacked above "tilad" (Latin) — official PNG assets, not a recreated/rotated/recolored version. `Logo`'s default `auto` variant CSS-swaps maroon↔white based on the active theme; only pass `variant="white"` explicitly for fixed-dark surfaces (e.g. the footer).

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
| `--border-strong` | `#dcc3c9` | Higher-contrast border on elevated cards |
| `--surface-invert` | `#3f0a16` | Deep maroon full-bleed band (landing story section) |
| `--on-invert` / `--on-invert-muted` | `#ffffff` / `#d9b9c1` | Text on `--surface-invert` |

Dark mode overrides `--surface-*`, `--border`, `--ink*`, and `--primary` (lighter maroon `#8c3e52` so it stays legible on dark backgrounds) — see `:root[data-theme='dark']` and the `prefers-color-scheme` fallback in `index.css`.

Theme switching: `ThemeToggle` sets `data-theme` on `<html>` and persists to `localStorage`; CSS falls back to `prefers-color-scheme: dark` when no explicit preference is stored.

## Typography

Per the 2026 brand guidelines (`public/assets/Tilad Brand Guidelines Presentation (1).pdf`):

- **Arabic** — Tajawal, weights 400/500/700/800.
- **Latin** — Manrope, variable 400–800.

Both are loaded via a single Google Fonts `<link>` in `index.html` (not self-hosted), and exposed as two tokens:

```css
--display: 'Manrope', 'Tajawal', sans-serif;
--sans: 'Manrope', 'Tajawal', system-ui, sans-serif;
```

**Order is load-bearing.** Manrope has no Arabic coverage, so Arabic characters fall through to Tajawal automatically while Latin renders in Manrope — one stack, correct font per script, no `:lang()` rules or span wrapping. Reversing the order would let Tajawal claim the Latin text too.

> The PDF embeds **Telegraf** as its display face rather than Manrope. Manrope is what's implemented, on instruction — worth reconciling with whoever produced the deck.

## Maroon surface patterns

One decorative asset from the 2026 guidelines (source art in `brand-source/`, installed optimised):

| Asset | Art | Used on |
|---|---|---|
| `tilad-pattern-swords.webp` | Crossed sweeping arcs | Footer, spanning the full width |

It is low-alpha white on transparency, so it's applied at **full strength** — the subtlety belongs to the artwork, not to a CSS `opacity` value. Applied via `::before` with `overflow: hidden` on the container, and `> * { position: relative; z-index: 1 }` to keep real content above.

**Only flat maroon surfaces get it.** Anything already carrying the halftone dot texture — `.halftone`, the landing hero, the inverted band, the CTA panel — is left alone; the two textures fight each other. Button-sized maroon chips (badges, icon tiles, pills) are too small to carry pattern art and are also excluded.

The mark/arrow watermark that also lives in `brand-source/` is deliberately **not** used — it read as clutter against the wordmark. The source art is still there if that changes.

## Elevation

Four-step shadow scale, all maroon-tinted in light mode so shadows read as brand rather than neutral gray; in dark mode they switch to near-black, since a maroon shadow is invisible on a maroon-black surface. Both sets are defined in `index.css`.

| Token | Use |
|---|---|
| `--shadow-soft` | Resting state — FAQ rows, icon chips |
| `--shadow-md` | Standard elevated card |
| `--shadow-lg` | Hover/active lift, the quiz panel |
| `--shadow-hero` | Full hero and CTA panels |

Depth is layered, not flat: filled panels (hero, CTA) use a radial highlight over a linear maroon gradient plus a halftone dot layer on a pseudo-element, never a single solid fill.

## Spacing & radii scale

4px base unit: `--space-1` (4px) through `--space-8` (64px), doubling roughly at each step (4, 8, 12, 16, 24, 32, 48, 64). Use these instead of arbitrary pixel values.

## Voice & tone

Copy is **colloquial Saudi Arabic**, not formal MSA — e.g. "اختر القسم اللي ودّك تشوفه" (not "اختر القسم الذي ترغب في مشاهدته"). The home page greeting is gender-aware and personalized:

- Male: **هلا بصانع المستقبل [الاسم]**
- Female: **هلا بصانعة المستقبل [الاسم]**

(driven by the `gender` column on the signed-in user's `students` row — see `TECH_STACK.md`). Keep this warm, direct, second-person tone in any new user-facing copy — avoid stiff/corporate phrasing.

## Component patterns to reuse (don't reinvent)

- **`Button`** (`src/components/Button.tsx`) — variants `primary`/`secondary`/`ghost`/`on-primary`, sizes `lg`/`md`/`sm`, built-in `loading` prop (spinner + auto-disable, see `Spinner.tsx`). `on-primary` (white bg, maroon text) is for CTAs sitting on a filled maroon surface like `.tld-hero` — `primary`/`secondary`/`ghost` all have poor contrast there. Also exported as raw CSS classes (`tld-button tld-button--primary tld-button--sm`) for non-`<button>` elements like `<Link>`/`<a>` styled as buttons.
- **`.tld-card`** — standard card (white/dark surface, border, `radius-card`, flex column). `.tld-card--disabled` (opacity 0.6) + a `.tld-pill-tag.tld-course-soon` badge is the established pattern for "not available yet" content (disabled courses, previously the locked posters section).
- **`.tld-pill-tag`** / **`.tld-pill-tag--outline`** — filled or outlined maroon pill, used for tags/badges.
- **`.tld-badge`** — circular numbered badge (`01`, `02`, `03`) for ordered section headings.
- **`BackLink`** — consistent "← back" pill link at the top of sub-pages.
- **`Footer`** — shared maroon-900 brand footer (logo, tagline, social icons) used on every post-login page.

## Email design (Resend-sent HTML)

Transactional/announcement emails (`email.js`, `workshop-email.js`) intentionally mirror the web identity within email-client constraints: maroon (`#5F182A`) header block with the wordmark, white card body, Tajawal with system-font fallback (Tahoma/Arial — most mail clients strip custom `@font-face`, so this is a declaration of intent more than a rendering guarantee), pill-shaped CTA button, RTL throughout. Table-based layout (`role="presentation"` tables), not flexbox/grid, for mail client compatibility.
