import type { RegistryEntry } from "../registry/types"
import { INTERVAL_PAGES, type IntervalPage } from "../data/intervalPages"
import { PLATFORM_GUIDES, type PlatformGuide } from "../data/platformGuides"

export interface SimpleMatch {
  path: string
  name: string
  description: string
}

function matches(query: string, ...fields: string[]): boolean {
  const q = query.toLowerCase()
  return fields.some((f) => f.toLowerCase().includes(q))
}

export function searchIntervalPages(query: string): SimpleMatch[] {
  if (!query.trim()) return []
  return INTERVAL_PAGES.filter((p) => matches(query, p.h1, p.metaDescription, p.slug)).map(toIntervalMatch)
}

export function searchPlatformGuides(query: string): SimpleMatch[] {
  if (!query.trim()) return []
  return PLATFORM_GUIDES.filter((g) => matches(query, g.h1, g.metaDescription, g.slug, g.category)).map(toGuideMatch)
}

function toIntervalMatch(p: IntervalPage): SimpleMatch {
  return { path: `/${p.slug}`, name: p.h1, description: p.metaDescription }
}

function toGuideMatch(g: PlatformGuide): SimpleMatch {
  return { path: `/${g.slug}`, name: g.h1, description: g.category }
}

export interface SiteSearchResults {
  tools: RegistryEntry[]
  schedules: SimpleMatch[]
  guides: SimpleMatch[]
}

/** Full-site search across interactive tools, schedule pages, and platform guides. */
export function searchSite(tools: RegistryEntry[], query: string): SiteSearchResults {
  if (!query.trim()) return { tools, schedules: [], guides: [] }
  const q = query.toLowerCase().trim()
  return {
    tools: tools.filter((t) => matches(q, t.name, t.description)),
    schedules: searchIntervalPages(q),
    guides: searchPlatformGuides(q),
  }
}
