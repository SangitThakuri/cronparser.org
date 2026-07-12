import { Link } from "react-router-dom"
import { BookMarked, CalendarClock, Clock, Server } from "lucide-react"
import { tools } from "../../registry/tools"
import { PLATFORM_GUIDES } from "../../data/platformGuides"
import { INTERVAL_PAGES } from "../../data/intervalPages"

const HOME_ENTRY = {
  path: "/",
  name: "Cron Parser",
  description: "Translate cron expressions to plain English",
  icon: Clock,
}

const PLATFORMS_ENTRY = {
  path: "/platforms",
  name: "Platform Guides",
  description: "Cron syntax for Linux, Kubernetes, AWS, and more",
  icon: Server,
}

interface RelatedToolsFooterProps {
  toolIds: string[]
}

export function RelatedToolsFooter({ toolIds }: RelatedToolsFooterProps) {
  const related = toolIds
    .map((id) => {
      if (id === "home") return HOME_ENTRY
      if (id === "platforms") return PLATFORMS_ENTRY
      const tool = tools.find((t) => t.id === id)
      if (tool) return { path: `/${tool.id}`, name: tool.name, description: tool.description, icon: tool.icon }
      const guide = PLATFORM_GUIDES.find((g) => g.slug === id)
      if (guide) return { path: `/${guide.slug}`, name: guide.h1, description: guide.metaDescription, icon: BookMarked }
      const interval = INTERVAL_PAGES.find((p) => p.slug === id)
      if (interval) return { path: `/${interval.slug}`, name: interval.h1, description: interval.metaDescription, icon: CalendarClock }
      return null
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  if (related.length === 0) return null

  return (
    <div className="mt-12 border-t border-gray-100 pt-8 dark:border-gray-800">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
        Related Tools
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {related.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:group-hover:bg-blue-900">
              <tool.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {tool.name}
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
