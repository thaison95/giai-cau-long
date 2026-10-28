# giai-cau-long — Agent Context

## Scaffolding commands (exact)
```
npx @tanstack/cli@latest create giai-cau-long --agent --package-manager bun --tailwind --deployment cloudflare --toolchain biome --add-ons tanstack-query
```
Actually executed with two extra flags needed to avoid an interactive prompt: `--framework React --non-interactive`.
Notes: the CLI says `--tailwind` is deprecated (Tailwind is always on). `--blank` was NOT used because it removes Tailwind/devtools; the default starter was kept.

Follow-up TanStack Intent commands:
```
npx @tanstack/intent@latest install   # interactive only; needs a real terminal to confirm skill permissions
npx @tanstack/intent@latest list      # run from project root; found 35 skills in 11 packages
bunx --no-install --package @tanstack/intent intent load <package>#<skill>
```
`install` could not be completed non-interactively by the agent (it reports `intent.skills is not configured`). **Next step: run `npx @tanstack/intent@latest install` yourself in a terminal.** Before architectural changes, load the relevant skill, e.g. `@tanstack/start-client-core#start-core/deployment`, `.../server-functions`, `@tanstack/react-router` skills.

## Stack
- React 19, TanStack Start + Router (file routes in `src/routes`), TanStack Query (`src/integrations/tanstack-query`, SSR-query integration)
- Tailwind CSS v4 (`@tailwindcss/vite`), Vite 8
- Bun for package management (`bun install`, `bun run ...`)
- Biome toolchain (`bun run check | lint | format`)
- Cloudflare Workers deployment via `@cloudflare/vite-plugin` + `wrangler.jsonc` (worker name `giai-cau-long`, `nodejs_compat`, main `@tanstack/react-start/server-entry`)

## Commands
- `bun --bun run dev` — dev server on :3000
- `bun run build` — verified passing
- `bun run deploy` — build + `wrangler deploy`
- `bun run check` — currently reports formatting/lint errors on generated files (quote/semicolon style vs biome defaults); fix with `bunx biome check --write` when desired.

## Environment variables
None required by the scaffold. Deployment needs Cloudflare auth: `wrangler login` locally, or `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` in CI. Runtime secrets: `wrangler secret put NAME`; local dev vars in `.dev.vars`. Client-exposed vars need `VITE_` prefix.

## Gotchas
- `routeTree.gen.ts` is generated (`bun run generate-routes`); don't edit.
- Run the Intent CLI from the project root (needs owning package.json).
- Sandboxed shells may hit EPERM writing `node_modules/.vite-temp`; run builds in a normal shell.

## Next steps
1. Run `npx @tanstack/intent@latest install` interactively.
2. `bunx biome check --write` to normalize style.
3. Replace demo routes/header content (`src/routes/demo`, `about.tsx`) with real app features.
4. `wrangler login` then `bun run deploy`.
