# AGENTS.md

This file gives coding agents working rules for this repository. It is based on the current codebase, not just the existing docs.

## Project Snapshot

- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, TanStack Query v5, Axios, Ant Design, Radix UI, `lucide-react`.
- Package manager: `npm` (`package-lock.json` is checked in).
- App type: authenticated SaaS-style data analytics/admin dashboard.
- API style: browser-side API calls through a shared Axios instance in [`shared/api/axios.ts`](./shared/api/axios.ts).
- Import alias: `@/*` maps to repo root via [`tsconfig.json`](./tsconfig.json).

## Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Start built app: `npm run start`
- Lint: `npm run lint`

No dedicated test suite is present right now. If you change behavior, at minimum run `npm run lint` and, when relevant, `npm run build`.

## High-Level Architecture

The repo is organized by feature area with a shared layer:

- `app/`: Next.js App Router entries, layouts, and route composition.
- `features/<feature>/components`: feature-specific UI.
- `features/<feature>/hooks`: TanStack Query hooks and feature interaction hooks.
- `features/<feature>/services`: API access for that feature.
- `features/<feature>/types`: feature-specific types.
- `shared/api`: shared Axios client and small API helpers.
- `shared/components`: reusable UI, layout, auth, catalog, and form building blocks.
- `shared/contexts`: auth, sidebar, and navigation providers.
- `shared/hooks`: thin shared hooks such as `use-auth`.
- `shared/utils`: helpers like error parsing, validation, icon mapping, and class merging.
- `shared/types`: cross-feature types.
- `public/`: static assets.

## Routing Reality

Prefer the actual implementation over stale documentation:

- Routing is implemented with the Next.js App Router under `app/`, not React Router.
- The authenticated shell lives in [`app/(dashboard)/layout.tsx`](./app/(dashboard)/layout.tsx).
- Auth-related pages such as [`app/login/page.tsx`](./app/login/page.tsx) and [`app/signup/page.tsx`](./app/signup/page.tsx) sit outside that shell.
- Dynamic and catch-all routes are used heavily for settings, explore, and SQL editor flows.

When adding pages:

- Keep parent layouts stable and push nested content into route children.
- Follow existing route group patterns like `app/(dashboard)/...`.
- Prefer deep-linkable URLs that reflect navigation hierarchy.

## Data Fetching Rules

The intended pattern is:

1. Put backend calls in `features/<feature>/services/*.service.ts`.
2. Wrap reads and mutations with TanStack Query hooks in `features/<feature>/hooks`.
3. Consume hooks from pages or smart feature containers.

Shared details:

- Use the singleton Axios client from [`shared/api/axios.ts`](./shared/api/axios.ts).
- Do not create another Axios instance unless there is a very strong, repo-wide reason.
- Auth tokens live in `localStorage`; 401 refresh/logout handling is already centralized.
- Global React Query setup lives in [`app/providers.tsx`](./app/providers.tsx).
- Errors should be normalized through [`shared/utils/error-handler.ts`](./shared/utils/error-handler.ts).

Important nuance:

- Most of the repo follows the hook/service split, but there are exceptions where pages call services directly, especially in older screens like [`app/(dashboard)/explore/data-assets/page.tsx`](./app/(dashboard)/explore/data-assets/page.tsx).
- For new work, prefer the hook-first pattern. When touching an older screen, improve it incrementally instead of doing an unrelated full rewrite.

## Auth, Navigation, and App Shell

- `AuthProvider` in [`shared/contexts/auth-context.tsx`](./shared/contexts/auth-context.tsx) owns session state and redirects.
- `ProtectedRoute` in [`shared/components/auth/protected-route.tsx`](./shared/components/auth/protected-route.tsx) gates the dashboard shell.
- Sidebar collapse state is in [`shared/contexts/sidebar-context.tsx`](./shared/contexts/sidebar-context.tsx).
- Navigation data is loaded through the navigation context and rendered by [`shared/components/layout/sidebar.tsx`](./shared/components/layout/sidebar.tsx).

If you change auth flows:

- Preserve the `auth-token-updated` and `auth-logout` window event behavior.
- Keep logout cleanup aligned between Axios interceptors and the auth context.

## UI and Styling Conventions

This repo mixes shared Tailwind-based primitives with Ant Design components. Match the area you are editing.

- Shared primitives live in `shared/components/ui`.
- Layout primitives live in `shared/components/layout`.
- Many complex tables, dropdowns, and modals use Ant Design.
- Tailwind utility classes are used heavily throughout feature components.

Existing design docs:

- [`Guideline.md`](./Guideline.md): spacing, typography, cards, tables, buttons.
- [`ANTIGRAVITY_RULES.md`](./ANTIGRAVITY_RULES.md): architecture and general engineering intent.
- [`Breadcrumb_Guideline.md`](./Breadcrumb_Guideline.md): breadcrumb behavior.

Practical guidance:

- Reuse existing shared UI before creating a new primitive.
- Keep spacing on the existing 4px scale where possible.
- Favor `rounded-lg`, `border-slate-200`, white/slate surfaces, and restrained shadows.
- Preserve the existing visual language in the touched section; do not restyle unrelated screens.
- Avoid inline styles unless there is a clear need. Small local `style jsx global` blocks already exist in a few pages, so follow local precedent when necessary rather than forcing a rewrite.

## File and Component Patterns

- Page files in `app/` are usually smart entry points.
- Feature components are mostly presentational or page-section level.
- Prefer small, composable components over large monoliths.
- Types are split between `shared/types` and `features/*/types`; keep shared contracts out of feature-local type files.
- Use `cn()` from [`shared/utils/cn.ts`](./shared/utils/cn.ts) for conditional class composition.

## Known Inconsistencies To Respect

This codebase has a few internal mismatches. Agents should be careful not to "clean them up" unless the task actually calls for it.

- Docs mention React Router, but the live app uses Next App Router.
- The repo mixes Ant Design and custom/Radix-based UI.
- Some pages fetch through hooks; some older pages fetch directly in components.
- Naming is mostly feature-based, but service files and component styles are not perfectly uniform.

Default approach:

- Follow the dominant pattern in the local area you are editing.
- Improve consistency opportunistically, but avoid broad refactors unless requested.

## Safe Change Strategy

Before editing:

- Read the page/layout/hook/service chain for the feature you are touching.
- Check whether the area already relies on Ant Design, shared UI primitives, or both.
- Inspect nearby hooks/services/types before introducing new ones.

When editing:

- Keep API logic out of reusable UI components.
- Prefer adding or updating a feature hook over putting async logic directly into a component.
- Preserve route structure and breadcrumb expectations.
- Avoid breaking auth redirects, query caching, and sidebar/navigation behavior.

After editing:

- Run `npm run lint`.
- If routing, layouts, or type-heavy flows changed, also run `npm run build`.

## Suggested Workflow For New Features

1. Add or extend types in `features/<feature>/types` or `shared/types`.
2. Add backend calls in `features/<feature>/services`.
3. Add hooks in `features/<feature>/hooks`.
4. Build or update feature components.
5. Wire the route/page in `app/`.
6. Reuse shared layout/UI primitives where it helps consistency.

## Repository-Specific Do Nots

- Do not introduce a parallel data-fetching stack.
- Do not bypass [`shared/api/axios.ts`](./shared/api/axios.ts) for normal authenticated API work.
- Do not replace Next App Router patterns with client-side manual routing.
- Do not do large-scale style rewrites just because one screen looks inconsistent.
- Do not assume docs are fully current without checking the actual implementation.

## If You Need Starting Points

- App shell: [`app/(dashboard)/layout.tsx`](./app/(dashboard)/layout.tsx)
- Providers: [`app/providers.tsx`](./app/providers.tsx)
- Auth state: [`shared/contexts/auth-context.tsx`](./shared/contexts/auth-context.tsx)
- Axios client: [`shared/api/axios.ts`](./shared/api/axios.ts)
- Example query hook: [`features/services/hooks/useServices.ts`](./features/services/hooks/useServices.ts)
- Large service layer example: [`features/services/services/service.service.ts`](./features/services/services/service.service.ts)
- Shared button primitive: [`shared/components/ui/button.tsx`](./shared/components/ui/button.tsx)
