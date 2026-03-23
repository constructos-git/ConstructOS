# AGENTS.md

## Cursor Cloud specific instructions

### Overview
ConstructOS is a single React SPA (Vite + React 18 + TypeScript + Tailwind CSS) with a hosted Supabase backend. There are no local backend services or Docker dependencies — the entire backend is a remote Supabase project.

### Environment Variables
The `.env.local` file is required at the repo root. It is auto-created from the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` secrets injected into the environment. Without these, the app crashes at module load time (`src/lib/supabase.ts` calls `assertEnv`).

### Running the Dev Server
- `npm run dev` — Vite dev server on port **5173** (strict port).
- The app redirects unauthenticated users to `/login`. A Supabase user account is required to proceed past the login page.

### Lint / Typecheck / Build
- `npm run lint` — ESLint. Pre-existing errors/warnings exist (141 errors, 417 warnings as of setup).
- `npm run typecheck` — TypeScript `tsc --noEmit`. Pre-existing type errors exist.
- `npm run build` runs `tsc && vite build` — **will fail** due to pre-existing TypeScript errors. Use `npx vite build` to skip tsc if you only need a Vite bundle (this also has a pre-existing missing import in `AnswerCardGrid.tsx` that was resolved by adding a stub `ItemConfigurationModal.tsx`).

### Known Pre-existing Issues
- `src/modules/EstimateBuilderAI/components/Wizard/ItemConfigurationModal.tsx` was missing from the repo and is referenced by `AnswerCardGrid.tsx`. A minimal stub was created to unblock the dev server.
- The `npm run build` script (`tsc && vite build`) fails due to pre-existing TS errors. The Vite dev server works fine since it uses lazy/on-demand module resolution.

### Ports
- **5173** — Frontend (Vite dev server)
- **5174** — Reserved for backend (not currently used; no local backend service)

### Package Manager
The repo has both `package-lock.json` and `pnpm-lock.yaml`. Use `npm install` for consistency (README examples use npm).
