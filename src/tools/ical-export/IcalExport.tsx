import { useMemo, useState } from "react"
import cronstrue from "cronstrue"
import { CalendarPlus, Download } from "lucide-react"
import { AdSlot } from "../../components/ui/AdSlot"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { ClearInputButton } from "../../components/ui/ClearInputButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { getNextCronRuns } from "../../lib/cronNextRuns"
import { buildIcs } from "./buildIcs"

const COUNT_OPTIONS = [10, 25, 50] as const

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function IcalExport() {
  const [expression, setExpression] = useState("0 9 * * 1-5")
  const [title, setTitle] = useState("Cron Job")
  const [count, setCount] = useState<(typeof COUNT_OPTIONS)[number]>(25)

  const { description, error } = useMemo(() => {
    if (!expression.trim()) return { description: null, error: null }
    try {
      return {
        description: cronstrue.toString(expression.trim(), { use24HourTimeFormat: false, verbose: true }),
        error: null,
      }
    } catch (e) {
      return { description: null, error: String(e).replace(/^Error:\s*/i, "") }
    }
  }, [expression])

  const isValid = !!description && !error

  const { runs } = useMemo(() => {
    if (!isValid) return { runs: [] as Date[] }
    return getNextCronRuns(expression, count)
  }, [expression, count, isValid])

  function handleDownload() {
    const ics = buildIcs({ runs, title: title.trim() || "Cron Job", cronExpression: expression.trim() })
    downloadFile("cron-schedule.ics", ics, "text/calendar")
  }

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta
        title="Cron to iCal Export — Add a Cron Schedule to Your Calendar | CronParser"
        description="Export a cron expression's upcoming run times as a downloadable .ics calendar file, ready to import into Google Calendar, Outlook, or Apple Calendar. Entirely client-side."
        path="/ical-export"
      />

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Cron to iCal Export" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cron to iCal Export</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Turn a cron schedule's upcoming runs into a calendar file you can import anywhere.
        </p>
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cron Expression</label>
          {expression && <ClearInputButton onClear={() => setExpression("")} />}
        </div>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="e.g. 0 9 * * 1-5"
          spellCheck={false}
          className={`w-full rounded-lg border p-3 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:text-gray-100 dark:placeholder:text-gray-500 transition-colors ${
            error
              ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:border-red-700 dark:bg-red-950"
              : "border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900"
          }`}
        />
        {description && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        {error && <p className="mt-2 font-mono text-xs text-red-500">{error}</p>}
      </div>

      {isValid && (
        <>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nightly Backup"
              className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900"
            />
          </div>

          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
              {COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    count === n
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  }`}
                >
                  Next {n}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleDownload}
              disabled={runs.length === 0}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Download .ics
            </button>
          </div>

          {runs.length > 0 && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-3 flex items-center gap-2 text-gray-400 dark:text-gray-500">
                <CalendarPlus className="h-3.5 w-3.5" />
                <p className="text-xs font-semibold uppercase tracking-wider">
                  Events To Be Included ({runs.length})
                </p>
              </div>
              <ol className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                {runs.map((run) => (
                  <li
                    key={run.getTime()}
                    className="rounded-lg bg-gray-50 px-3 py-2 font-mono text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {run.toLocaleString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}

      <div className="mb-8">
        <AdSlot />
      </div>

      <ToolSeoSection
        steps={[
          "Enter a cron expression — its upcoming run times are computed the same way as the Next Run Countdown tool.",
          "Choose how many upcoming runs to include (10, 25, or 50) and optionally rename the calendar event title.",
          "Click Download .ics to save a standard calendar file with one event per upcoming run.",
          "Import the file into Google Calendar, Outlook, Apple Calendar, or any app that accepts .ics files.",
        ]}
        faqs={[
          {
            q: "Why does this create separate events instead of one recurring event?",
            a: "Most real-world cron expressions — step values, day-of-month-or-day-of-week combinations, uneven intervals — don't map cleanly onto the iCalendar recurrence rule format. A flat list of the actual computed run times is always correct, regardless of how complex the cron expression is.",
          },
          {
            q: "What timezone are the calendar events in?",
            a: "Events are stored in UTC inside the file, which every major calendar app automatically converts to display in your own local timezone — so there's nothing to configure here.",
          },
          {
            q: "Is my cron expression sent to a server to generate the file?",
            a: "No. The run times are calculated and the .ics file is generated entirely in your browser; nothing is uploaded anywhere.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "countdown", "visualizer"]} />
    </div>
  )
}
