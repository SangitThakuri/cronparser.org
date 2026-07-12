import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import cronstrue from "cronstrue"
import { Dice5 } from "lucide-react"
import { AdSlot } from "../../components/ui/AdSlot"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { CopyButton } from "../../components/ui/CopyButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

type Complexity = "simple" | "complex"

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomField(min: number, max: number, complexity: Complexity): string {
  // Weighted so results usually stay readable rather than maximally chaotic.
  const weights: [string, number][] = [
    ["wildcard", complexity === "simple" ? 0.6 : 0.3],
    ["step", 0.2],
    ["range", 0.15],
    ["single", complexity === "simple" ? 0.05 : 0.15],
    ["list", complexity === "simple" ? 0 : 0.2],
  ]

  const roll = Math.random()
  let acc = 0
  let kind = "wildcard"
  for (const [k, w] of weights) {
    acc += w
    if (roll <= acc) {
      kind = k
      break
    }
  }

  switch (kind) {
    case "wildcard":
      return "*"
    case "single":
      return String(randomInt(min, max))
    case "range": {
      const a = randomInt(min, max - 1)
      const b = randomInt(a + 1, max)
      return `${a}-${b}`
    }
    case "step": {
      const range = max - min
      const step = randomInt(2, Math.max(2, Math.min(15, Math.floor(range / 2) || 2)))
      return `*/${step}`
    }
    case "list": {
      const n = randomInt(2, 3)
      const values = new Set<number>()
      while (values.size < n) values.add(randomInt(min, max))
      return [...values].sort((a, b) => a - b).join(",")
    }
    default:
      return "*"
  }
}

function generateRandomCron(sixField: boolean, complexity: Complexity): string {
  const minute = randomField(0, 59, complexity)
  const hour = randomField(0, 23, complexity)
  const dom = randomField(1, 31, complexity)
  const month = randomField(1, 12, complexity)
  const dow = randomField(0, 6, complexity)

  if (!sixField) return `${minute} ${hour} ${dom} ${month} ${dow}`
  const second = randomField(0, 59, complexity)
  return `${second} ${minute} ${hour} ${dom} ${month} ${dow}`
}

export default function Randomizer() {
  const [sixField, setSixField] = useState(false)
  const [complexity, setComplexity] = useState<Complexity>("simple")
  const [expression, setExpression] = useState(() => generateRandomCron(false, "simple"))

  const regenerate = () => setExpression(generateRandomCron(sixField, complexity))

  const { description, error } = useMemo(() => {
    try {
      return {
        description: cronstrue.toString(expression, { use24HourTimeFormat: false, verbose: true }),
        error: null as string | null,
      }
    } catch (e) {
      return { description: null, error: String(e).replace(/^Error:\s*/i, "") }
    }
  }, [expression])

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta
        title="Cron Randomizer — Generate Random Cron Expressions | CronParser"
        description="Generate random, valid cron expressions for testing schedulers, fuzz-testing parsers, or exploring cron syntax — entirely client-side."
        path="/randomizer"
      />

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Cron Randomizer" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cron Randomizer</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Generate random, valid cron expressions — useful for testing schedulers and parsers.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setSixField(false)}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              !sixField
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            5-field
          </button>
          <button
            type="button"
            onClick={() => setSixField(true)}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              sixField
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            6-field
          </button>
        </div>
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setComplexity("simple")}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              complexity === "simple"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            Simple
          </button>
          <button
            type="button"
            onClick={() => setComplexity("complex")}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              complexity === "complex"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            Complex
          </button>
        </div>
        <button
          type="button"
          onClick={regenerate}
          className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
        >
          <Dice5 className="h-4 w-4" />
          Generate
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-mono text-xl font-semibold text-gray-900 dark:text-gray-100">{expression}</p>
          <div className="flex shrink-0 items-center gap-2">
            <CopyButton text={expression} />
            <Link
              to={`/?expr=${encodeURIComponent(expression)}`}
              className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
            >
              Try it
            </Link>
          </div>
        </div>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        {error && (
          <p className="font-mono text-xs text-red-500">
            Generated an expression cronstrue couldn't describe: {error}
          </p>
        )}
      </div>

      <div className="mb-8">
        <AdSlot />
      </div>

      <ToolSeoSection
        steps={[
          "Choose 5-field or 6-field (with a leading seconds field) format.",
          "Choose Simple (mostly wildcards, easy to read) or Complex (more ranges, steps, and lists) for the mix of syntax used.",
          "Click Generate for a fresh random expression, or Try it to open the current one in the Cron Parser.",
          "Useful for fuzz-testing a cron parser you're building, generating varied test fixtures, or just exploring what different field combinations look like.",
        ]}
        faqs={[
          {
            q: "Are the generated expressions guaranteed to be valid?",
            a: "Yes — each field is built from syntactically valid cron constructs (wildcards, ranges, steps, and lists) within that field's correct value range, so every generated expression parses successfully.",
          },
          {
            q: "Can two random expressions ever describe the same schedule?",
            a: "It's possible, though unlikely given the range of field combinations — if you want to verify, paste both into the Compare Expressions tool to check.",
          },
          {
            q: "Why would I want a random cron expression?",
            a: "Common uses include generating test fixtures for a scheduler or parser you're building, stress-testing an expression validator, or just exploring how different field syntax combinations read in plain English.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "validator", "cheat-sheet"]} />
    </div>
  )
}
