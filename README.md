# FairShare

Shared expense splitter for groups - trips, flats, recurring dinners.

Log shared expenses, see net balances, and settle up with the minimum number of transfers. Supports multiple currencies with exchange rates fixed at spend time.

## Stack

- **Vue 3** + TypeScript
- **Tailwind CSS**
- **TanStack Query** - data fetching, caching, optimistic updates
- **Pinia** - UI state
- **Supabase** - Postgres, Auth, Realtime
- **Vite** + **Vitest**

## Getting started

```bash
npm install
cp .env.example .env.local   # add your Supabase URL and anon key
npm run dev
```

## Commands

| Command                 | Description                         |
| ----------------------- | ----------------------------------- |
| `npm run dev`           | Start dev server                    |
| `npm run build`         | Type-check and build for production |
| `npm run test`          | Run unit tests in watch mode        |
| `npm run test:coverage` | Run tests with coverage report      |
| `npm run typecheck`     | Type-check without building         |

## Architecture

```
src/
  domain/     # Pure TS: money math, splitting, balances, transfer minimization
  data/       # TanStack Query hooks - only layer that talks to Supabase
  store/      # Pinia - UI state only (active group, display currency, filters)
  components/ # Vue 3 components - thin, no business logic
  views/      # Page-level components wired to router
```

The domain core has zero external dependencies and is fully unit-tested. Dependencies point inward; the domain never imports from other layers.

## Domain rules

- Money is stored as integer minor units (cents) - no floating point.
- Split remainders are distributed deterministically so shares always sum to the original amount.
- Exchange rates are fixed at spend time and never recomputed retroactively.
- A group's base currency is immutable after creation.
