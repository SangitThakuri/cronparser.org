import { Link } from "react-router-dom"
import { INTERVAL_PAGES } from "../data/intervalPages"

export function PopularSchedules() {
  return (
    <section className="mx-auto mt-14 max-w-3xl">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Popular Cron Schedules
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Jump straight to a common schedule with its own expression, examples, and FAQs.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {INTERVAL_PAGES.map((page) => (
          <Link
            key={page.slug}
            to={`/${page.slug}`}
            className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
          >
            {page.h1.replace("Cron: ", "")}
          </Link>
        ))}
      </div>
    </section>
  )
}
