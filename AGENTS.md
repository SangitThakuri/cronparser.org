# AGENTS.md

Client-side cron toolkit (React 19 + Vite 8 + Tailwind v4). Static site — no backend, no test framework.

## Commands

```bash
npm run dev          # Vite dev server
npm run lint         # oxlint (only linter; passes clean today)
npm run build        # full production build — see below, order matters
npm run preview      # serves dist/ at base path "/"
npx tsc -b           # typecheck; there is NO `npm run typecheck` script
```

There are **no tests and no test runner**. `npm run build` runs `tsc -b` itself, so it is
the only complete verification step — use it, not a guessed `typecheck`/`test` script.

### `npm run build` is a 4-stage chain — do not reorder or run pieces blind

```
generate-sitemap.mjs → tsc -b → vite build (client)
                     → vite build --ssr src/entry-server.tsx --outDir dist-ssr
                     → prerender.mjs
```

`prerender.mjs` exits non-zero if `dist/index.html` or `dist-ssr/entry-server.js` is missing.
`npm run prerender` re-runs only the SSR build + prerender stages (fast loop for head changes).

### Base path is env-driven — the biggest footgun

`vite.config.ts` sets `base: process.env.GITHUB_ACTIONS ? "/cronparser.org/" : "/"`.

A plain `npm run build` locally emits root-relative assets (`/assets/...`); CI emits
`/cronparser.org/assets/...`. So dist built locally does **not** reflect production paths.
Never hardcode asset URLs — use `import.meta.env.BASE_URL` (see `App.tsx` `BrowserRouter basename`).

## SEO / prerender pipeline

Three independent build scripts read route data via **regex over source text**, not imports:

- `scripts/generate-sitemap.mjs` — scrapes `id:`/`slug:` from the data files.
- `scripts/prerender.mjs` — bakes per-route `<title>/<meta>/<link rel=canonical>/JSON-LD`
  into a static HTML file per route, plus optionally real `#root` body markup.

### JSON-LD must have exactly one source per route

For routes in `BODY_PRERENDER_PATHS` (`scripts/prerender.mjs`), the page components render
their own JSON-LD during SSR. `buildHead()` must therefore be called with
`includeJsonLd: false` for those routes, or you ship duplicate structured data.
`<title>/<meta>/<link>` stay hand-built even for body-prerendered routes.

### Do not "clean up" `renderBody()`'s tag stripping

`renderBody()` strips `<title>`, `<meta …/>`, and `<link …/>` from the SSR string but
**deliberately keeps `<script>`**. React 19 hoists the first three to `<head>` client-side
(no `#root` children), but does not hoist `<script>`, which the client *does* render in-tree.
An earlier version sliced away everything before the first `<div>` and broke hydration.
If you touch this, re-verify hydration on a body-prerendered route in the browser.

### `index.html` anchors are a contract

`prerender.mjs` regex-matches these exact strings; breaking them silently drops all per-page head tags:
- `<meta name="viewport" …>` on its own line (head content is inserted after it)
- `<div id="root"></div>` (body markup is injected here)
- a `<title>` element (stripped from the shell before head injection)

### `data-prerendered` cleanup

Prerendered head tags carry `data-prerendered="true"`; a one-shot `useLayoutEffect` in
`AppShell` removes them after hydration so Helmet's client tags aren't duplicated. It's a
no-op during SSR by design.

## Adding content — what's automatic vs. manual

| Add | Automatic | Manual (easy to miss) |
|---|---|---|
| Tool | route in `App.tsx`, sidebar/search (driven by `src/registry/tools.ts`), sitemap | `<SeoMeta title=… description=… path=… />` in the component — **prerendered `<head>` is skipped entirely if absent** |
| Interval page | route + sitemap + `<head>` + SSR body | nothing — `BODY_PRERENDER_PATHS` is derived from the data |
| Platform guide / blog post | route + sitemap + `<head>` + SSR body | nothing — same, derived from the data |

`BODY_PRERENDER_PATHS` in `scripts/prerender.mjs` is now built from `INTERVAL_PAGES`,
`PLATFORM_GUIDES`, and `BLOG_POSTS`, so new content in those files is body-prerendered
automatically. Only the 20 tool pages are excluded, and unavoidably so: they're
`lazy()` components and `renderToString` emits the `<Suspense>` fallback instead of the
real UI. Prerendering them needs `renderToPipeableStream` in `entry-server.tsx`.

- **`src/registry/tools.ts` is parsed positionally.** `prerender.mjs` zips `id: "…"` matches
  with `import("../tools/…")` matches **by array index**. Reordering, adding a non-`lazy()`
  import, or inserting an entry without its paired `id` silently misroutes titles.
- Tool `id` is the URL and usually differs from the directory name (`id: "validator"` →
  `src/tools/cron-validator/`). Any directory name works; the registry's import path is authoritative.
- `src/tools/cron-parser/` is intentionally **not** registered — the parser lives on the home
  page and `/cron-parser` 301s to `/`. Don't add it to the registry.
- **The three `src/data/*.ts` files cannot be kept off the critical path.** They're ~62KB
  gzip (~43% of the entry chunk) and `App.tsx` imports all three statically to build route
  definitions, so they're reachable from the entry chunk regardless of who else imports them.
  A refactor moving them out of `RelatedToolsFooter` only relocated them within the initial
  payload and left the total unchanged. Real savings require making the routes themselves lazy,
  which conflicts with body prerendering under `renderToString`.
- `<RelatedToolsFooter toolIds>` resolves **tool registry ids only** (plus the `home` /
  `platforms` / `blog` aliases). Passing a platform-guide or interval slug there silently
  renders nothing — see `FormatConverter`, which builds `entries` against `PLATFORM_GUIDES`
  directly. Keep data imports local to the page that needs them; never add one to
  `src/lib/relatedTools.ts`, since every footer call site shares that module.
- `prerender.mjs` extracts tool titles with a regex, so `<SeoMeta>` must be self-closing and
  expose both `title` and `description`. The `{CONST}` form works only if the constant is
  declared as `const NAME = "…"` in the same file (see `tools/learn/LearningCenter.tsx`).
- `public/sitemap.xml` is **tracked but generated**. Every build rewrites all `<lastmod>`
  values to today, producing a ~90-line no-op diff. Expect it and don't try to "fix" it.
- Every canonical URL uses a trailing slash (`toCanonicalPath` in `src/lib/seoSchema.ts`) —
  production serves `dir/index.html` with a 200 and 308s the slashless form.

## Conventions

- Human-readable cron descriptions always use
  `cronstrue.toString(expr, { use24HourTimeFormat: false, verbose: true })`. Copy this exact
  option set; plain `cronstrue.toString(expr)` is not the house style.
- `localStorage` keys are namespaced `cronparser-*` (e.g. `cronparser-theme`, which
  `index.html` reads synchronously pre-paint to avoid a theme flash).
- Dark mode is class-based on `<html>` (`dark:` variants). Nearly every component has a
  `dark:` counterpart — don't add light-only styles.
- New tool pages conventionally render `<SeoMeta>`, `<Breadcrumbs>`,
  `<ToolSeoSection steps faqs>`, and `<RelatedToolsFooter>`.
- `tsconfig.app.json` enforces `verbatimModuleSyntax` (use `import type`),
  `noUnusedLocals`/`noUnusedParameters`, and `erasableSyntaxOnly` (no `enum`, no parameter
  properties, no namespaces). `strict` is **not** enabled. Only `src` is typechecked —
  `scripts/*.mjs` are untyped and outside `tsc`.

## Deploy

`.github/workflows/deploy.yml` publishes `dist/` to GitHub Pages on push to `main`
(Node 22, `npm ci` → `npm run build` → `cp dist/index.html dist/404.html`).

Note: `public/_headers` and `public/_redirects` are Cloudflare Pages conventions and are
ignored by GitHub Pages, while several code comments assume Cloudflare Pages serving
(trailing-slash 200s, SPA-fallback 404). Prod hosting is therefore only partly represented
in-repo — don't assume the GitHub Pages workflow is the whole story.