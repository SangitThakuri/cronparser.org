import { useState, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { EncodedInput } from "../../components/ui/EncodedInput"
import { EncodedOutput } from "../../components/ui/EncodedOutput"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

type Mode = "encode" | "decode"

function transform(input: string, mode: Mode): { output: string; hasError: boolean } {
  if (!input) return { output: "", hasError: false }
  try {
    return { output: mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input), hasError: false }
  } catch {
    return { output: "", hasError: true }
  }
}

export default function UrlEncoder() {
  const [input, setInput] = useState("")
  const [mode, setMode] = useState<Mode>("encode")

  const { output, hasError } = useMemo(() => transform(input, mode), [input, mode])

  return (
    <div className="mx-auto max-w-4xl">
      <Helmet>
        <title>URL Encoder / Decoder Online — Percent-Encode Strings | CronParser</title>
        <meta
          name="description"
          content="Encode or decode URL strings and query parameters instantly. Converts reserved characters to percent-encoding and back — 100% client-side, nothing leaves your browser."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          URL Encoder / Decoder
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Percent-encode or decode URL strings and query parameters instantly.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setMode("encode")}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === "encode"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            Encode
          </button>
          <button
            type="button"
            onClick={() => setMode("decode")}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === "decode"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            Decode
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <EncodedInput
          value={input}
          hasError={hasError}
          onChange={setInput}
          placeholder={
            mode === "encode" ? "Enter text or a URL to encode..." : "Enter a percent-encoded URL to decode..."
          }
        />
        <EncodedOutput value={output} />
      </div>

      <ToolSeoSection
        steps={[
          "Choose Encode to convert plain text into a percent-encoded, URL-safe string, or Decode to reverse it.",
          "Paste or type your input — the result updates instantly on every keystroke, no button press needed.",
          "Drag a .txt or .json file onto the input area to load its contents automatically.",
          "Copy the result with the Copy button next to the output.",
        ]}
        faqs={[
          {
            q: "What characters does URL encoding replace?",
            a: "Reserved and unsafe characters (spaces, &, ?, #, /, =, and non-ASCII characters) are replaced with a % followed by their two-digit hexadecimal code. Letters, digits, and -_.~ are left unchanged.",
          },
          {
            q: "What's the difference between encodeURIComponent and encodeURI?",
            a: "This tool uses encodeURIComponent, which encodes every reserved character — the correct choice for encoding a single query parameter value or path segment, not a full URL with its own scheme and slashes.",
          },
          {
            q: "Is my data sent to a server?",
            a: "No. Encoding and decoding use the browser's built-in encodeURIComponent/decodeURIComponent APIs. Nothing leaves your machine.",
          },
          {
            q: "Why does decoding fail with an error?",
            a: "The input contains a malformed percent-escape sequence (like a lone % not followed by two hex digits), which isn't valid URL encoding.",
          },
        ]}
      />
    </div>
  )
}
