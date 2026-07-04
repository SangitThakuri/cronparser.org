import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { SearchX } from "lucide-react"
import { tools } from "../registry/tools"
import type { RegistryEntry } from "../registry/types"
import { useSearchQuery } from "../context/SearchContext"
import { filterTools } from "../hooks/useSearchFilter"

function groupByCategory(items: RegistryEntry[]): [string, RegistryEntry[]][] {
  const map = new Map<string, RegistryEntry[]>()
  for (const item of items) {
    const cat = item.category ?? "Other"
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(item)
  }
  return [...map.entries()]
}

export function AllToolsPage() {
  const { query } = useSearchQuery()
  const filtered = filterTools(tools, query)
  const groups = groupByCategory(filtered)

  return (
    <div className="mx-auto max-w-5xl py-10">
      <Helmet>
        <title>All Developer Tools | DevBits</title>
        <meta
          name="description"
          content="Browse the full DevBits toolkit — JSON formatting, diffing, hashing, JWT debugging, encoding, and more. Free, fast, and private developer utilities that run entirely in your browser."
        />
      </Helmet>

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">All Tools</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {tools.length} free developer utilities — all run locally in your browser.
        </p>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          Looking for the Cron Parser?{" "}
          <Link to="/" className="text-blue-600 hover:underline dark:text-blue-400">
            It's on the home page
          </Link>
          .
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-800">
          <SearchX className="h-8 w-8 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tools match <span className="font-medium text-gray-700 dark:text-gray-300">"{query}"</span>
          </p>
        </div>
      ) : (
      <div className="flex flex-col gap-10">
        {groups.map(([category, catTools]) => (
          <section key={category}>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
              {category}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {catTools.map((tool) => (
                <Link
                  key={tool.id}
                  to={`/${tool.id}`}
                  className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:group-hover:bg-blue-900">
                    <tool.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {tool.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      )}
    </div>
  )
}
