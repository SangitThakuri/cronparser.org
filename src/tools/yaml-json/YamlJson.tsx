import { useState, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { ArrowLeftRight } from "lucide-react"
import { load as yamlLoad, dump as yamlDump } from "js-yaml"
import { CopyButton } from "../../components/ui/CopyButton"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { useFileDropZone } from "../../hooks/useFileDropZone"
import { CloudUpload, Upload } from "lucide-react"

type Direction = "yaml-to-json" | "json-to-yaml"

function convert(
  input: string,
  direction: Direction,
): { output: string | null; error: string | null } {
  if (!input.trim()) return { output: null, error: null }
  try {
    if (direction === "yaml-to-json") {
      const parsed = yamlLoad(input)
      return { output: JSON.stringify(parsed, null, 2), error: null }
    } else {
      const parsed = JSON.parse(input)
      return { output: yamlDump(parsed, { indent: 2, lineWidth: -1 }), error: null }
    }
  } catch (e) {
    return { output: null, error: (e as Error).message }
  }
}

export default function YamlJson() {
  const [direction, setDirection] = useState<Direction>("yaml-to-json")
  const [input, setInput] = useState("")

  const { output, error } = useMemo(() => convert(input, direction), [input, direction])

  const { isDragging, onDragEnter, onDragLeave, onDragOver, onDrop, onFileInput } =
    useFileDropZone(setInput)

  const inputLabel = direction === "yaml-to-json" ? "YAML" : "JSON"
  const outputLabel = direction === "yaml-to-json" ? "JSON" : "YAML"

  const flipDirection = () => {
    setDirection((d) => (d === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json"))
    setInput("")
  }

  const swapOutputToInput = () => {
    if (output) {
      setDirection((d) => (d === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json"))
      setInput(output)
    }
  }

  const inputBorder = error
    ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950"
    : input.trim() && output
      ? "border-green-300 bg-white dark:border-green-700 dark:bg-gray-800"
      : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"

  return (
    <div className="mx-auto max-w-5xl">
      <Helmet>
        <title>Online YAML to JSON Converter &amp; Vice Versa | DevBits</title>
        <meta
          name="description"
          content="Convert YAML configuration files to clean JSON formatting or vice versa instantly. 100% private client-side conversion tool."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          YAML ⇄ JSON Converter
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Instantly convert between YAML and JSON. 100% client-side — nothing leaves your browser.
        </p>
      </div>

      {/* Direction bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span
          className={`text-sm font-semibold transition-colors ${
            direction === "yaml-to-json"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          YAML
        </span>
        <button
          type="button"
          onClick={flipDirection}
          title="Flip direction"
          className="rounded-lg border border-gray-200 bg-white p-2 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <ArrowLeftRight className="h-4 w-4 text-gray-500" />
        </button>
        <span
          className={`text-sm font-semibold transition-colors ${
            direction === "json-to-yaml"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          JSON
        </span>

        {output && (
          <button
            type="button"
            onClick={swapOutputToInput}
            className="ml-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Swap output → input
          </button>
        )}
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
              {inputLabel} Input
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300">
              <Upload className="h-3.5 w-3.5" />
              Upload file
              <input
                type="file"
                accept=".yaml,.yml,.json,.txt"
                className="sr-only"
                onChange={onFileInput}
              />
            </label>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste ${inputLabel} here…`}
            rows={16}
            className={`w-full resize-y rounded-lg border p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-blue-900 transition-colors ${inputBorder}`}
          />
          {isDragging && (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50/80 dark:bg-blue-950/80">
              <CloudUpload className="h-8 w-8 text-blue-500" />
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Drop .yaml, .yml or .json file
              </p>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {outputLabel} Output
            </label>
            {output && <CopyButton text={output} />}
          </div>

          {error ? (
            <div className="overflow-x-auto rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <p className="font-mono text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : output ? (
            <pre className="min-h-[200px] overflow-x-auto rounded-lg border border-green-200 bg-gray-50 p-4 font-mono text-sm text-gray-900 dark:border-green-800 dark:bg-gray-900 dark:text-gray-100">
              <code>{output}</code>
            </pre>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Output will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      <ToolSeoSection
        steps={[
          "Choose the conversion direction — YAML → JSON or JSON → YAML — using the arrow toggle.",
          "Paste your source text in the left panel, or drag a .yaml, .yml, or .json file onto it.",
          "The converted output appears instantly in the right panel on every keystroke.",
          'Click "Swap output → input" to use the result as the new input for chained conversions.',
        ]}
        faqs={[
          {
            q: "Is any data sent to a server?",
            a: "No. Conversion runs entirely in your browser using the js-yaml library. Your data never leaves your machine.",
          },
          {
            q: "What YAML features are supported?",
            a: "Standard YAML 1.1/1.2 including multi-level nesting, arrays, strings, numbers, booleans, and null values. Anchors and aliases are parsed; custom tags may not round-trip perfectly.",
          },
          {
            q: "What happens with a syntax error?",
            a: "The error message from the parser is shown in the output panel, including the line and column of the problem. Your input is preserved so you can fix and retry.",
          },
          {
            q: "Why does the JSON → YAML output look different from my original YAML?",
            a: "JSON → YAML conversion first parses JSON into a data structure, then serializes it as YAML. Comments and custom formatting in the original YAML are not preserved because JSON has no concept of them.",
          },
        ]}
      />
    </div>
  )
}
