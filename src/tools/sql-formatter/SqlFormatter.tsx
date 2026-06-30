import { useState, useCallback } from "react"
import { Helmet } from "react-helmet-async"
import { format } from "sql-formatter"
import { CloudUpload, Upload } from "lucide-react"
import { CopyButton } from "../../components/ui/CopyButton"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { useFileDropZone } from "../../hooks/useFileDropZone"

type IndentSize = 2 | 4

interface State {
  input: string
  output: string | null
  error: string | null
  indent: IndentSize
  uppercase: boolean
}

function runFormat(
  input: string,
  indent: IndentSize,
  uppercase: boolean,
): { output: string | null; error: string | null } {
  if (!input.trim()) return { output: null, error: null }
  try {
    const output = format(input, {
      tabWidth: indent,
      keywordCase: uppercase ? "upper" : "preserve",
      linesBetweenQueries: 1,
    })
    return { output, error: null }
  } catch (e) {
    return { output: null, error: (e as Error).message }
  }
}

export default function SqlFormatter() {
  const [state, setState] = useState<State>({
    input: "",
    output: null,
    error: null,
    indent: 2,
    uppercase: true,
  })

  const setInput = useCallback(
    (input: string) => setState((prev) => ({ ...prev, input })),
    [],
  )

  const handleFormat = useCallback(() => {
    const { output, error } = runFormat(state.input, state.indent, state.uppercase)
    setState((prev) => ({ ...prev, output, error }))
  }, [state.input, state.indent, state.uppercase])

  const { isDragging, onDragEnter, onDragLeave, onDragOver, onDrop, onFileInput } =
    useFileDropZone(setInput)

  const textareaClass =
    state.error
      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:border-red-700 dark:bg-red-950 dark:focus:border-red-500 dark:focus:ring-red-900"
      : state.output
        ? "border-green-300 bg-white focus:border-green-400 focus:ring-green-100 dark:border-green-700 dark:bg-gray-800 dark:focus:border-green-500 dark:focus:ring-green-900"
        : "border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900"

  return (
    <div className="mx-auto max-w-4xl">
      <Helmet>
        <title>SQL Formatter, Beautifier &amp; Pretty Printer | DevBits</title>
        <meta
          name="description"
          content="Clean up, format, and indent messy SQL code structures. Auto-uppercase syntax keywords for readability."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          SQL Formatter & Beautifier
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Pretty-print messy SQL with keyword casing and indentation options.
        </p>
      </div>

      {/* Options bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          {([2, 4] as IndentSize[]).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setState((prev) => ({ ...prev, indent: n }))}
              className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                state.indent === n
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              {n} spaces
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setState((prev) => ({ ...prev, uppercase: !prev.uppercase }))}
          className={`cursor-pointer rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors ${
            state.uppercase
              ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          UPPERCASE keywords
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <div
          className="relative flex flex-col gap-3"
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              SQL Input
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300">
              <Upload className="h-3.5 w-3.5" />
              Upload .sql
              <input
                type="file"
                accept=".sql,.txt"
                className="sr-only"
                onChange={onFileInput}
              />
            </label>
          </div>
          <textarea
            value={state.input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your SQL query here…"
            rows={14}
            className={`w-full resize-y rounded-lg border p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:text-gray-100 dark:placeholder:text-gray-500 transition-colors ${textareaClass}`}
          />
          <button
            type="button"
            onClick={handleFormat}
            className="self-start cursor-pointer rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
          >
            Format SQL
          </button>
          {isDragging && (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50/80 dark:bg-blue-950/80">
              <CloudUpload className="h-8 w-8 text-blue-500" />
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Drop .sql or .txt file
              </p>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Formatted Output
            </label>
            {state.output && <CopyButton text={state.output} />}
          </div>
          {state.error ? (
            <div className="overflow-x-auto rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <p className="font-mono text-sm text-red-600 dark:text-red-400">{state.error}</p>
            </div>
          ) : state.output ? (
            <pre className="overflow-x-auto rounded-lg border border-green-200 bg-gray-50 p-4 font-mono text-sm text-gray-900 dark:border-green-800 dark:bg-gray-900 dark:text-gray-100">
              <code>{state.output}</code>
            </pre>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Paste SQL and click Format
              </p>
            </div>
          )}
        </div>
      </div>

      <ToolSeoSection
        steps={[
          "Paste a messy or minified SQL query into the input panel, or drag a .sql file onto it.",
          "Choose indentation — 2 or 4 spaces — using the toggle.",
          'Enable "UPPERCASE keywords" to automatically capitalize SELECT, FROM, WHERE, JOIN, and other SQL keywords.',
          'Click "Format SQL". The output appears with a green border and a Copy button.',
        ]}
        faqs={[
          {
            q: "Is my SQL query sent to a server?",
            a: "No. All formatting is performed in your browser using the sql-formatter library. Your query never leaves your machine.",
          },
          {
            q: "Which SQL dialects are supported?",
            a: "The formatter uses standard SQL mode, compatible with most common syntax including SELECT, INSERT, UPDATE, DELETE, JOINs, subqueries, and CTEs. MySQL, PostgreSQL, and SQLite syntax are handled gracefully.",
          },
          {
            q: "Does this tool execute or validate my SQL?",
            a: "No. The tool only reformats whitespace and casing. It does not connect to a database or verify that the query would run successfully.",
          },
          {
            q: "Can I format multiple statements at once?",
            a: "Yes. Paste multiple SQL statements separated by semicolons. The formatter will separate them with a blank line between each statement.",
          },
        ]}
      />
    </div>
  )
}
