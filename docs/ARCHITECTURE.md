# Code structure & conventions

Short guide for keeping the codebase easy to change. Stack: Next.js (App Router), Prisma, TanStack Query, Tailwind + shadcn/ui.

## Layout

```
src/
  app/                  Routes only: pages, layouts, route handlers (api/), server actions (actions/)
    <route>/_components/  UI that belongs to a single route (private folder, not routable)
    <route>/_lib/         Hooks, types and constants used only by that route
  components/
    ui/                 shadcn primitives (generic, no business logic)
    portal/             Shared shells for the client / firm / student portals
    sanad/              Lawyer / Advisory workspace views
      cases/            Modularized subcomponents (AddCaseDialog, CaseCard, KanbanColumn)
      daily-brief/      Subcomponents (DailyBriefHero, LiveFeedSection, NewsletterIssues)
      deep-work/        State & UI (use-deep-work, state, ActiveTimerCard, SummaryCards)
      documents/        Modularized subcomponents (AddDocDialog, AiDraftDialog, DocumentCard, Versions)
      research/         Modularized subcomponents (use-research-hub, ResearchHero, Pillars, Tabs)
  lib/                  Framework-agnostic logic: auth, billing, ai, storage-migration ...
  hooks/                Generic React hooks
prisma/                 Schema and migrations
tests/                  Vitest unit tests      e2e/  Playwright
scripts/                Seeds, backups, one-off refactor helpers (scripts/refactor)
docs/                   Specs (docs/specs), pitch, screenshots, architecture
```

## Rules of thumb

1. **A file does one job.** Aim for under ~400 lines. When a view grows past that, split it:
   - state/effects/handlers -> a `use-<name>.ts` hook,
   - each tab, dialog or card -> its own component file,
   - static data, labels and types -> `constants.ts` / `types.ts`.
2. **Keep public paths stable.** A big view keeps its original file (e.g. `CasesView.tsx`) as the entry point and imports pieces from its feature folder, so call sites and dynamic imports do not change.
3. **Route-local first.** Put code next to the only route that uses it (`_components`, `_lib`). Promote it to `components/` or `lib/` only when a second consumer appears.
4. **No business logic in `components/ui`** and no React in `lib/`.
5. **Every change must pass:** `npm run typecheck`, `npm run lint`, `npm test`.

## Worked example: client portal (`src/app/portal/[token]`)

| File | Role |
| --- | --- |
| `client-portal-unified-view.tsx` | Thin entry: picks the screen and composes sections |
| `_lib/use-portal-view.ts` | All state, effects and handlers |
| `_lib/types.ts` | Shared prop / data types |
| `_components/*Tab.tsx` | One file per tab |
| `_components/*Modal.tsx` | One file per dialog |
| `_components/*Screen.tsx` | Session check, expired link, OTP activation |

To change a screen, edit its component. To change behavior, edit the hook.
