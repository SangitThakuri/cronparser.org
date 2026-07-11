import { useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import cronstrue from "cronstrue"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { CopyButton } from "../../components/ui/CopyButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { getNextCronRuns } from "../../lib/cronNextRuns"
import { FieldCard } from "./FieldCard"
import { BUILDER_FIELDS, buildFieldExpr, defaultFieldState, type FieldState } from "./fieldBuilder"

const formatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

export default function VisualBuilder() {
  const [fields, setFields] = useState<Record<string, FieldState>>(() =>
    Object.fromEntries(BUILDER_FIELDS.map((f) => [f.key, defaultFieldState()])),
  )

  const cron = useMemo(
    () => BUILDER_FIELDS.map((f) => buildFieldExpr(fields[f.key])).join(" "),
    [fields],
  )

  const { description, error } = useMemo(() => {
    try {
      return { description: cronstrue.toString(cron, { use24HourTimeFormat: false, verbose: true }), error: null }
    } catch (e) {
      return { description: null, error: String(e).replace(/^Error:\s*/i, "") }
    }
  }, [cron])

  const { runs } = useMemo(() => (error ? { runs: [] } : getNextCronRuns(cron, 3)), [cron, error])

  const updateField = (key: string, next: FieldState) => setFields((prev) => ({ ...prev, [key]: next }))

  return (
    <div className="mx-auto max-w-4xl">
      <Helmet>
        <title>Visual Cron Builder — Build Cron Expressions Field by Field | CronParser</title>
        <meta
          name="description"
          content="Build a cron expression visually — pick every, specific, range, or step values for each field with a live preview and next-run calculation."
        />
      </Helmet>

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Visual Cron Builder" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Visual Cron Builder</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Build a cron expression field by field, with a live preview as you go.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BUILDER_FIELDS.map((f) => (
          <FieldCard key={f.key} config={f} state={fields[f.key]} onChange={(next) => updateField(f.key, next)} />
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950">
        <p className="font-mono text-xl font-semibold text-blue-800 dark:text-blue-200">{cron}</p>
        <div className="flex items-center gap-2">
          <CopyButton text={cron} />
          <Link
            to={`/?expr=${encodeURIComponent(cron)}`}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Open in Cron Parser
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">{description}</p>
          {runs.length > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Next: {runs.map((r) => formatter.format(r)).join(" · ")}
            </p>
          )}
        </div>
      )}

      <ToolSeoSection
        steps={[
          "For each field, choose Every (any value), Specific (a comma-separated list), Range (from–to), or Step (every N starting from a value).",
          "The composed cron expression updates live at the top, along with its plain-English description.",
          "The next 3 upcoming run times give an immediate sanity check that the schedule does what you expect.",
          "Click Open in Cron Parser for the full result card, next-5-runs panel, and timezone preview.",
        ]}
        faqs={[
          {
            q: "What does 'Step' mean for a field?",
            a: "Step selects every Nth value starting from a chosen point — e.g. Minute field with start=0, step=15 produces */15, matching :00, :15, :30, :45.",
          },
          {
            q: "Can I combine a range and a step, like 9-17/2?",
            a: "Not directly in this builder's UI — it composes one mode per field. For combined range+step expressions, use the Specific mode and type the combined syntax directly (e.g. 9-17/2).",
          },
          {
            q: "Is this the same as the Cron Generator?",
            a: "No — the Generator converts a plain-English sentence into cron syntax. The Visual Builder composes an expression directly from structured field choices, which is more precise for complex schedules.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "cheat-sheet", "examples"]} />
    </div>
  )
}
