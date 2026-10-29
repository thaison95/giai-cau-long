# giai-cau-long

A team badminton tournament manager in the style of the Thomas/Uber Cup. Spectators follow live scores in real time, organizers manage the tournament, and referees score matches through a secret link without needing an account.

> **Status:** early development. The design is finished and the implementation is tracked in [docs/03-tickets.md](docs/03-tickets.md).

## Features

- **Public viewing:** anyone can browse published tournaments, schedules, group standings, and live scores. No login required.
- **Organizers:** sign in with a magic link. Several organizers can manage the same tournament (teams, players, groups, ties, lineups, referees).
- **Referees:** no account. An organizer creates a referee and shares a secret link (`/r/<token>`). A referee can only start, score, undo points in, and end the matches assigned to them. Referees are deleted when the tournament is finished, which invalidates their links.
- **Team format:** a *tie* (team A vs team B) is made of several *rubbers* (singles or doubles, default 5). The first team to win 3 rubbers wins the tie. Group stage plus knockout stage.

## Architecture

- **Pure SPA:** TanStack Start in `spa` mode (no SSR), deployed to **Cloudflare Pages**. There is no server-side code.
- **Backend:** [Supabase](https://supabase.com) (Postgres, Auth, Realtime). The SPA talks to it directly with `@supabase/supabase-js`. Security relies on Row Level Security and RPC functions, not on hiding UI.
- Only the Supabase `anon` key is used in the frontend. **Never** commit or expose the `service_role` key.

## Tech stack

- React 19, [TanStack Start](https://tanstack.com/start) + Router (file routes in `src/routes`), TanStack Query
- Tailwind CSS v4, Vite 8
- [shadcn/ui](https://ui.shadcn.com) preset `b3DpidP3hY` (style `base-lyra`, built on Base UI, lucide icons, Inter + JetBrains Mono)
- Bun (package manager), Biome (lint and format)
- Supabase

## Documentation

| Document | Contents |
|---|---|
| [docs/01-database-design.md](docs/01-database-design.md) | Database schema, RLS, RPC functions, Realtime, required tests |
| [docs/02-design-system.md](docs/02-design-system.md) | shadcn preset, tokens, components, routes, screen specs |
| [docs/03-tickets.md](docs/03-tickets.md) | Milestones and tickets |
| [AGENTS.md](AGENTS.md) | Context and rules for AI coding agents |

## Getting started

Prerequisites: [Bun](https://bun.sh) and a Supabase project.

```bash
bun install
cp .env.example .env.local   # then fill in the values (see below)
bun run dev
```

The dev server runs at http://localhost:3000.

> Use `bun run dev`, **not** `bun --bun run dev`. Forcing Vite to run on the Bun runtime breaks some plugins; running it with Node is stable.

### Environment variables

Client-side variables must be prefixed with `VITE_`. Put them in `.env.local` (git-ignored) and in the Cloudflare Pages build settings.

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase `anon` (public) key |

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start the dev server on port 3000 |
| `bun run build` | Build the SPA into `dist/client` (contains `index.html`) |
| `bun run preview` | Preview the production build |
| `bun run check` | Biome lint and format check (`bunx biome check --write` to fix) |
| `bun run lint` / `bun run format` | Biome lint / format only |
| `bun run generate-routes` | Regenerate `src/routeTree.gen.ts` (do not edit that file by hand) |
| `bun run deploy` | Build and deploy to Cloudflare Pages |
| `bun run test:db` | Run pgTAP tests and a 12-call concurrent scoring check (requires `bunx supabase start`) |

## Supabase database

Link the local CLI to the project once with `bunx supabase login` and `bunx supabase link --project-ref <project-ref>`. Push migrations with `bunx supabase db push --linked`. Start the local stack and apply migrations with `bunx supabase start`; run database tests with `bun run test:db`. Regenerate the committed database types with `bunx supabase gen types --linked --schema public > src/lib/database.types.ts`.

Add a shadcn component with `bunx shadcn@latest add <name>`. This preset uses Base UI, which has no `asChild`; use the `render` prop instead.

## Deployment (Cloudflare Pages)

The Pages project is named `giaicaulong` (see `wrangler.jsonc`, `pages_build_output_dir: ./dist/client`).

**Using Wrangler:**

```bash
wrangler login
wrangler pages project create giaicaulong   # first time only
bun run deploy
```

**Using Pages Git integration:** build command `bun run build`, output directory `dist/client`.

`vite.config.ts` enables `tanstackStart({ spa: { enabled: true, prerender: { outputPath: '/index' } } })`, so the SPA shell is emitted as `index.html`, which Pages uses as the fallback for every route. `dist/server` is only used while prerendering the shell and is not deployed.

## Project structure

```
docs/                design, database and ticket documents
src/routes/          file-based routes (TanStack Router)
src/integrations/    TanStack Query setup
src/components/ui/   shadcn components (project source, safe to edit)
supabase/            migrations and SQL tests
```

`src/routes/demo`, `about.tsx`, and the Header/Footer content are leftovers from the starter and will be replaced (see ticket M0-4).

## Contributing

- Read the design documents before changing code. If something is contradictory or missing, ask instead of adding tables, columns, or features on your own.
- Write commit messages in English.
- Run `bun run check` and `bun run build` before committing.
