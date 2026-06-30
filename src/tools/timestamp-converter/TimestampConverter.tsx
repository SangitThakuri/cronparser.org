import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { CopyButton } from "../../components/ui/CopyButton"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

function pad(n: number, w = 2): string {
  return String(n).padStart(w, "0")
}

function localStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function utcStr(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`
}

interface Formats {
  unix: string
  unixMs: string
  iso8601: string
  utc: string
  local: string
  rfc2822: string
}

function toFormats(d: Date): Formats {
  return {
    unix: String(Math.floor(d.getTime() / 1000)),
    unixMs: String(d.getTime()),
    iso8601: d.toISOString(),
    utc: utcStr(d),
    local: localStr(d),
    rfc2822: d.toUTCString(),
  }
}

const OUTPUT_ROWS: { label: string; key: keyof Formats }[] = [
  { label: "Unix (seconds)", key: "unix" },
  { label: "Unix (milliseconds)", key: "unixMs" },
  { label: "ISO 8601", key: "iso8601" },
  { label: "UTC", key: "utc" },
  { label: "Local Time", key: "local" },
  { label: "RFC 2822", key: "rfc2822" },
]

export default function TimestampConverter() {
  const [tick, setTick] = useState(() => new Date())
  const [tsInput, setTsInput] = useState("")
  const [dateInput, setDateInput] = useState("")
  const [tsError, setTsError] = useState("")
  const [dateError, setDateError] = useState("")
  const [formats, setFormats] = useState<Formats>(() => toFormats(new Date()))

  useEffect(() => {
    const id = setInterval(() => {
      setTick(new Date())
      // Only auto-update if no custom input is active
      if (!tsInput && !dateInput) setFormats(toFormats(new Date()))
    }, 1000)
    return () => clearInterval(id)
  }, [tsInput, dateInput])

  function handleTsChange(val: string) {
    setTsInput(val)
    setDateInput("")
    setTsError("")
    if (!val.trim()) {
      setFormats(toFormats(new Date()))
      return
    }
    const n = Number(val.trim())
    if (isNaN(n) || !Number.isFinite(n)) {
      setTsError("Must be a numeric timestamp")
      return
    }
    // Auto-detect ms vs seconds: values > 1e12 are treated as milliseconds
    const d = n > 1e12 ? new Date(n) : new Date(n * 1000)
    if (isNaN(d.getTime())) {
      setTsError("Invalid timestamp value")
      return
    }
    setFormats(toFormats(d))
  }

  function handleDateChange(val: string) {
    setDateInput(val)
    setTsInput("")
    setDateError("")
    if (!val.trim()) {
      setFormats(toFormats(new Date()))
      return
    }
    const d = new Date(val)
    if (isNaN(d.getTime())) {
      setDateError("Unrecognised date format")
      return
    }
    setFormats(toFormats(d))
  }

  const nowUnix = Math.floor(tick.getTime() / 1000)

  return (
    <div className="mx-auto max-w-2xl">
      <Helmet>
        <title>Timestamp & Date Converter — Unix Epoch to ISO 8601 | DevBits</title>
        <meta
          name="description"
          content="Convert Unix timestamps to human-readable dates and back. Supports epoch seconds, milliseconds, ISO 8601, UTC, local time, and RFC 2822 formats."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Timestamp Converter
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Convert Unix timestamps to dates and vice versa. Live clock updates every second.
        </p>
      </div>

      {/* Live clock */}
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/40">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400">
          Current Time
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <span className="font-mono text-sm font-medium text-blue-800 dark:text-blue-200">
            Unix: {nowUnix}
          </span>
          <span className="font-mono text-sm font-medium text-blue-800 dark:text-blue-200">
            {tick.toISOString()}
          </span>
        </div>
      </div>

      {/* Inputs */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Unix Timestamp
          </label>
          <input
            type="text"
            value={tsInput}
            onChange={(e) => handleTsChange(e.target.value)}
            placeholder={String(nowUnix)}
            className={`rounded-lg border px-4 py-2.5 font-mono text-sm text-gray-900 focus:outline-none focus:ring-2 transition-colors dark:text-gray-100 ${
              tsError
                ? "border-red-400 bg-white focus:border-red-400 focus:ring-red-100 dark:border-red-600 dark:bg-gray-800 dark:focus:ring-red-900"
                : "border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900"
            }`}
          />
          {tsError && (
            <p className="text-xs text-red-600 dark:text-red-400">{tsError}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Date / Time String
          </label>
          <input
            type="text"
            value={dateInput}
            onChange={(e) => handleDateChange(e.target.value)}
            placeholder="2024-01-15 09:30:00"
            className={`rounded-lg border px-4 py-2.5 font-mono text-sm text-gray-900 focus:outline-none focus:ring-2 transition-colors dark:text-gray-100 ${
              dateError
                ? "border-red-400 bg-white focus:border-red-400 focus:ring-red-100 dark:border-red-600 dark:bg-gray-800 dark:focus:ring-red-900"
                : "border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900"
            }`}
          />
          {dateError && (
            <p className="text-xs text-red-600 dark:text-red-400">{dateError}</p>
          )}
        </div>
      </div>

      {/* Output rows */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        {OUTPUT_ROWS.map(({ label, key }, i) => (
          <div
            key={key}
            className={`flex items-center justify-between gap-4 px-4 py-3 ${
              i % 2 === 0
                ? "bg-white dark:bg-gray-900"
                : "bg-gray-50 dark:bg-gray-800/50"
            }`}
          >
            <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">
              {label}
            </span>
            <div className="flex min-w-0 items-center gap-2">
              <span className="break-all font-mono text-sm text-gray-900 dark:text-gray-100">
                {formats[key]}
              </span>
              <div className="shrink-0">
                <CopyButton text={formats[key]} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <ToolSeoSection
        steps={[
          "The live clock at the top shows the current Unix timestamp and ISO 8601 time, updated every second.",
          "Enter a Unix timestamp (seconds or milliseconds — auto-detected by magnitude) in the left input.",
          "Enter a date string in the right input (e.g. '2024-01-15' or '2024-01-15T09:30:00Z') to convert it.",
          "Copy any format using the copy icon next to each row.",
        ]}
        faqs={[
          {
            q: "What is a Unix timestamp?",
            a: "A Unix timestamp is the number of seconds elapsed since January 1, 1970 00:00:00 UTC (the Unix epoch). It is timezone-independent and widely used in databases, APIs, and logging systems.",
          },
          {
            q: "How are seconds vs. milliseconds auto-detected?",
            a: "If the entered value is greater than 10¹², it is treated as milliseconds; otherwise it is treated as seconds. This works for all dates from 1970 through approximately year 2286.",
          },
          {
            q: "What date formats can I enter?",
            a: "Any format parseable by the browser's Date constructor: ISO 8601 (2024-01-15T09:30:00Z), date-only (2024-01-15), RFC 2822, or locale strings like 'January 15, 2024'.",
          },
        ]}
      />
    </div>
  )
}
