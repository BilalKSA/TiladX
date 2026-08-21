# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Start here

- **[`docs/PROJECT.md`](docs/PROJECT.md)** — what Tilad is, current status, the roles involved, and the hard rule about never committing student PII. Read this first.
- **[`docs/IDENTITY.md`](docs/IDENTITY.md)** — brand/design system (colors, type, radii, RTL rules, voice/tone, component patterns to reuse).
- **[`docs/TECH_STACK.md`](docs/TECH_STACK.md)** — stack, directory structure, routing table, auth architecture, email infrastructure.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then production build via Vite
- `npm run lint` — lint with Oxlint
- `npm run preview` — preview the production build locally
- `npm run deploy` — build then deploy to **production** (`tilad-sa` → tilad.org)
- `npm run deploy:staging` — build then deploy to **staging** (`stgtilad` → stgtilad.web.app)

Both require `firebase login` once locally. Hosting is target-scoped: `.firebaserc` maps `production` → `tilad-sa` and `staging` → `stgtilad`, and `firebase.json` carries one hosting block per target. Never run a bare `firebase deploy --only hosting` — with targets configured it deploys to *both* sites at once.

There is no test suite configured yet.

## Environment

Copy `.env.example` to `.env.local`. See `docs/TECH_STACK.md` → "Environment variables" for what each key is for and which ones are safe to expose client-side. `.env.local` is gitignored — never commit real keys.

`supabase/schema.sql` has the database schema (run once, manually, in the Supabase SQL Editor — no CLI/migration tooling wired up). Real student/admin data is loaded separately, outside this repo — see `docs/PROJECT.md`.

Linting is via Oxlint (`.oxlintrc.json`), not ESLint.
