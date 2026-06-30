import { Helmet } from "react-helmet-async"
import { useCodec } from "./useCodec"
import { CodecInput } from "./CodecInput"
import { CodecOutput } from "./CodecOutput"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

export default function Codec() {
  const { state, handleInputChange, setType, setMode, hasError } = useCodec()

  return (
    <div className="mx-auto max-w-4xl">
      <Helmet>
        <title>Online Base64 &amp; URL Encoder/Decoder | DevBits</title>
        <meta name="description" content="Instantly encode or decode text strings to and from Base64 or URL safe formats. Lightweight, real-time tool for developers." />
      </Helmet>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Base64 & URL Encoder / Decoder
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Instantly encode or decode Base64 and URL-encoded strings.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setType("base64")}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              state.type === "base64"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            Base64
          </button>
          <button
            type="button"
            onClick={() => setType("url")}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              state.type === "url"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            URL
          </button>
        </div>

        <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setMode("encode")}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              state.mode === "encode"
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
              state.mode === "decode"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            Decode
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CodecInput
          value={state.input}
          hasError={hasError}
          onChange={handleInputChange}
          placeholder={
            state.mode === "encode"
              ? state.type === "base64"
                ? "Enter text to Base64 encode..."
                : "Enter text to URL encode..."
              : state.type === "base64"
                ? "Enter Base64 to decode..."
                : "Enter URL-encoded string to decode..."
          }
        />
        <CodecOutput value={state.output} />
      </div>

      <ToolSeoSection
        steps={[
          "Choose the encoding type — Base64 or URL — using the toggle buttons.",
          "Choose the direction: Encode converts plain text to encoded format; Decode reverses it.",
          "Paste or type your input. The result appears instantly on every keystroke with no button press needed.",
          "Drag a .txt or .json file onto the input area to load its contents automatically.",
        ]}
        faqs={[
          {
            q: "What is the difference between Base64 and URL encoding?",
            a: "Base64 encodes arbitrary bytes into a 64-character ASCII alphabet (A–Z, a–z, 0–9, +, /). URL encoding replaces characters that are illegal in URLs with a % followed by two hexadecimal digits.",
          },
          {
            q: "Is Base64 a form of encryption?",
            a: "No. Base64 is an encoding scheme, not encryption. Encoded strings can be decoded by anyone without a key. Do not use it to hide sensitive data.",
          },
          {
            q: "Is my data sent to a server?",
            a: "No. All encoding and decoding uses the browser's built-in btoa/atob and encodeURIComponent/decodeURIComponent APIs. Nothing leaves your machine.",
          },
          {
            q: "Why does my decoded Base64 output look like garbage?",
            a: "The original data was likely binary (an image, PDF, etc.) rather than plain text. The tool displays raw decoded bytes as UTF-8 text, which may not render correctly for non-text content.",
          },
        ]}
      />
    </div>
  )
}
