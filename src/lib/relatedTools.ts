import type { ComponentType } from "react"
import { BookMarked, CalendarClock, Clock, Newspaper, Server } from "lucide-react"
import { tools } from "../registry/tools"

// Display metadata for a "related" internal link card.
//
// Deliberately holds only what a link card needs — never a page's body content.
// See resolveToolEntries for why that distinction matters for bundle size.
export interface RelatedEntry {
  path: string
  name: string
  description: string
  icon: ComponentType<{ className?: string }>
}

export const HOME_ENTRY: RelatedEntry = {
  path: "/",
  name: "Cron Parser",
  description: "Translate cron expressions to plain English",
  icon: Clock,
}

export const PLATFORMS_ENTRY: RelatedEntry = {
  path: "/platforms",
  name: "Platform Guides",
  description: "Cron syntax for Linux, Kubernetes, AWS, and more",
  icon: Server,
}

export const BLOG_ENTRY: RelatedEntry = {
  path: "/blog",
  name: "Blog",
  description: "Deep dives on cron gotchas, incidents, and tooling",
  icon: Newspaper,
}

/**
 * Resolve tool ids (plus the "home"/"platforms"/"blog" aliases) to link cards.
 *
 * This imports only the tool registry — which every layout already pulls in —
 * and deliberately does NOT import the interval page / platform guide / blog
 * post data files. Those three modules together are ~250KB raw (~88KB gzipped)
 * of long-form prose, and importing them here put all of it on the critical
 * path of every page, because the home page renders a Related Tools footer.
 *
 * Pages that link to non-tool content (interval pages, platform guides, blog
 * posts) resolve those entries themselves, against data they already have
 * loaded, and pass the result in as pre-built `entries`.
 */
export function resolveToolEntries(ids: string[]): RelatedEntry[] {
  return ids
    .map((id) => {
      if (id === "home") return HOME_ENTRY
      if (id === "platforms") return PLATFORMS_ENTRY
      if (id === "blog") return BLOG_ENTRY
      const tool = tools.find((t) => t.id === id)
      return tool ? { path: `/${tool.id}`, name: tool.name, description: tool.description, icon: tool.icon } : null
    })
    .filter((entry): entry is RelatedEntry => entry !== null)
}

/**
 * Icons for the content data files, exported for pages that build their own entries.
 *
 * These live here (a registry-only module) rather than in each data file so that
 * icons stay importable without pulling page prose in with them.
 */
export const CONTENT_ICONS = {
  guide: BookMarked,
  interval: CalendarClock,
  post: Newspaper,
}