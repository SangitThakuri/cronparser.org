import { useMemo, useState } from "react"
import cronstrue from "cronstrue"
import { AlertTriangle } from "lucide-react"
import { AdSlot } from "../../components/ui/AdSlot"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { ClearInputButton } from "../../components/ui/ClearInputButton"
import { CopyButton } from "../../components/ui/CopyButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { convertCronFormat, FORMAT_LABELS, type CronFormat } from "./convertFormat"

const FORMATS: CronFormat[] = ["standard5", "quartz6", "quartz7", "aws6"]

const PLACEHOLDERS: Record<CronFormat, string> = {
  standard5: "0 9 * * 1-5",
  quartz6: "0 0 9 ? * MON-FRI",
  quartz7: "0 0 9 ? * MON-FRI *",
  aws6: "0 9 ? * MON-FRI *",
}

export default function FormatConverter() {
  const [sourceFormat, setSourceFormat] = useState<CronFormat>("standard5")
  const [expression, setExpression] = useState(PLACEHOLDERS.standard5)

  const { results, standardEquivalent, error } = useMemo(
    () => convertCronFormat(expression, sourceFormat),
    [expression, sourceFormat],
  )

  const description = useMemo(() => {
    if (!standardEquivalent) return null
    try {
      return cronstrue.toString(standardEquivalent, { use24HourTimeFormat: false, verbose: true })
    } catch {
      return null
    }
  }, [standardEquivalent])

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta
        title="Quartz ⇄ Standard Cron Converter — 5, 6 & 7-Field Formats | CronParser"
        description="Convert cron expressions between standard 5-field, Quartz 6-field, Quartz 7-field, and AWS EventBridge syntax — including day-of-week numbering and the '?' character. Entirely client-side."
        path="/format-converter"
      />

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Format Converter" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Quartz ⇄ Standard Cron Converter
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Convert a cron expression between standard, Quartz, and AWS EventBridge formats.
        </p>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Source Format</label>
        <div className="flex flex-wrap gap-2">
          {FORMATS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setSourceFormat(f)
                setExpression(PLACEHOLDERS[f])
              }}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                sourceFormat === f
                  ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
              }`}
            >
              {FORMAT_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cron Expression</label>
          {expression && <ClearInputButton onClear={() => setExpression("")} />}
        </div>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder={PLACEHOLDERS[sourceFormat]}
          spellCheck={false}
          className={`w-full rounded-lg border p-3 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:text-gray-100 dark:placeholder:text-gray-500 transition-colors ${
            error
              ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:border-red-700 dark:bg-red-950"
              : "border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900"
          }`}
        />
        {description && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description} (via standard equivalent)</p>
        )}
        {error && <p className="mt-2 font-mono text-xs text-red-500">{error}</p>}
      </div>

      {results.length > 0 && (
        <div className="mb-8 flex flex-col gap-3">
          {results.map((r) => (
            <div key={r.format} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {FORMAT_LABELS[r.format]}
                </p>
                <CopyButton text={r.expression} />
              </div>
              <p className="font-mono text-base text-gray-900 dark:text-gray-100">{r.expression}</p>
              {r.notes.map((note, i) => (
                <p
                  key={i}
                  className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-amber-700 dark:text-amber-400"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {note}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="mb-8">
        <AdSlot />
      </div>

      <ToolSeoSection
        steps={[
          "Choose the format your source expression is written in — Standard 5-field, Quartz 6-field, Quartz 7-field, or AWS EventBridge's 6-field (no seconds, with year).",
          "Paste the expression — the other three formats are generated instantly.",
          "Day-of-week numbering is converted automatically: standard cron's 0-6 (Sun=0) becomes Quartz/AWS's 1-7 (Sun=1), and back.",
          "Watch for the amber warning notes — they flag cases like OR-logic day-of-month/day-of-week combinations that don't translate perfectly between dialects.",
        ]}
        faqs={[
          {
            q: "Why do Quartz and AWS EventBridge need a '?' character?",
            a: "Standard cron resolves day-of-month and day-of-week with OR logic when both are restricted. Quartz-derived formats instead require exactly one of the two fields to be '?' (meaning \"no specific value\"), avoiding that ambiguity by construction.",
          },
          {
            q: "Is AWS EventBridge's 6-field format the same as Quartz's 6-field format?",
            a: "No — this is a common mix-up. Quartz's 6 fields are second, minute, hour, day, month, weekday. AWS EventBridge's 6 fields are minute, hour, day, month, weekday, year — no seconds, but with a year field instead. They're the same field count but a different composition.",
          },
          {
            q: "What happens to a Quartz seconds value when converting to Standard or AWS format?",
            a: "It's dropped, since neither of those formats supports sub-minute scheduling — a warning note appears whenever the source seconds field isn't 0, since that precision is lost in the conversion.",
          },
          {
            q: "Is any data sent to a server?",
            a: "No. All parsing and conversion logic runs entirely in your browser using local JavaScript. Nothing is transmitted anywhere.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "quartz-scheduler", "aws-eventbridge-scheduler"]} />
    </div>
  )
}
