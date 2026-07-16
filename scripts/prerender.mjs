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
const { WEB_APPLICATION_JSON_LD, buildTechArticleJsonLd } = await importTs("src/lib/seoSchema.ts")

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
      item: `${SITE_URL}${item.path ?? "/"}`,
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

function buildHead({ title, description, path, jsonLdBlocks = [], noindex = false }) {
  const url = `${SITE_URL}${path}`
  const t = escapeHtml(title)
  const d = escapeHtml(description)
  const scriptTags = [WEB_APPLICATION_JSON_LD, ...jsonLdBlocks]
    .map((obj) => `    <script type="application/ld+json" data-prerendered="true">${JSON.stringify(obj)}</script>`)
    .join("\n")
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

function writeRoute(path, headContent) {
  const html = shell
    .replace(/<title>[\s\S]*?<\/title>\n?/, "")
    .replace(/(<meta name="viewport"[^>]*>\n)/, `$1${headContent}\n`)

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
  writeRoute("/", buildHead({ ...homeMeta, path: "/" }))
  count++
}

const allToolsMeta = extractPageMeta("src/pages/AllToolsPage.tsx")
if (allToolsMeta) {
  writeRoute("/all-tools", buildHead({ ...allToolsMeta, path: "/all-tools" }))
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
    }),
  )
  count++
}

const aboutMeta = extractPageMeta("src/pages/AboutPage.tsx")
if (aboutMeta) {
  writeRoute("/about", buildHead({ ...aboutMeta, path: "/about", jsonLdBlocks: [breadcrumbJsonLd([{ label: "About" }])] }))
  count++
}

const privacyMeta = extractPageMeta("src/pages/PrivacyPolicyPage.tsx")
if (privacyMeta) {
  writeRoute(
    "/privacy",
    buildHead({ ...privacyMeta, path: "/privacy", jsonLdBlocks: [breadcrumbJsonLd([{ label: "Privacy Policy" }])] }),
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
  writeRoute(path, buildHead({ title: page.title, description: page.metaDescription, path, jsonLdBlocks }))
  count++
}

for (const guide of PLATFORM_GUIDES) {
  const path = `/${guide.slug}`
  const jsonLdBlocks = [
    breadcrumbJsonLd([{ label: "Platform Guides", path: "/platforms" }, { label: guide.h1 }]),
    faqPageJsonLd(guide.faqs),
    buildTechArticleJsonLd({ headline: guide.h1, description: guide.metaDescription, path }),
  ]
  writeRoute(path, buildHead({ title: guide.title, description: guide.metaDescription, path, jsonLdBlocks }))
  count++
}

for (const tool of toolMeta) {
  writeRoute(tool.path, buildHead({ title: tool.title, description: tool.description, path: tool.path }))
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
