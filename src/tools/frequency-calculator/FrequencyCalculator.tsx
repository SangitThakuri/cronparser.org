import { useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"
import cronstrue from "cronstrue"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { ClearInputButton } from "../../components/ui/ClearInputButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { getNextCronRuns } from "../../lib/cronNextRuns"

interface Frequency {
  perDay: number
  perWeek: number
  perMonth: number
  perYear: number
}

function computeFrequency(cron: string): Frequency | null {
  const { runs, error } = getNextCronRuns(cron, 30)
  if (error || runs.length < 2) return null

  const intervals: number[] = []
  for (let i = 1; i < runs.length; i++) {
    intervals.push(runs[i].getTime() - runs[i - 1].getTime())
  }
  const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length
  const perDay = 86_400_000 / avgMs

  return { perDay, perWeek: perDay * 7, perMonth: perDay * 30.44, perYear: perDay * 365.25 }
}

function formatCount(n: number): string {
  if (n >= 100) return Math.round(n).toLocaleString()
  if (n >= 1) return n.toFixed(n >= 10 ? 0 : 1)
  return n.toFixed(3)
}

export default function FrequencyCalculator() {
  const [input, setInput] = useState("")

  const description = useMemo(() => {
    if (!input.trim()) return null
    try {
      return cronstrue.toString(input.trim(), { use24HourTimeFormat: false, verbose: true })
    } catch {
      return null
    }
  }, [input])

  const frequency = useMemo(() => (input.trim() ? computeFrequency(input.trim()) : null), [input])

  return (
    <div className="mx-auto max-w-3xl">
      <Helmet>
        <title>Cron Frequency Calculator — How Often Does a Cron Job Run? | CronParser</title>
        <meta
          name="description"
          content="Calculate exactly how many times a cron expression runs per day, week, month, and year — entirely client-side, based on real upcoming run times."
        />
      </Helmet>

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Frequency Calculator" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cron Frequency Calculator</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          See exactly how many times a cron expression fires per day, week, month, and year.
        </p>
      </div>

      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cron Expression</label>
          {input && <ClearInputButton onClear={() => setInput("")} />}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. */15 9-17 * * 1-5"
          spellCheck={false}
          className="w-full rounded-lg border border-gray-200 bg-white p-3 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
        />
      </div>

      {description && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}

      {input.trim() && !frequency && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          Couldn't calculate a frequency — check that the expression is valid.
        </div>
      )}

      {frequency && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Per Day", value: frequency.perDay },
            { label: "Per Week", value: frequency.perWeek },
            { label: "Per Month", value: frequency.perMonth },
            { label: "Per Year", value: frequency.perYear },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center dark:border-gray-700 dark:bg-gray-900"
            >
              <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
              <p className="mt-1 font-mono text-xl font-semibold text-gray-900 dark:text-gray-100">
                {formatCount(value)}
              </p>
            </div>
          ))}
        </div>
      )}

      <ToolSeoSection
        steps={[
          "Paste a cron expression — the frequency is derived from real upcoming run times, not just field counts, so it correctly handles day-of-month/day-of-week interactions.",
          "Per Day, Per Week, Per Month, and Per Year are all computed from the same underlying average interval between runs, so they stay consistent with each other.",
          "Very low-frequency schedules (like yearly jobs) show fractional per-day/per-week counts — that's expected, since less than one run happens in those shorter windows.",
        ]}
        faqs={[
          {
            q: "How is the frequency actually calculated?",
            a: "The tool computes the next 30 real run times for the expression, averages the interval between them, and derives daily/weekly/monthly/yearly rates from that average — correctly handling irregular schedules like weekdays-only or specific-day-of-month patterns.",
          },
          {
            q: "Why do the numbers look approximate for monthly schedules?",
            a: "Month and year lengths vary (28-31 days, 365-366 days), so per-month and per-year figures use average lengths (30.44 and 365.25 days) rather than a fixed calendar month — this keeps the numbers stable rather than fluctuating based on which month happens to be current.",
          },
          {
            q: "Is my expression sent to a server?",
            a: "No. All calculation happens entirely in your browser using local JavaScript. Nothing is transmitted anywhere.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "cheat-sheet", "examples"]} />
    </div>
  )
}
