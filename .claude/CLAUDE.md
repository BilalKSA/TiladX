# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Start here

- **[`docs/PROJECT.md`](../docs/PROJECT.md)** — what Tilad is, current status, the roles involved, and the hard rule about never committing student PII. Read this first.
- **[`.claude/DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md)** — **read before writing any CSS or building a page.** Tokens, layout primitives, the band/frame page model, RTL and motion rules, and a list of gotchas that have each cost real debugging time.
- **[`docs/IDENTITY.md`](../docs/IDENTITY.md)** — brand rationale behind the design system (colors, type, voice/tone). Note: it is out of step with the code in four places, listed at the bottom of `DESIGN_SYSTEM.md`.
- **[`docs/TECH_STACK.md`](../docs/TECH_STACK.md)** — stack, directory structure, routing table, auth architecture, email infrastructure.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then production build via Vite
- `npm run lint` — lint with Oxlint
- `npm run preview` — preview the production build locally
- `npm run deploy` — build then deploy the **landing site** (`tilad-sa` → tilad.org)
- `npm run deploy:app` — build then deploy the **app** (`tilad-app` → app.tilad.org)
- `npm run deploy:all` — both production origins in one go
- `npm run deploy:staging` — build then deploy to **staging** (`stgtilad` → stgtilad.web.app)

All require `firebase login` once locally. Hosting is target-scoped: `.firebaserc` maps `production` → `tilad-sa`, `app` → `tilad-app`, `staging` → `stgtilad`, and `firebase.json` carries one hosting block per target. Never run a bare `firebase deploy --only hosting` — with targets configured it deploys to *every* site at once.

### Split hosting

The landing page is served from **tilad.org**; everything behind sign-in is served from **app.tilad.org**. These are **two separate builds**, not one bundle behind redirects — a landing visitor must not be able to download the app.

| Build | Root | Output | Deployed to |
|---|---|---|---|
| `npm run build:site` | `src/roots/SiteRoot.tsx` | `dist-site/` | tilad.org |
| `npm run build:app` | `src/roots/AppRoot.tsx` | `dist-app/` | app.tilad.org |
| `npm run build` | `src/App.tsx` (combined) | `dist/` | staging, and `npm run dev` |

`src/main.tsx` imports `@root`, which `vite.config.ts` aliases to one of the three based on `BUILD_TARGET`. It is a **static** alias on purpose: the unselected root never enters the module graph, so its pages are absent from the output rather than merely un-routed.

**Never import an app page from `SiteRoot` or anything it reaches** — one such import silently pulls the app back into the landing bundle. Cross between the two halves with `CrossLink`. The same applies to CSS: a shared stylesheet imported by both halves ships to both, which is why the Files page has its own `Files.css` rather than borrowing from `Landing.css`.

Verify a split build with `grep -c enrollments dist-site/assets/*.js` — it should be `0`.

Because React Router handles `<Link>` clicks client-side, hosting redirects never fire for in-app navigation. Any link that crosses the boundary must therefore go through `CrossLink` (`src/components/CrossLink.tsx`), which renders a router `Link` when the target is same-origin and a real `<a>` when it isn't. Origins come from `VITE_SITE_ORIGIN` / `VITE_APP_ORIGIN`, set in **`.env.production`** (committed — public URLs, no secrets). Vite loads that file for `vite build` only, so production splits while `npm run dev` keeps every link on localhost. Never put those keys in `.env.local`: it is read in dev too, and sign-in would jump from localhost to the live app.

Staging stays a single combined site — one origin, no split.

There is no test suite configured yet.

## Environment

Copy `.env.example` to `.env.local`. See `docs/TECH_STACK.md` → "Environment variables" for what each key is for and which ones are safe to expose client-side. `.env.local` is gitignored — never commit real keys.

`supabase/schema.sql` has the database schema (run once, manually, in the Supabase SQL Editor — no CLI/migration tooling wired up). Real student/admin data is loaded separately, outside this repo — see `docs/PROJECT.md`.

Linting is via Oxlint (`.oxlintrc.json`), not ESLint.
