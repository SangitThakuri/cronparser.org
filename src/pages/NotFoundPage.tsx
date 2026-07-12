import { Link } from "react-router-dom"
import { CalendarClock, Grid2x2, SearchX } from "lucide-react"
import { SeoMeta } from "../components/ui/SeoMeta"

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-20 text-center">
      <SeoMeta
        title="Page Not Found | CronParser"
        description="The page you're looking for doesn't exist on CronParser."
        path="/404"
        noindex
      />

      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600">
        <SearchX className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-gray-900 dark:text-gray-100">Page not found</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        The page you're looking for doesn't exist, or the link may be out of date.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <CalendarClock className="h-4 w-4" />
          Go to Cron Parser
        </Link>
        <Link
          to="/all-tools"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
        >
          <Grid2x2 className="h-4 w-4" />
          Browse all cron tools
        </Link>
      </div>
    </div>
  )
}
