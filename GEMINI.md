# Tagary - Digital Diary Application

A modern, tag-based hourly diary app built with React 19, Tailwind v4, and FullCalendar.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + Vite 7 + TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (new-york style, zinc base) |
| State | Zustand with persist middleware |
| Calendar | FullCalendar (dayGrid, timeGrid) |
| Date | dayjs |
| Icons | lucide-react |

## Project Structure

```
src/
├── components/
│   ├── hourly-grid/    # Legacy grid (deprecated)
│   ├── layout/         # AppLayout with sidebar
│   ├── log-entry/      # LogEntryModal
│   ├── tags/           # TagPicker, TagChip
│   └── ui/             # shadcn components
├── pages/
│   ├── DayView.tsx     # Daily logging (FullCalendar timeGrid)
│   ├── CalendarView.tsx # Monthly overview (dayGrid)
│   ├── InsightsView.tsx # Analytics dashboard
│   └── SettingsView.tsx # Tag/theme management
├── stores/             # Zustand stores (persisted)
│   ├── app.store.ts    # Theme, navigation, selectedDate
│   ├── log.store.ts    # Log entries CRUD
│   └── tag.store.ts    # Tags/categories with defaults
├── types/              # TypeScript interfaces
│   ├── tag.types.ts    # Tag, TagCategory
│   └── log.types.ts    # LogEntry, TimeRange, Hour
└── services/           # Utilities
    └── storage.service.ts # LocalStorage wrapper
```

## Commands

```bash
# Development
pnpm dev              # Start dev server at localhost:5173

# Build
pnpm build            # TypeScript check + production build
pnpm preview          # Preview production build

# Linting
pnpm lint             # Run ESLint
```

## Key Files

- `src/app.tsx` - Main app with view routing
- `src/index.css` - Tailwind config + FullCalendar theme overrides
- `src/stores/*.ts` - All app state (persisted to localStorage)
- `components.json` - shadcn/ui configuration

## Workflows

### Adding a New shadcn Component

```bash
pnpx shadcn@latest add [component-name]
```

### Adding a New Tag Category

1. Update `DEFAULT_CATEGORIES` in `src/types/tag.types.ts`
2. Add corresponding `DEFAULT_TAGS` entries
3. Users can also create categories via Settings page

### Modifying FullCalendar Styling

All calendar styles are in `src/index.css` under:
- `/* FullCalendar shadcn Theme Overrides */`
- `/* TimeGrid specific styles */`

Uses CSS variables from shadcn (e.g., `var(--primary)`, `var(--border)`)

## Data Persistence

All data stored in localStorage with keys:
- `tagary:app-store` - Theme, sidebar state
- `tagary:tag-store` - Tags and categories
- `tagary:log-store` - All log entries

Data initializes with defaults on first load (5 categories, 20+ tags).

## Architecture Notes

- **No backend** - Local-first with optional Dropbox sync (not implemented)
- **State-driven views** - `useAppStore().currentView` controls navigation
- **Zustand persist** - Auto-saves to localStorage on every change
- **FullCalendar** - Used for both day (timeGrid) and month (dayGrid) views
