import { ExternalLink } from "lucide-react"
import { Breadcrumbs } from "../components/ui/Breadcrumbs"
import { SeoMeta } from "../components/ui/SeoMeta"

export function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl py-10">
      <SeoMeta
        title="About CronParser | Free Cron Expression Tools"
        description="CronParser.org is a free, client-side toolkit for reading, building, and debugging cron expressions — no sign-up, no server, no tracking."
        path="/about"
      />

      <Breadcrumbs items={[{ label: "About" }]} />

      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">About CronParser</h1>

      <div className="prose prose-sm mt-6 max-w-none text-gray-600 dark:text-gray-300">
        <p>
          CronParser.org is a free toolkit for reading, building, and debugging cron expressions. It grew out of a
          simple frustration: cron syntax is compact and powerful, but not very readable — and most existing tools
          only handled one small piece of the workflow (translate an expression, or preview run times, or convert
          between platforms — rarely all three).
        </p>
        <p>
          The site now covers the full cron workflow in one place: a plain-English parser, a visual schedule
          builder, a timezone converter, platform-specific guides (Linux, Kubernetes, AWS, GitHub Actions, and
          more), and reference pages for common intervals like "every 5 minutes" or "every weekday".
        </p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">How it works</h2>
        <p>
          Every tool on this site runs entirely in your browser. There's no backend, no account, and no expression
          you enter is ever sent to a server — the parsing and scheduling math all happen client-side in
          JavaScript. See the <a href="/privacy">Privacy Policy</a> for details.
        </p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Feedback and contributions</h2>
        <p>
          CronParser.org is open source. Bug reports, feature requests, and pull requests are welcome on GitHub.
        </p>
        <a
          href="https://github.com/SangitThakuri/cronparser.org"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 no-underline transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
        >
          <ExternalLink className="h-4 w-4" />
          View on GitHub
        </a>
      </div>
    </div>
  )
}
