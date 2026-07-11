import { useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { Search, SearchX } from "lucide-react"
import { CopyButton } from "../../components/ui/CopyButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { CRON_EXAMPLES, CRON_EXAMPLE_CATEGORIES } from "../../data/cronExamples"

export default function ExamplesLibrary() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>("All")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CRON_EXAMPLES.filter((ex) => {
      const matchesCategory = category === "All" || ex.category === category
      const matchesQuery =
        !q || ex.cron.toLowerCase().includes(q) || ex.label.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [query, category])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof CRON_EXAMPLES>()
    for (const ex of filtered) {
      if (!map.has(ex.category)) map.set(ex.category, [])
      map.get(ex.category)!.push(ex)
    }
    return [...map.entries()]
  }, [filtered])

  return (
    <div className="mx-auto max-w-4xl">
      <Helmet>
        <title>Cron Examples Library — Searchable Cron Expression Examples | CronParser</title>
        <meta
          name="description"
          content="Browse and search dozens of common cron expression examples — intervals, daily/weekly/monthly schedules, business hours, DevOps, and backup jobs — with instant copy and try-it links."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cron Examples Library</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Browse or search {CRON_EXAMPLES.length} common cron expressions, grouped by use case.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search examples, e.g. &quot;backup&quot; or &quot;*/15&quot;..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900"
        />
      </div>

      {/* Category pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {["All", ...CRON_EXAMPLE_CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              category === cat
                ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-800">
          <SearchX className="h-8 w-8 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No examples match <span className="font-medium text-gray-700 dark:text-gray-300">"{query}"</span>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map(([cat, examples]) => (
            <section key={cat}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                {cat}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {examples.map((ex) => (
                  <div
                    key={ex.cron}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm text-gray-900 dark:text-gray-100">{ex.cron}</p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">{ex.label}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <CopyButton text={ex.cron} />
                      <Link
                        to={`/?expr=${encodeURIComponent(ex.cron)}`}
                        className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
                      >
                        Try it
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <ToolSeoSection
        steps={[
          "Search by keyword (like \"backup\" or \"weekday\") or by typing part of a cron expression.",
          "Filter by category using the pills above the list — Common Intervals, Daily, Weekly, Monthly, Business Hours, DevOps, and Backups.",
          "Copy any expression directly, or click \"Try it\" to open it in the Cron Parser with a live explanation and upcoming run times.",
          "Check the Cron Cheat Sheet for the underlying syntax reference these examples are built from.",
        ]}
        faqs={[
          {
            q: "Can I use these examples directly in my crontab?",
            a: "Yes. Every expression here follows standard 5-field cron syntax, compatible with Linux cron, systemd timers, and most job schedulers. Always verify with your target system's documentation for edge-case behavior.",
          },
          {
            q: "Do these examples work in GitHub Actions or Kubernetes CronJobs?",
            a: "Yes, both use standard 5-field cron syntax for their schedule field, so any expression in this library will work as-is.",
          },
          {
            q: "What timezone do these schedules run in?",
            a: "That depends on your system, not the expression itself — cron expressions don't encode a timezone. Check the Cron Parser's timezone selector to preview run times in a specific zone.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "cheat-sheet"]} />
    </div>
  )
}
