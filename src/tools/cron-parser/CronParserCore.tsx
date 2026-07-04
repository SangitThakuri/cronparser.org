import { useState, useMemo } from "react"
import cronstrue from "cronstrue"
import { CopyButton } from "../../components/ui/CopyButton"
import { ClearInputButton } from "../../components/ui/ClearInputButton"
import { ErrorBadge } from "../../components/ui/ErrorBadge"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { CronTemplateButtons, type CronTemplate } from "./CronTemplateButtons"
import { NextRunsPanel } from "./NextRunsPanel"

const TEMPLATES: readonly CronTemplate[] = [
  { cron: "0 0 * * *", label: "Every Midnight" },
  { cron: "*/15 * * * *", label: "Every 15 Minutes" },
  { cron: "0 0 * * 6,0", label: "Weekends Only" },
  { cron: "0 0 1 * *", label: "Every 1st of the Month" },
]

const FIELDS = [
  { label: "Minute", range: "0–59" },
  { label: "Hour", range: "0–23" },
  { label: "Day", range: "1–31" },
  { label: "Month", range: "1–12" },
  { label: "Weekday", range: "0–6 (Sun=0)" },
]

function parseCron(expression: string): { description: string | null; error: string | null } {
  const trimmed = expression.trim()
  if (!trimmed) return { description: null, error: null }
  try {
    const description = cronstrue.toString(trimmed, {
      use24HourTimeFormat: false,
      verbose: true,
    })
    return { description, error: null }
  } catch (e) {
    return { description: null, error: String(e).replace(/^Error:\s*/i, "") }
  }
}

export function CronParserCore() {
  const [expression, setExpression] = useState("")
  const { description, error } = useMemo(() => parseCron(expression), [expression])

  const inputClass = error
    ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:border-red-700 dark:bg-red-950 dark:focus:border-red-500 dark:focus:ring-red-900"
    : description
      ? "border-green-300 bg-white focus:border-green-400 focus:ring-green-100 dark:border-green-700 dark:bg-gray-800 dark:focus:border-green-500 dark:focus:ring-green-900"
      : "border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900"

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
          Cron Expression Parser
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Translate any 5 or 6-part crontab schedule into plain English — instantly, entirely in
          your browser.
        </p>
      </div>

      {/* Input */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Cron Expression
          </label>
          <div className="flex items-center gap-2">
            {error && <ErrorBadge message="Invalid cron expression" />}
            {expression && <ClearInputButton onClear={() => setExpression("")} />}
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="e.g. */15 0 1 * *"
            spellCheck={false}
            autoFocus
            className={`flex-1 rounded-xl border p-4 font-mono text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:text-gray-100 dark:placeholder:text-gray-500 transition-colors ${inputClass}`}
          />
          {expression && <CopyButton text={expression} />}
        </div>
      </div>

      {/* Quick templates */}
      <div className="mb-6">
        <CronTemplateButtons templates={TEMPLATES} onSelect={setExpression} />
      </div>

      {/* Result */}
      {description && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-500 mb-1">
            Schedule
          </p>
          <p className="text-lg font-semibold text-green-800 dark:text-green-200">
            {description}
          </p>
        </div>
      )}
      {error && (
        <div className="mb-5 overflow-x-auto rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="font-mono text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Next 5 upcoming runs */}
      <div className="mb-6">
        <NextRunsPanel expression={expression} isValid={!!description && !error} />
      </div>

      {/* Field reference */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Standard 5-field order
        </p>
        <div className="grid grid-cols-5 gap-2 text-center">
          {FIELDS.map(({ label, range }) => (
            <div key={label} className="rounded-md bg-white px-2 py-2 shadow-sm dark:bg-gray-800">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</p>
              <p className="mt-0.5 font-mono text-xs text-gray-400 dark:text-gray-500">{range}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          Special characters: <span className="font-mono">*</span> (any) &nbsp;
          <span className="font-mono">*/n</span> (every n) &nbsp;
          <span className="font-mono">x-y</span> (range) &nbsp;
          <span className="font-mono">x,y</span> (list)
        </p>
      </div>

      <ToolSeoSection
        steps={[
          "Paste a cron expression (5 or 6 space-separated fields) into the input. The description updates on every keystroke.",
          "Use the quick template buttons to load common schedules for reference or testing.",
          "The input border turns green for a valid expression, red for an invalid one.",
          "Scroll to the \"Next 5 Upcoming Execution Runs\" panel to see the exact upcoming timestamps, calculated in your local timezone.",
          "Copy the expression with the Copy button next to the input.",
        ]}
        faqs={[
          {
            q: "What is a cron expression?",
            a: "A cron expression is a string of 5 (or 6) space-separated fields that define a recurring schedule: minute, hour, day-of-month, month, and day-of-week. A 6-field variant adds a leading seconds field.",
          },
          {
            q: "What do the special characters mean?",
            a: "* means every value. */n means every n units (step). x-y is a range. x,y is a comma-separated list. These can be combined: 0,30 * * * * runs at :00 and :30 of every hour.",
          },
          {
            q: "Does this support 6-field cron expressions?",
            a: "Yes. When six fields are provided, the first field is treated as seconds (0–59). This is common in Spring Boot, Quartz Scheduler, and AWS EventBridge cron syntax.",
          },
          {
            q: "How are the next 5 run times calculated?",
            a: "Entirely client-side, using your browser's local system clock and timezone. We walk forward from the current moment and find the next timestamps that satisfy every field of your expression — nothing is sent to a server.",
          },
          {
            q: "Is any data sent to a server?",
            a: "No. Translation and next-run calculation run entirely in your browser using the cronstrue library and local JavaScript logic. No cron expressions or schedule data leave your machine.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["timestamp-converter", "dotenv-validator", "curl-converter"]} />
    </div>
  )
}
