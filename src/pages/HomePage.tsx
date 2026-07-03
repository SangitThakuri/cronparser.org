import { Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Grid2x2 } from "lucide-react"
import { CronParserCore } from "../tools/cron-parser/CronParserCore"
import { HomeFaqSection } from "./HomeFaqSection"

export function HomePage() {
  return (
    <div>
      <Helmet>
        <title>Online Cron Expression Parser & Crontab Descriptor | CronParser</title>
        <meta
          name="description"
          content="Translate complex crontab schedule expressions into plain, human-readable language instantly. View upcoming job execution times entirely client-side."
        />
      </Helmet>

      <CronParserCore />

      <HomeFaqSection />

      <div className="mx-auto mt-10 max-w-3xl text-center">
        <Link
          to="/all-tools"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
        >
          <Grid2x2 className="h-4 w-4" />
          Browse all developer tools
        </Link>
      </div>
    </div>
  )
}
