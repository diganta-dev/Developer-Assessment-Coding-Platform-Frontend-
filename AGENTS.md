<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Architectural Guidelines

## 1. Static Site Export (`output: "export"`)
- This project is configured with `output: "export"` in `next.config.ts`.
- **NEVER use `"use client"` in `page.tsx` files**. Keep all `page.tsx` files as Server Components.
- `page.tsx` files should export `Metadata`, render server layout/navigation, and embed interactive client components wrapped in `<Suspense>`.
- All client-side hooks (`useState`, `useEffect`, `useSearchParams`, `@tanstack/react-query`, DOM event handlers) must be placed inside dedicated client components in `src/components/`, not in `page.tsx`.

## 2. React Query Mutation Guidelines
- Keep mutation hooks in `src/hook/` pure: they should only define `mutationFn`.
- **Do NOT** perform `queryClient.invalidateQueries`, toast messages, or side-effects inside mutation hooks in `src/hook/`.
- Handle all `onSuccess`, `onError`, toast notifications, and cache invalidations (`queryClient.invalidateQueries`) inside the calling components.

