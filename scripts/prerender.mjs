#!/usr/bin/env node
// Bakes route-specific <title>/<meta>/<link rel=canonical>/JSON-LD directly into a
// static HTML file per route after `vite build`, so search engines and social-share
// crawlers that don't execute JavaScript see real per-page metadata instead of the
// generic app shell (previously every route served an identical <title>).
//
// Tags carry data-prerendered="true" so a one-time cleanup effect (see App.tsx) can
// strip them once the client bundle mounts and react-helmet-async's own tags take
// over — React 19's native head-hoisting doesn't know about (or dedupe against)
// plain static tags that shipped in the initial HTML, so without this they'd persist
// as duplicates alongside Helmet's client-rendered ones.
//
// Route data is loaded directly from the same .ts source files the app itself
// uses (transpiled at runtime via the TypeScript compiler API — these three files
// have zero JSX and zero cross-file imports, so a single-file transpile is enough,
// and it works on any Node version rather than depending on native TS support),
// so this can never drift out of sync with the real data. Per-tool titles/descriptions
// live inside JSX component files and are extracted by regex instead, mirroring the
// approach already used in generate-sitemap.mjs.
//
// A small set of routes (BODY_PRERENDER_PATHS, below) additionally get real body
// markup injected into #root, rendered via src/entry-server.tsx — a Vite SSR build
// of the app's actual route tree (see the "npm run build" chain, which runs
// `vite build --ssr src/entry-server.tsx --outDir dist-ssr` before this script).
//
// Those real page components render their own <Helmet> calls (SeoMeta, Breadcrumbs,
// per-page FAQ/TechArticle JSON-LD) as part of that SSR render — so for those
// routes, the SSR body is the single source of truth for JSON-LD, not the
// hand-built jsonLdBlocks this script also constructs for every route. buildHead()
// takes an includeJsonLd flag (keyed off the same BODY_PRERENDER_PATHS set used to
// decide body injection) so it emits its own <script> tags only for routes where
// there's no SSR body to provide them — avoiding two independently-built copies of
// the same structured data in one document, rather than deduplicating the strings
// after the fact. <title>/<meta>/<link> stay hand-built even for body-prerendered
// routes, since renderBody() strips those from the SSR string (React 19 hoists them
// client-side, so the client's #root never contains them either).

import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { fileURLToPath, pathToFileURL } from "node:url"
import { dirname, join } from "node:path"
import ts from "typescript"

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const SITE_URL = "https://cronparser.org"
const distDir = join(root, "dist")

function importTs(relPath) {
  const source = readFileSync(join(root, relPath), "utf8")
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  })
  const tmpDir = mkdtempSync(join(tmpdir(), "cronparser-prerender-"))
  const tmpFile = join(tmpDir, "mod.mjs")
  writeFileSync(tmpFile, outputText)
  return import(pathToFileURL(tmpFile).href)
}

const { INTERVAL_PAGES } = await importTs("src/data/intervalPages.ts")
const { PLATFORM_GUIDES } = await importTs("src/data/platformGuides.ts")
const { BLOG_POSTS } = await importTs("src/data/blogPosts.ts")
const { WEB_APPLICATION_JSON_LD, buildTechArticleJsonLd, buildBlogPostingJsonLd, toCanonicalPath } =
  await importTs("src/lib/seoSchema.ts")

function extractSeoMeta(fileContent) {
  const blockMatch = fileContent.match(/<SeoMeta([\s\S]*?)\/>/)
  if (!blockMatch) return null
  const block = blockMatch[1]
  const titleMatch = block.match(/title=(?:"([^"]*)"|\{(\w+)\})/)
  const descMatch = block.match(/description=(?:"([^"]*)"|\{(\w+)\})/)
  if (!titleMatch || !descMatch) return null

  const resolve = (match) => {
    if (match[1] !== undefined) return match[1]
    const constMatch = fileContent.match(new RegExp(`const\\s+${match[2]}\\s*=\\s*"([^"]*)"`))
    return constMatch ? constMatch[1] : null
  }

  const title = resolve(titleMatch)
  const description = resolve(descMatch)
  return title && description ? { title, description } : null
}

function extractPageMeta(relFile) {
  return extractSeoMeta(readFileSync(join(root, relFile), "utf8"))
}

// ---- per-tool title/description, resolved via the registry's own import paths ----
const toolsSource = readFileSync(join(root, "src/registry/tools.ts"), "utf8")
const toolIds = [...toolsSource.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1])
const toolImportPaths = [...toolsSource.matchAll(/import\("(\.\.\/tools\/[^"]+)"\)/g)].map((m) => m[1])

const toolMeta = []
for (let i = 0; i < toolIds.length; i++) {
  const componentFile = join(root, "src/registry", `${toolImportPaths[i]}.tsx`)
  if (!existsSync(componentFile)) continue
  const meta = extractSeoMeta(readFileSync(componentFile, "utf8"))
  if (meta) toolMeta.push({ ...meta, path: `/${toolIds[i]}` })
}

// ---- structured data builders (mirror the JSX components exactly) ----
function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ label: "Home", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: `${SITE_URL}${toCanonicalPath(item.path ?? "/")}`,
    })),
  }
}

function faqPageJsonLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
}

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

function buildHead({ title, description, path, jsonLdBlocks = [], noindex = false, includeJsonLd = true }) {
  const url = `${SITE_URL}${toCanonicalPath(path)}`
  const t = escapeHtml(title)
  const d = escapeHtml(description)
  // Body-prerendered routes (BODY_PRERENDER_PATHS) already get real JSON-LD
  // <script> tags from the actual page components, via renderBody()'s SSR render
  // — those are the single source of truth for that content (built from the same
  // data these hand-rolled jsonLdBlocks are, just by the real components instead
  // of a parallel reimplementation). Emitting this hand-built copy too would just
  // duplicate it in the raw HTML, so callers pass includeJsonLd: false for those.
  const scriptTags = includeJsonLd
    ? [WEB_APPLICATION_JSON_LD, ...jsonLdBlocks]
        .map((obj) => `    <script type="application/ld+json" data-prerendered="true">${JSON.stringify(obj)}</script>`)
        .join("\n")
    : ""
  const indexingTag = noindex
    ? `    <meta name="robots" content="noindex, nofollow" data-prerendered="true" />`
    : `    <link rel="canonical" href="${url}" data-prerendered="true" />`

  return `    <title data-prerendered="true">${t}</title>
    <meta name="description" content="${d}" data-prerendered="true" />
${indexingTag}
    <meta property="og:type" content="website" data-prerendered="true" />
    <meta property="og:site_name" content="CronParser" data-prerendered="true" />
    <meta property="og:title" content="${t}" data-prerendered="true" />
    <meta property="og:description" content="${d}" data-prerendered="true" />
    <meta property="og:url" content="${url}" data-prerendered="true" />
    <meta name="twitter:card" content="summary" data-prerendered="true" />
    <meta name="twitter:title" content="${t}" data-prerendered="true" />
    <meta name="twitter:description" content="${d}" data-prerendered="true" />
${scriptTags}`
}

const shellPath = join(distDir, "index.html")
if (!existsSync(shellPath)) {
  console.error("dist/index.html not found — run `vite build` before prerender.mjs")
  process.exit(1)
}
const shell = readFileSync(shellPath, "utf8")

// Body-prerendered routes. Phase 3: /platforms, /all-tools, /blog (index pages).
// Phase 2A pilot: 5 interval pages, to validate the same approach on data-driven
// content pages (H1/intro/examples/mistakes/best-practices/FAQs) before extending
// to the remaining interval pages, platform guides, and individual blog posts.
const BODY_PRERENDER_PATHS = new Set([
  "/platforms",
  "/all-tools",
  "/blog",
  "/every-minute",
  "/every-5-minutes",
  "/every-10-minutes",
  "/every-15-minutes",
  "/every-30-minutes",
])

const ssrEntryPath = join(root, "dist-ssr/entry-server.js")
if (!existsSync(ssrEntryPath)) {
  console.error("dist-ssr/entry-server.js not found — run `vite build --ssr src/entry-server.tsx --outDir dist-ssr` before prerender.mjs")
  process.exit(1)
}
const { renderAppShell } = await import(pathToFileURL(ssrEntryPath).href)

function renderBody(path) {
  const full = renderAppShell(path)
  // react-helmet-async renders <title>/<meta>/<link>/<script> tags inline, at
  // whatever point in the tree <Helmet>/<SeoMeta>/<Breadcrumbs> are declared —
  // there can be several, not just one leading block (every page has its own
  // <SeoMeta>, and things like <Breadcrumbs> add their own <script> deeper in).
  //
  // React 19 natively hoists <title>/<meta>/<link> to <head> on the client (they
  // qualify as "Resources"), so they never end up as real #root children there —
  // those must be stripped from every occurrence in this string too, or hydration
  // expects to find nothing where the server put text.
  //
  // <script> tags do NOT qualify for that hoisting (no src / not a Resource) and
  // DO remain as real #root children client-side, in their original tree position
  // — stripping those (as an earlier version of this function did, by slicing
  // everything before the first <div>) removed content the client still renders,
  // which is exactly what caused the hydration failures this comment replaces.
  return full
    .replace(/<title[^>]*>[\s\S]*?<\/title>/g, "")
    .replace(/<meta[^>]*\/>/g, "")
    .replace(/<link[^>]*\/>/g, "")
}

function writeRoute(path, headContent) {
  let html = shell
    .replace(/<title>[\s\S]*?<\/title>\n?/, "")
    .replace(/(<meta name="viewport"[^>]*>\n)/, `$1${headContent}\n`)

  if (BODY_PRERENDER_PATHS.has(path)) {
    const bodyHtml = renderBody(path)
    html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`)
  }

  if (path === "/") {
    writeFileSync(shellPath, html)
    return
  }
  const dir = join(distDir, path.replace(/^\//, ""))
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, "index.html"), html)
}

let count = 0

const homeMeta = extractPageMeta("src/pages/HomePage.tsx")
if (homeMeta) {
  writeRoute("/", buildHead({ ...homeMeta, path: "/", includeJsonLd: !BODY_PRERENDER_PATHS.has("/") }))
  count++
}

const allToolsMeta = extractPageMeta("src/pages/AllToolsPage.tsx")
if (allToolsMeta) {
  writeRoute(
    "/all-tools",
    buildHead({ ...allToolsMeta, path: "/all-tools", includeJsonLd: !BODY_PRERENDER_PATHS.has("/all-tools") }),
  )
  count++
}

const platformsIndexMeta = extractPageMeta("src/pages/PlatformGuidesIndex.tsx")
if (platformsIndexMeta) {
  writeRoute(
    "/platforms",
    buildHead({
      ...platformsIndexMeta,
      path: "/platforms",
      jsonLdBlocks: [breadcrumbJsonLd([{ label: "Platform Guides" }])],
      includeJsonLd: !BODY_PRERENDER_PATHS.has("/platforms"),
    }),
  )
  count++
}

const aboutMeta = extractPageMeta("src/pages/AboutPage.tsx")
if (aboutMeta) {
  writeRoute(
    "/about",
    buildHead({
      ...aboutMeta,
      path: "/about",
      jsonLdBlocks: [breadcrumbJsonLd([{ label: "About" }])],
      includeJsonLd: !BODY_PRERENDER_PATHS.has("/about"),
    }),
  )
  count++
}

const privacyMeta = extractPageMeta("src/pages/PrivacyPolicyPage.tsx")
if (privacyMeta) {
  writeRoute(
    "/privacy",
    buildHead({
      ...privacyMeta,
      path: "/privacy",
      jsonLdBlocks: [breadcrumbJsonLd([{ label: "Privacy Policy" }])],
      includeJsonLd: !BODY_PRERENDER_PATHS.has("/privacy"),
    }),
  )
  count++
}

const blogIndexMeta = extractPageMeta("src/pages/BlogIndexPage.tsx")
if (blogIndexMeta) {
  writeRoute(
    "/blog",
    buildHead({
      ...blogIndexMeta,
      path: "/blog",
      jsonLdBlocks: [breadcrumbJsonLd([{ label: "Blog" }])],
      includeJsonLd: !BODY_PRERENDER_PATHS.has("/blog"),
    }),
  )
  count++
}

for (const page of INTERVAL_PAGES) {
  const path = `/${page.slug}`
  const jsonLdBlocks = [
    breadcrumbJsonLd([{ label: "Cron Tools", path: "/all-tools" }, { label: page.h1 }]),
    faqPageJsonLd(page.faqs),
    buildTechArticleJsonLd({ headline: page.h1, description: page.metaDescription, path }),
  ]
  const includeJsonLd = !BODY_PRERENDER_PATHS.has(path)
  writeRoute(path, buildHead({ title: page.title, description: page.metaDescription, path, jsonLdBlocks, includeJsonLd }))
  count++
}

for (const guide of PLATFORM_GUIDES) {
  const path = `/${guide.slug}`
  const jsonLdBlocks = [
    breadcrumbJsonLd([{ label: "Platform Guides", path: "/platforms" }, { label: guide.h1 }]),
    faqPageJsonLd(guide.faqs),
    buildTechArticleJsonLd({ headline: guide.h1, description: guide.metaDescription, path }),
  ]
  const includeJsonLd = !BODY_PRERENDER_PATHS.has(path)
  writeRoute(path, buildHead({ title: guide.title, description: guide.metaDescription, path, jsonLdBlocks, includeJsonLd }))
  count++
}

for (const tool of toolMeta) {
  writeRoute(tool.path, buildHead({ title: tool.title, description: tool.description, path: tool.path }))
  count++
}

for (const post of BLOG_POSTS) {
  const path = `/blog/${post.slug}`
  const jsonLdBlocks = [
    breadcrumbJsonLd([{ label: "Blog", path: "/blog" }, { label: post.h1 }]),
    faqPageJsonLd(post.faqs),
    buildBlogPostingJsonLd({
      headline: post.h1,
      description: post.metaDescription,
      path,
      datePublished: post.publishDate,
    }),
  ]
  const includeJsonLd = !BODY_PRERENDER_PATHS.has(path)
  writeRoute(path, buildHead({ title: post.title, description: post.metaDescription, path, jsonLdBlocks, includeJsonLd }))
  count++
}

// A top-level 404.html makes Cloudflare Pages serve a real HTTP 404 for any path
// that isn't one of the static files written above, instead of its default
// SPA-fallback behavior (which matches every unknown path to "/" with a 200).
const notFoundHead = buildHead({
  title: "Page Not Found | CronParser",
  description: "The page you're looking for doesn't exist on CronParser.",
  path: "/404",
  noindex: true,
})
const notFoundHtml = shell
  .replace(/<title>[\s\S]*?<\/title>\n?/, "")
  .replace(/(<meta name="viewport"[^>]*>\n)/, `$1${notFoundHead}\n`)
writeFileSync(join(distDir, "404.html"), notFoundHtml)
count++

console.log(`Prerendered ${count} routes with route-specific <head> content (including 404.html).`)
