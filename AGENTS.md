# Repository Guidelines

## Project Structure & Module Organization
- `src/main.jsx` bootstraps the app, wiring routing, providers, and global UI wrappers.
- `src/components` holds UI building blocks (layout, transitions, widgets); `src/pages` defines routed screens; `src/contexts`, `src/hooks`, `src/services`, and `src/utils` host shared state, logic, APIs, and helpers; `src/styles` and `src/assets` carry global styles and media.
- `public/` exposes static assets, while `dist/` is Vite's compiled output—regenerate rather than edit it.
- Use the `@` alias from `vite.config.js` for any `src` import (e.g., `import Button from '@/components/ui/Button.jsx'`).

## Build, Test, and Development Commands
- `npm install` synchronizes dependencies after pulling.
- `npm run dev` starts the Vite dev server on port 3000 with hot reload; add `--host` for device testing.
- `npm run build` emits the production bundle into `dist/`; it must pass before merging.
- `npm run preview` serves the built bundle for smoke-testing production behavior.
- `npm run lint` runs ESLint with the shared rules—resolve or explain every violation prior to review.

## Coding Style & Naming Conventions
- Follow `eslint.config.js` (ES2020 modules, React Hooks constraints, custom `no-unused-vars`).
- Default to functional components, context providers for cross-cutting state, and dedicated hooks for reusable logic.
- Indent with two spaces, keep imports grouped (React/libs → contexts/hooks → components → styles), and prefer single quotes.
- Name components/contexts in `PascalCase`, hooks/utilities in `camelCase`, and constants in `SCREAMING_SNAKE_CASE`.
- Reference shared assets or styles via the `@/` alias to avoid brittle relative paths.

## Testing Guidelines
- Automated tests are not yet wired; rely on `npm run lint`, manual regression of the home → details → messaging flow, and mock data from `src/services`.
- New automated coverage should live beside the unit under test as `ComponentName.test.jsx` (Vitest + React Testing Library recommended) and run locally before requesting review.
- Attach screenshots or console traces for UI or API fixes so reviewers can verify behavior without rebuilding.

## Commit & Pull Request Guidelines
- History shows Conventional Commits (`feat:`, `feat(auth):`, `chore:`); continue using imperative subjects plus optional scopes for clarity.
- Each commit should focus on a single concern and mention linked issue IDs in the body when applicable.
- Pull requests need a clear summary, testing checklist (`npm run build`, `npm run preview`, manual steps), and any screenshots for UI changes.
- Request a second reviewer for updates touching shared contexts/services and wait for green checks before merging.
