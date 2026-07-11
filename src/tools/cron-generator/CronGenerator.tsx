import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Sparkles, XCircle } from "lucide-react"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { ClearInputButton } from "../../components/ui/ClearInputButton"
import { CopyButton } from "../../components/ui/CopyButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { generateCron, EXAMPLE_PHRASES } from "./generateCron"

export default function CronGenerator() {
  const [phrase, setPhrase] = useState("")
  const result = useMemo(() => generateCron(phrase), [phrase])
  const hasContent = phrase.trim().length > 0

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta
        title="Cron Generator — Plain English to Cron Expression | CronParser"
        description="Describe a schedule in plain English — 'every weekday at 9am', 'every 15 minutes' — and get the matching cron expression instantly, entirely client-side."
        path="/generator"
      />

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Cron Generator" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cron Generator</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Describe a schedule in plain English and get the matching cron expression.
        </p>
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Describe your schedule</label>
          {phrase && <ClearInputButton onClear={() => setPhrase("")} />}
        </div>
        <input
          type="text"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          placeholder="e.g. Run every weekday at 9 AM"
          spellCheck={false}
          className="w-full rounded-xl border border-gray-200 bg-white p-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <span className="text-xs text-gray-400 dark:text-gray-500">Try:</span>
        {EXAMPLE_PHRASES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setPhrase(ex)}
            className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
          >
            {ex}
          </button>
        ))}
      </div>

      {hasContent && result && (
        <div className="mb-6 flex items-start gap-4 rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm dark:border-green-800 dark:bg-green-950">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-500">
              {result.explanation}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-mono text-xl font-semibold text-green-800 dark:text-green-200">{result.cron}</p>
              <div className="flex items-center gap-2">
                <CopyButton text={result.cron} />
                <Link
                  to={`/?expr=${encodeURIComponent(result.cron)}`}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Open in Cron Parser
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasContent && !result && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-300">
            Couldn't understand that phrase. Try a pattern like "every weekday at 9 AM" or one of the examples above —
            this generator recognizes a fixed set of common phrasings, not arbitrary free text.
          </p>
        </div>
      )}

      <ToolSeoSection
        steps={[
          "Type a schedule description using natural phrases like \"every weekday at 9 AM\" or \"every 15 minutes.\"",
          "The generator matches your phrase against a set of common scheduling patterns and produces the equivalent cron expression instantly.",
          "Click Open in Cron Parser to verify the translation and preview upcoming run times.",
          "If a phrase isn't recognized, try rewording it closer to one of the example patterns — this runs entirely as pattern matching, not a general-purpose language model.",
        ]}
        faqs={[
          {
            q: "Is this powered by AI?",
            a: "No — it's a rule-based pattern matcher that recognizes common English scheduling phrases and maps them directly to cron syntax. It runs entirely in your browser with no API calls, no server, and no usage limits.",
          },
          {
            q: "What phrasings does it understand?",
            a: "Intervals (\"every N minutes/hours\"), daily/weekday/weekend schedules with an optional time, specific weekdays (\"every Monday at 9am\"), and simple monthly schedules (\"every month on the 15th\"). See the example buttons above for the exact patterns it recognizes.",
          },
          {
            q: "Why didn't it understand my phrase?",
            a: "The generator matches a fixed set of patterns rather than parsing arbitrary English. Complex or ambiguous phrasing (like \"every other Tuesday\" or relative dates) falls outside what standard cron — and this tool — can express.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "cheat-sheet", "examples"]} />
    </div>
  )
}
