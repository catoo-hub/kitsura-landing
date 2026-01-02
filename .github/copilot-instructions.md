# GitHub Copilot Instructions for Kitsura Landing

## 🏗 Project Architecture

- **Framework**: Astro 5.x with React 19.x and Tailwind CSS 4.x.
- **Rendering**: Server-Side Rendering (SSR) using `@astrojs/node` adapter in standalone mode.
- **UI Library**: Shadcn UI (Radix Primitives + Tailwind) located in `src/components/ui`.
- **Styling**: Tailwind CSS with `tailwind-merge` and `clsx` (via `cn` utility).
- **State Management**: React hooks and local state; no global store library observed.
- **Routing**: File-based routing in `src/pages`. API routes in `src/pages/api`.

## 📂 Directory Structure

- `src/components/ui`: Reusable Shadcn UI components.
- `src/components/miniapp`: Components specific to the Mini App functionality.
- `src/lib`: Shared logic, types, API helpers, and mock data.
- `src/pages/api`: Backend API endpoints (Astro `APIRoute`).
- `public`: Static assets and configuration files (`app-config.json`).

## 💻 Development Workflows

- **Dev Server**: `npm run dev` (starts at localhost:4321).
- **Build**: `npm run build` (outputs to server-ready Node app).
- **Environment**: Uses `import.meta.env` for variables (e.g., `WATA_API_TOKEN`).
- **Mocking**: API routes often include mock fallbacks if environment variables are missing.

## 🧩 Coding Conventions

- **Components**: Prefer functional React components with TypeScript interfaces.
- **Styling**: Use the `cn()` utility for conditional class names.
  ```tsx
  import { cn } from "@/lib/utils";
  <div className={cn("base-class", condition && "active-class")} />;
  ```
- **Imports**: Use `@/` alias for `src/` imports.
- **Types**: Define shared interfaces in `src/lib/types.ts`.
- **API Interaction**: Use `src/lib/miniapp-api.ts` for Mini App API calls.

## ⚠️ Critical Implementation Details

- **Mini App**: `src/components/miniapp/MiniApp.tsx` is a large, complex component handling user flows. Be cautious when refactoring.
- **API Routes**: Ensure error handling and mock responses are maintained in `src/pages/api`.
- **Astro vs React**: `index.astro` is the main entry point, hydrating React components like `MiniApp` and `PricingTabs`.

## 🔍 Common Patterns

- **Data Fetching**: API routes use `fetch` to external services (e.g., WATA API) and handle secrets server-side.
- **Animations**: Uses `motion` (Framer Motion) for UI transitions.
