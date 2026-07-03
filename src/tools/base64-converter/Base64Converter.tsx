import { useState, useMemo, useCallback } from "react"
import { Helmet } from "react-helmet-async"
import { ImageUp, Download, CloudUpload } from "lucide-react"
import { EncodedInput } from "../../components/ui/EncodedInput"
import { EncodedOutput } from "../../components/ui/EncodedOutput"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { encodeText, decodeText, readFileAsDataUrl, formatBytes, IMAGE_MIME_TYPES } from "./base64"

type Kind = "text" | "image"
type Mode = "encode" | "decode"

function transformText(input: string, mode: Mode): { output: string; hasError: boolean } {
  if (!input) return { output: "", hasError: false }
  try {
    return { output: mode === "encode" ? encodeText(input) : decodeText(input), hasError: false }
  } catch {
    return { output: "", hasError: true }
  }
}

function TextPanel({ mode }: { mode: Mode }) {
  const [input, setInput] = useState("")
  const { output, hasError } = useMemo(() => transformText(input, mode), [input, mode])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <EncodedInput
        value={input}
        hasError={hasError}
        onChange={setInput}
        placeholder={mode === "encode" ? "Enter text to Base64 encode..." : "Enter Base64 to decode..."}
      />
      <EncodedOutput value={output} />
    </div>
  )
}

function ImageEncodePanel() {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [fileSize, setFileSize] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const loadFile = useCallback(async (file: File) => {
    const url = await readFileAsDataUrl(file)
    setDataUrl(url)
    setFileName(file.name)
    setFileSize(file.size)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragEnter={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          const file = e.dataTransfer.files[0]
          if (file) void loadFile(file)
        }}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-blue-400 bg-blue-50/80 dark:bg-blue-950/80"
            : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
        }`}
      >
        <CloudUpload className="h-8 w-8 text-gray-300 dark:text-gray-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Drag an image here, or{" "}
          <label className="cursor-pointer font-medium text-blue-600 hover:underline dark:text-blue-400">
            browse
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void loadFile(file)
                e.target.value = ""
              }}
            />
          </label>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPEG, GIF, WEBP, SVG</p>
      </div>

      {dataUrl && (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <img
              src={dataUrl}
              alt={fileName}
              className="h-20 w-20 shrink-0 rounded-md border border-gray-200 object-contain dark:border-gray-700"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{fileName}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatBytes(fileSize)} → {formatBytes(dataUrl.length)} encoded
              </p>
            </div>
          </div>
          <EncodedOutput value={dataUrl} label="Base64 Data URI" />
        </div>
      )}
    </div>
  )
}

function ImageDecodePanel() {
  const [input, setInput] = useState("")
  const [mimeType, setMimeType] = useState<(typeof IMAGE_MIME_TYPES)[number]>("image/png")
  const [loadError, setLoadError] = useState(false)

  const src = useMemo(() => {
    const trimmed = input.trim()
    if (!trimmed) return ""
    if (trimmed.startsWith("data:")) return trimmed
    return `data:${mimeType};base64,${trimmed.replace(/\s+/g, "")}`
  }, [input, mimeType])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Base64 String or Data URI
          </label>
          <select
            value={mimeType}
            onChange={(e) => setMimeType(e.target.value as (typeof IMAGE_MIME_TYPES)[number])}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            {IMAGE_MIME_TYPES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setLoadError(false)
          }}
          placeholder="Paste a raw Base64 string or a data:image/...;base64,... URI"
          rows={6}
          className="w-full resize-y rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
        />
      </div>

      {src && !loadError && (
        <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <img
            src={src}
            alt="Decoded preview"
            onError={() => setLoadError(true)}
            className="h-24 w-24 shrink-0 rounded-md border border-gray-200 object-contain dark:border-gray-700"
          />
          <a
            href={src}
            download="decoded-image"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
          >
            <Download className="h-4 w-4" />
            Download Image
          </a>
        </div>
      )}

      {src && loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          Couldn't render this as an image — check that the Base64 string is complete and the MIME type is correct.
        </div>
      )}
    </div>
  )
}

export default function Base64Converter() {
  const [kind, setKind] = useState<Kind>("text")
  const [mode, setMode] = useState<Mode>("encode")

  return (
    <div className="mx-auto max-w-4xl">
      <Helmet>
        <title>Base64 Encoder &amp; Decoder — Text and Image to Base64 | CronParser</title>
        <meta
          name="description"
          content="Encode or decode Base64 strings and images instantly. Convert images to Base64 data URIs or decode Base64 back into a downloadable image — entirely client-side."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Base64 Encoder / Decoder
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Convert text or images to and from Base64 instantly.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setKind("text")}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              kind === "text"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            Text
          </button>
          <button
            type="button"
            onClick={() => setKind("image")}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              kind === "image"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            <ImageUp className="h-3.5 w-3.5" />
            Image
          </button>
        </div>

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

      {kind === "text" && <TextPanel mode={mode} />}
      {kind === "image" && (mode === "encode" ? <ImageEncodePanel /> : <ImageDecodePanel />)}

      <ToolSeoSection
        steps={[
          "Choose Text to encode/decode plain strings, or Image to convert image files to and from Base64.",
          "In Text mode, paste or type your input — the result updates instantly using UTF-8 safe encoding.",
          "In Image mode, drag and drop or browse for an image to get its Base64 data URI, or paste a Base64 string / data URI to preview and download it as an image.",
          "Copy any result with the Copy button, or download decoded images directly.",
        ]}
        faqs={[
          {
            q: "Is Base64 encoding the same as encryption?",
            a: "No. Base64 is a reversible encoding scheme, not encryption. Anyone can decode a Base64 string without a key — do not use it to protect sensitive data.",
          },
          {
            q: "Why convert an image to Base64?",
            a: "A Base64 data URI lets you embed an image directly inside HTML, CSS, or JSON without a separate file request — common for small icons, email templates, and inline SVGs.",
          },
          {
            q: "Does text encoding handle emoji and non-Latin characters?",
            a: "Yes. Text mode uses UTF-8 safe encoding, so emoji, accented characters, and non-Latin scripts round-trip correctly instead of throwing an error.",
          },
          {
            q: "Is my data sent to a server?",
            a: "No. All encoding, decoding, and image processing happens entirely in your browser using native JavaScript and the FileReader API. Nothing is uploaded anywhere.",
          },
        ]}
      />
    </div>
  )
}
