import { useState, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { CopyButton } from "../../components/ui/CopyButton"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

// ── Case conversion helpers ───────────────────────────────────────────────────

function tokenize(s: string): string[] {
  return s
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")   // XMLParser → XML Parser
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")         // camelCase → camel Case
    .split(/[^a-zA-Z0-9]+/)
    .filter(w => w.length > 0)
    .map(w => w.toLowerCase())
}

function convertLine(line: string, fn: (words: string[]) => string): string {
  if (!line.trim()) return line
  const words = tokenize(line.trim())
  return words.length > 0 ? fn(words) : line
}

function applyConversion(text: string, fn: (words: string[]) => string): string {
  return text.split("\n").map(line => convertLine(line, fn)).join("\n")
}

const CONVERSIONS = [
  {
    label: "camelCase",
    fn: (ws: string[]) => ws.map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join(""),
  },
  {
    label: "PascalCase",
    fn: (ws: string[]) => ws.map(w => w[0].toUpperCase() + w.slice(1)).join(""),
  },
  {
    label: "snake_case",
    fn: (ws: string[]) => ws.join("_"),
  },
  {
    label: "kebab-case",
    fn: (ws: string[]) => ws.join("-"),
  },
  {
    label: "UPPER_SNAKE",
    fn: (ws: string[]) => ws.join("_").toUpperCase(),
  },
] as const

const CHAR_TRANSFORMS = [
  { label: "UPPERCASE", fn: (t: string) => t.toUpperCase() },
  { label: "lowercase", fn: (t: string) => t.toLowerCase() },
] as const

// ── Stats ─────────────────────────────────────────────────────────────────────

interface Stats {
  chars: number
  charsNoSpaces: number
  words: number
  lines: number
  bytes: number
}

function computeStats(text: string): Stats {
  return {
    chars:        text.length,
    charsNoSpaces: text.replace(/\s/g, "").length,
    words:        text.trim() ? text.trim().split(/\s+/).length : 0,
    lines:        text ? text.split("\n").length : 0,
    bytes:        new TextEncoder().encode(text).length,
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TextInspector() {
  const [text, setText] = useState("")
  const stats = useMemo(() => computeStats(text), [text])

  return (
    <div className="mx-auto max-w-3xl">
      <Helmet>
        <title>Developer Case Converter & Word Counter Utility | DevBits</title>
        <meta
          name="description"
          content="Convert text strings into camelCase, snake_case, or kebab-case instantly. Analyze character metrics, line limits, and word lengths."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Case Converter & Text Inspector
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Transform text case and inspect live character statistics instantly.
        </p>
      </div>

      {/* Textarea */}
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Text</label>
          {text && <CopyButton text={text} />}
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type or paste text here…"
          rows={8}
          className="w-full resize-y rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
        />
      </div>

      {/* Conversion buttons */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Convert
        </p>
        <div className="flex flex-wrap gap-2">
          {CONVERSIONS.map(({ label, fn }) => (
            <button
              key={label}
              type="button"
              onClick={() => setText(prev => applyConversion(prev, fn))}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 font-mono text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
            >
              {label}
            </button>
          ))}
          {CHAR_TRANSFORMS.map(({ label, fn }) => (
            <button
              key={label}
              type="button"
              onClick={() => setText(prev => fn(prev))}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 font-mono text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats panel */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Text Statistics
          </span>
        </div>
        <div className="grid grid-cols-2 divide-y divide-gray-100 dark:divide-gray-800 sm:grid-cols-3 sm:divide-y-0 sm:[&>*:not(:last-child)]:border-r sm:[&>*:not(:last-child)]:border-gray-100 sm:dark:[&>*:not(:last-child)]:border-gray-800">
          <StatCell label="Words" value={stats.words.toLocaleString()} />
          <StatCell label="Characters" value={stats.chars.toLocaleString()} />
          <StatCell label="Without Spaces" value={stats.charsNoSpaces.toLocaleString()} />
          <StatCell label="Lines" value={stats.lines.toLocaleString()} />
          <StatCell label="UTF-8 Bytes" value={stats.bytes.toLocaleString()} />
        </div>
      </div>

      <ToolSeoSection
        steps={[
          "Type or paste your text into the input area. Statistics update in real-time with every keystroke.",
          "Click any conversion button (camelCase, snake_case, kebab-case, etc.) to transform the text in-place. You can chain conversions — press Ctrl+Z to undo.",
          "Word-level conversions (camelCase, PascalCase, snake_case, kebab-case, UPPER_SNAKE) tokenize each line independently on word boundaries, underscores, hyphens, and camelCase transitions.",
          "UPPERCASE and lowercase apply a simple character-level transformation to the entire text without altering its structure.",
        ]}
        faqs={[
          {
            q: "Is any data sent to a server?",
            a: "No. All transformations and statistics run entirely in your browser. Nothing leaves your machine.",
          },
          {
            q: "How does the camelCase tokenizer handle mixed input?",
            a: "The tokenizer splits on non-alphanumeric characters (spaces, underscores, hyphens) and also on camelCase and PascalCase boundaries. For example, 'my_variable', 'MyVariable', and 'my-variable' all produce the same tokens and convert identically.",
          },
          {
            q: "Does it convert multi-line text?",
            a: "Yes. Word-level conversions (camelCase, snake_case, etc.) are applied line-by-line so that each line is treated as an independent identifier. Empty lines are preserved as-is.",
          },
          {
            q: "What does 'UTF-8 Bytes' mean?",
            a: "It shows the number of bytes the text occupies when encoded as UTF-8, which is the standard encoding for web and file I/O. ASCII characters count as 1 byte; emoji and many non-Latin characters count as 2–4 bytes each.",
          },
        ]}
      />
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3">
      <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
      <span className="font-mono text-lg font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </span>
    </div>
  )
}
