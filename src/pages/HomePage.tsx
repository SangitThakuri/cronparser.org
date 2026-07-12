import { Link } from "react-router-dom"
import { Grid2x2, Server } from "lucide-react"
import { AdSlot } from "../components/ui/AdSlot"
import { SeoMeta } from "../components/ui/SeoMeta"
import { CronParserCore } from "../tools/cron-parser/CronParserCore"
import { HomeFaqSection } from "./HomeFaqSection"
import { PopularSchedules } from "./PopularSchedules"

export function HomePage() {
  return (
    <div>
      <SeoMeta
        title="Online Cron Expression Parser & Crontab Descriptor | CronParser"
        description="Translate complex crontab schedule expressions into plain, human-readable language instantly. View upcoming job execution times entirely client-side."
        path="/"
      />

      <CronParserCore />

      <PopularSchedules />

      <div className="mx-auto mt-10 max-w-3xl">
        <AdSlot />
      </div>

      <HomeFaqSection />

      <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3 text-center">
        <Link
          to="/all-tools"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
        >
          <Grid2x2 className="h-4 w-4" />
          Browse all cron tools
        </Link>
        <Link
          to="/platforms"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
        >
          <Server className="h-4 w-4" />
          Browse platform guides
        </Link>
      </div>
    </div>
  )
}
