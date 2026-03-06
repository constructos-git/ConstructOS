# AGENTS.md

## Cursor Cloud specific instructions

### Overview

ConstructOS is a React 18 + TypeScript SPA (Vite) that connects to a **cloud-hosted Supabase** backend. There is no local backend server — the only process to run locally is the Vite dev server.

### Running the dev server

```bash
pnpm run dev          # starts Vite on port 5173
```

### Lint / Typecheck / Build

See `package.json` scripts. Key commands:
- `pnpm run lint` — ESLint (pre-existing errors exist; `--max-warnings 0` causes exit code 1)
- `pnpm run typecheck` — `tsc --noEmit` (pre-existing TS errors exist)
- `pnpm run build` — runs `tsc && vite build`; will fail until the pre-existing TS errors are resolved

### Environment variables

The app **requires** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`. Without real Supabase credentials the app renders the login page but cannot authenticate. Placeholder values keep the dev server alive.

### Gotchas

- **Missing file**: `src/modules/EstimateBuilderAI/components/Wizard/ItemConfigurationModal.tsx` is imported by `AnswerCardGrid.tsx` but was not committed to the repo. A stub was created during setup to unblock the dev server.
- **No automated test framework**: the repo has no Jest, Vitest, or Playwright configuration. There are no automated tests to run.
- **pnpm lockfile**: use `pnpm install --frozen-lockfile` (a `package-lock.json` also exists but `pnpm-lock.yaml` is authoritative).
- **esbuild build scripts**: pnpm may warn about ignored build scripts for `esbuild`. This does not affect the dev server.
- **Husky**: the `prepare` script runs `husky install` (deprecated warning is benign).
