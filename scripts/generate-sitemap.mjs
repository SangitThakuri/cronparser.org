#!/usr/bin/env node
// Regenerates public/sitemap.xml from the route data files, so every new
// tool/interval-page/platform-guide is picked up automatically at build
// time instead of needing a manual sitemap edit.
//
// Route ids/slugs are extracted with a regex rather than importing the
// source modules directly — registry/tools.ts pulls in React + lucide-react
// component references that aren't worth spinning up a TS/JSX loader for
// just to read a list of string ids.

import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const SITE_URL = "https://cronparser.org"
const today = new Date().toISOString().slice(0, 10)

function extractValues(relativePath, key) {
  const source = readFileSync(join(root, relativePath), "utf8")
  const re = new RegExp(`${key}:\\s*"([^"]+)"`, "g")
  return [...source.matchAll(re)].map((m) => m[1])
}

// A couple of pages act as content hubs and deserve a priority/changefreq
// bump over the rest of their category — everything else gets the category
// default.
const TOOL_OVERRIDES = {
  "cheat-sheet": { changefreq: "monthly", priority: "0.9" },
  examples: { changefreq: "weekly", priority: "0.9" },
}

const toolIds = extractValues("src/registry/tools.ts", "id")
const intervalSlugs = extractValues("src/data/intervalPages.ts", "slug")
const platformSlugs = extractValues("src/data/platformGuides.ts", "slug")

const entries = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/all-tools", changefreq: "monthly", priority: "0.6" },
  { loc: "/platforms", changefreq: "monthly", priority: "0.8" },
  ...toolIds.map((id) => ({
    loc: `/${id}`,
    ...(TOOL_OVERRIDES[id] ?? { changefreq: "monthly", priority: "0.8" }),
  })),
  ...intervalSlugs.map((slug) => ({ loc: `/${slug}`, changefreq: "monthly", priority: "0.7" })),
  ...platformSlugs.map((slug) => ({ loc: `/${slug}`, changefreq: "monthly", priority: "0.7" })),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${SITE_URL}${e.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`

writeFileSync(join(root, "public/sitemap.xml"), xml)
console.log(`Generated public/sitemap.xml with ${entries.length} URLs.`)
