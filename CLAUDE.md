# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then production build via Vite
- `npm run lint` — lint with Oxlint
- `npm run preview` — preview the production build locally

There is no test suite configured yet.

## Architecture

This is a React + TypeScript + Vite single-page app (educational platform site), currently a single-page marketing/landing layout with no routing or state management library.

- `src/main.tsx` — entry point, mounts `App` into `#root`
- `src/App.tsx` — the entire page: header/nav, hero, courses section, footer
- `src/App.css` / `src/index.css` — styling; `index.css` defines shared CSS custom properties (colors, fonts) under `:root`, including a `prefers-color-scheme: dark` override — reuse these variables rather than hardcoding colors
- `public/` — static assets served as-is (e.g. `favicon.svg`)

Linting is via Oxlint (`.oxlintrc.json`), not ESLint.
