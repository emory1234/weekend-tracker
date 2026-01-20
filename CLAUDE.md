# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run tests once (vitest)
npm run test:watch   # Run tests in watch mode
```

## Architecture

This is a React + TypeScript weekend project tracker built with Vite, using Supabase as the backend.

### Data Flow
- **Supabase** stores two tables: `weekends` (the 10 weekends to track) and `subtasks` (child tasks per weekend)
- **TanStack Query** manages all server state via hooks in `src/hooks/useWeekendsData.ts`
- The main hooks are `useWeekends()`, `useSubtasks(weekendId)`, and corresponding mutation hooks for CRUD operations

### Key Directories
- `src/components/` - Custom components (WeekendCard, SubtaskList, WeekendTimer, etc.)
- `src/components/ui/` - shadcn/ui primitives (do not edit directly unless necessary)
- `src/hooks/` - Custom hooks including all Supabase data operations
- `src/integrations/supabase/` - Auto-generated Supabase client and types (do not edit `client.ts` directly)
- `src/pages/` - Route components (Index, NotFound)

### Path Alias
Use `@/` to import from `src/` (e.g., `import { cn } from "@/lib/utils"`)

### Environment Variables
Required in `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### Styling
- Tailwind CSS with shadcn/ui design system
- Use the `cn()` utility from `@/lib/utils` for conditional class merging
