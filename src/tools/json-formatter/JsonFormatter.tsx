import { Helmet } from "react-helmet-async"
import { useJsonFormatter } from "./useJsonFormatter"
import { JsonInput } from "./JsonInput"
import { JsonOutput } from "./JsonOutput"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

export default function JsonFormatter() {
  const { state, handleInputChange, handleFormat } = useJsonFormatter()

  return (
    <div className="mx-auto max-w-4xl">
      <Helmet>
        <title>Best Online JSON Formatter &amp; Validator | DevBits</title>
        <meta name="description" content="Format, beautify, and validate raw JSON strings instantly. Detects syntax errors in real-time with line highlighting. 100% private and client-side." />
      </Helmet>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          JSON Formatter & Validator
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Paste, format, and validate your JSON instantly.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <JsonInput
          value={state.input}
          onChange={handleInputChange}
          onFormat={handleFormat}
        />
        <JsonOutput formatted={state.formatted} error={state.error} />
      </div>

      <ToolSeoSection
        howItWorks={[
          "Paste any raw JSON string into the input panel. The formatter parses the text using the browser's native JSON.parse() and re-serializes it with configurable indentation — no data ever leaves your machine.",
          "Syntax errors are caught immediately and highlighted with a precise error message pinpointing the offending line and character position, so you can fix malformed JSON without trial and error.",
        ]}
        faqs={[
          {
            q: "Is my JSON data sent to a server?",
            a: "No. All formatting and validation runs entirely in your browser using JavaScript. Nothing is transmitted over the network.",
          },
          {
            q: "What is the maximum JSON size this tool can handle?",
            a: "There is no hard limit imposed by the tool itself. Performance depends on your browser and device; files up to several megabytes typically process in under a second.",
          },
          {
            q: "Can I validate JSON Schema with this tool?",
            a: "This tool validates JSON syntax (well-formedness) only. It does not validate against a JSON Schema definition.",
          },
          {
            q: "Does it support JSON5 or JSONC (comments)?",
            a: "No. The formatter follows the strict JSON specification (RFC 8259). Comments and trailing commas are flagged as syntax errors.",
          },
        ]}
      />
    </div>
  )
}
