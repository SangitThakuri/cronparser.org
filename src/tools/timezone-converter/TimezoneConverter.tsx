import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, TriangleAlert } from "lucide-react"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { CopyButton } from "../../components/ui/CopyButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { convertCronTimezone, TIMEZONE_OPTIONS } from "./convertTimezone"

export default function TimezoneConverter() {
  const [cron, setCron] = useState("0 9 * * 1-5")
  const [fromTz, setFromTz] = useState<string>("UTC")
  const [toTz, setToTz] = useState<string>("America/New_York")

  const result = useMemo(() => convertCronTimezone(cron, fromTz, toTz), [cron, fromTz, toTz])

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta
        title="Cron Timezone Converter — Convert Cron Schedules Between Timezones | CronParser"
        description="Convert a cron expression's fixed hour and minute from one timezone to another — see exactly what time your job actually runs elsewhere."
        path="/timezone-converter"
      />

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Timezone Converter" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cron Timezone Converter</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Convert a cron schedule's hour and minute from one timezone to another.
        </p>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Cron Expression</label>
        <input
          type="text"
          value={cron}
          onChange={(e) => setCron(e.target.value)}
          placeholder="e.g. 0 9 * * 1-5"
          spellCheck={false}
          className="w-full rounded-lg border border-gray-200 bg-white p-3 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
        />
      </div>

      <div className="mb-6 flex flex-col items-center gap-3 sm:flex-row">
        <div className="w-full">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Defined In</label>
          <select
            value={fromTz}
            onChange={(e) => setFromTz(e.target.value)}
            className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
        <ArrowRight className="mt-5 h-4 w-4 shrink-0 rotate-90 text-gray-400 sm:rotate-0" />
        <div className="w-full">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Convert To</label>
          <select
            value={toTz}
            onChange={(e) => setToTz(e.target.value)}
            className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
      </div>

      {result.error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {result.error}
        </div>
      )}

      {result.cron && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xl font-semibold text-blue-800 dark:text-blue-200">{result.cron}</p>
            <div className="flex items-center gap-2">
              <CopyButton text={result.cron} />
              <Link
                to={`/?expr=${encodeURIComponent(result.cron)}`}
                className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Try it
              </Link>
            </div>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Equivalent schedule in {toTz}, given the original runs at{" "}
            {cron.split(" ")[1].padStart(2, "0")}:{cron.split(" ")[0].padStart(2, "0")} in {fromTz}.
          </p>
        </div>
      )}

      {result.warning && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-700 dark:text-amber-300">{result.warning}</p>
        </div>
      )}

      <ToolSeoSection
        steps={[
          "Enter a cron expression with a fixed minute and hour (e.g. 0 9 * * 1-5) — wildcard or ranged hour fields can't be shifted unambiguously.",
          "Choose the timezone the expression is currently defined in, and the timezone you want to convert it to.",
          "The converted expression appears with the hour (and minute, if needed) shifted by the current offset between the two zones.",
          "If the shift crosses midnight, a warning flags that the day fields weren't adjusted — verify manually for schedules near the day boundary.",
        ]}
        faqs={[
          {
            q: "Why can't I convert an expression with a wildcard hour field?",
            a: "A wildcard (*) or range in the hour field means \"any/multiple hours\" — there's no single fixed time to shift, so a timezone conversion wouldn't produce a meaningful single answer.",
          },
          {
            q: "Does this account for daylight saving time?",
            a: "The conversion uses the current UTC offset for both timezones at this exact moment. Since DST start/end dates differ (or don't exist) between regions, the correct offset can change a few weeks a year — recheck the conversion if your schedule needs to survive a DST transition.",
          },
          {
            q: "What happens if the conversion crosses midnight?",
            a: "The hour wraps within the same day-of-month and day-of-week fields, which may now be technically incorrect (e.g. a Monday 11pm UTC job converting to Tuesday 7am in a timezone ahead of UTC). The tool warns you in this case — adjust the day fields manually if precision matters.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "cheat-sheet", "examples"]} />
    </div>
  )
}
