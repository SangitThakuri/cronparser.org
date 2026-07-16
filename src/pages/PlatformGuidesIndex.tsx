import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Box, Cloud, GitBranch, LayoutDashboard, Monitor, Puzzle, Search, SearchX, Server } from "lucide-react"
import { Breadcrumbs } from "../components/ui/Breadcrumbs"
import { SeoMeta } from "../components/ui/SeoMeta"
import { PLATFORM_GUIDES } from "../data/platformGuides"

const CATEGORY_ICONS: Record<string, typeof Monitor> = {
  "Operating System": Monitor,
  "Container & Orchestration": Box,
  "CI/CD": GitBranch,
  "Cloud Scheduler": Cloud,
  "Application Framework": Puzzle,
  "Control Panel": LayoutDashboard,
}

export function PlatformGuidesIndex() {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PLATFORM_GUIDES
    return PLATFORM_GUIDES.filter(
      (g) => g.h1.toLowerCase().includes(q) || g.category.toLowerCase().includes(q) || g.intro.toLowerCase().includes(q),
    )
  }, [query])

  const groups = useMemo(() => {
    const map = new Map<string, typeof PLATFORM_GUIDES>()
    for (const guide of filtered) {
      if (!map.has(guide.category)) map.set(guide.category, [])
      map.get(guide.category)!.push(guide)
    }
    return [...map.entries()]
  }, [filtered])

  return (
    <div className="mx-auto max-w-5xl py-10">
      <SeoMeta
        title="Cron Platform Guides — Linux, Kubernetes, AWS, GitHub Actions & More | CronParser"
        description="Cron syntax and gotchas for every major platform: Linux, Ubuntu, macOS, Kubernetes CronJob, GitHub Actions, AWS EventBridge, Google Cloud Scheduler, Azure, Quartz, Jenkins, and more."
        path="/platforms"
      />

      <Breadcrumbs items={[{ label: "Platform Guides" }]} />

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Platform Guides</h1>
        <p className="mx-auto mt-2 max-w-2xl text-gray-500 dark:text-gray-400">
          Cron syntax, gotchas, and code examples for {PLATFORM_GUIDES.length} platforms and schedulers —
          from Linux crontabs to Kubernetes CronJobs to cloud-native schedulers.
        </p>
      </div>

      <div className="relative mx-auto mb-8 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search platforms, e.g. &quot;kubernetes&quot; or &quot;CI/CD&quot;..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900"
        />
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-800">
          <SearchX className="h-8 w-8 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No platform guides match <span className="font-medium text-gray-700 dark:text-gray-300">"{query}"</span>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map(([category, guides]) => {
            const CategoryIcon = CATEGORY_ICONS[category] ?? Server
            return (
              <section key={category}>
                <h2 className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                  <CategoryIcon className="h-3.5 w-3.5" />
                  {category}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {guides.map((guide) => (
                    <Link
                      key={guide.slug}
                      to={`/${guide.slug}`}
                      className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:group-hover:bg-blue-900">
                        <CategoryIcon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{guide.h1}</h3>
                        <p className="mt-0.5 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                          {guide.metaDescription}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
