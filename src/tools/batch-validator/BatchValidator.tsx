import { useMemo, useState } from "react"
import { CheckCircle2, CircleSlash, XCircle } from "lucide-react"
import { AdSlot } from "../../components/ui/AdSlot"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { ClearInputButton } from "../../components/ui/ClearInputButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { parseCrontab } from "./parseCrontab"

const EXAMPLE = `# Backups
0 2 * * * /home/user/scripts/backup.sh >> /var/log/backup.log 2>&1

# Sync every 15 minutes on weekdays
*/15 * * * 1-5 /home/user/scripts/sync.sh

MAILTO=""
@daily /home/user/scripts/cleanup.sh

# Typo below: hour field out of range
0 25 * * * /home/user/scripts/broken.sh`

export default function BatchValidator() {
  const [text, setText] = useState(EXAMPLE)

  const lines = useMemo(() => parseCrontab(text), [text])

  const summary = useMemo(() => {
    const schedules = lines.filter((l) => l.kind === "schedule" || l.kind === "nickname")
    const valid = schedules.filter((l) => l.validation?.overallValid).length
    const invalid = schedules.length - valid
    const skipped = lines.length - schedules.length
    return { total: schedules.length, valid, invalid, skipped }
  }, [lines])

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta
        title="Batch Crontab Validator — Check Every Line at Once | CronParser"
        description="Paste a whole crontab file and validate every scheduled entry at once, with a plain-English explanation for each line and every error flagged — entirely client-side."
        path="/batch-validator"
      />

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Batch Crontab Validator" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Batch Crontab Validator</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Paste a whole crontab file and validate every scheduled line at once — comments, blank lines, and
          environment variable assignments are recognized and skipped automatically.
        </p>
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Crontab Contents</label>
          {text && <ClearInputButton onClear={() => setText("")} />}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder="Paste your crontab here, one entry per line..."
          className="w-full resize-y rounded-lg border border-gray-200 bg-white p-3 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900"
        />
      </div>

      {summary.total > 0 && (
        <div className="mb-6 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {summary.valid} valid
          </span>
          {summary.invalid > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
              <XCircle className="h-3.5 w-3.5" />
              {summary.invalid} invalid
            </span>
          )}
          {summary.skipped > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <CircleSlash className="h-3.5 w-3.5" />
              {summary.skipped} skipped (comments/blank/env)
            </span>
          )}
        </div>
      )}

      <div className="mb-8 flex flex-col gap-1.5">
        {lines.map((line) => {
          if (line.kind === "blank") return null
          if (line.kind === "comment" || line.kind === "env") {
            return (
              <div
                key={line.lineNumber}
                className="flex items-start gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-900"
              >
                <span className="mt-0.5 w-6 shrink-0 text-right font-mono text-xs text-gray-300 dark:text-gray-600">
                  {line.lineNumber}
                </span>
                <CircleSlash className="mt-0.5 h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
                <span className="min-w-0 truncate font-mono text-gray-400 dark:text-gray-500">{line.raw}</span>
              </div>
            )
          }

          const ok = line.validation?.overallValid
          return (
            <div
              key={line.lineNumber}
              className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm ${
                ok
                  ? "border-green-100 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20"
                  : "border-red-100 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20"
              }`}
            >
              <span className="mt-0.5 w-6 shrink-0 text-right font-mono text-xs text-gray-400 dark:text-gray-500">
                {line.lineNumber}
              </span>
              {ok ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-500" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-gray-900 dark:text-gray-100">{line.raw}</p>
                {ok ? (
                  <p className="mt-0.5 text-gray-600 dark:text-gray-400">{line.description}</p>
                ) : (
                  <p className="mt-0.5 text-red-600 dark:text-red-400">
                    {line.validation?.fields.find((f) => !f.valid)?.message ??
                      line.description ??
                      "Invalid schedule"}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mb-8">
        <AdSlot />
      </div>

      <ToolSeoSection
        steps={[
          "Paste an entire crontab file — every line is checked independently, in order.",
          "Comments (starting with #), blank lines, and environment variable assignments (like MAILTO=\"\") are automatically recognized and skipped rather than flagged as errors.",
          "@nickname shortcuts (@daily, @hourly, @reboot, etc.) are recognized and explained the same as a full 5-field schedule.",
          "Each schedule line gets a plain-English explanation if valid, or the specific field and reason if invalid.",
        ]}
        faqs={[
          {
            q: "Does this handle 6-field (seconds-based) crontab entries?",
            a: "No — this tool assumes the standard 5-field schedule form used by real Linux/Unix crontabs, since a 6th schedule field can't be reliably distinguished from the first word of the command on a single line. For a 6-field Quartz or seconds-based expression, use the single-expression Cron Validator instead.",
          },
          {
            q: "What counts as a comment or environment variable line?",
            a: "Any line starting with # is treated as a comment. Any line matching NAME=value (like MAILTO=\"\" or PATH=/usr/bin:/bin) is treated as an environment assignment. Both are skipped rather than validated, matching how a real crontab file is structured.",
          },
          {
            q: "Is my crontab file uploaded anywhere?",
            a: "No — everything is parsed and validated entirely in your browser with local JavaScript. Nothing is transmitted to a server.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "validator", "cheat-sheet"]} />
    </div>
  )
}
