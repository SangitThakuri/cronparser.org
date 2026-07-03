import { useState, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { CopyButton } from "../../components/ui/CopyButton"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import {
  parseHex,
  toHexString,
  toHex8String,
  toRgbString,
  toRgbaString,
  toHslString,
  toHslaString,
} from "./colorConvert"

const DEFAULT_HEX = "#3B82F6"

export default function ColorConverter() {
  const [hexInput, setHexInput] = useState(DEFAULT_HEX)
  const [alpha, setAlpha] = useState(100)

  const parsed = useMemo(() => parseHex(hexInput), [hexInput])
  const color = parsed ? { ...parsed, a: alpha / 100 } : null

  const pickerValue = parsed ? toHexString(parsed) : "#000000"

  return (
    <div className="mx-auto max-w-3xl">
      <Helmet>
        <title>Hex to RGB, RGBA &amp; HSL Color Converter | CronParser</title>
        <meta
          name="description"
          content="Convert hex color codes to RGB, RGBA, and HSL instantly with a live interactive color picker and preview. Free, client-side color converter for developers and designers."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Hex ⇄ RGB / RGBA / HSL Color Converter
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Convert between hex, RGB, RGBA, and HSL color formats interactively.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={pickerValue}
            onChange={(e) => setHexInput(e.target.value)}
            className="h-14 w-14 shrink-0 cursor-pointer rounded-lg border border-gray-200 bg-transparent p-0 dark:border-gray-700"
            style={{ colorScheme: "normal" }}
            aria-label="Pick a color"
          />
          <div
            className="h-14 w-14 shrink-0 rounded-lg border border-gray-200 dark:border-gray-700"
            style={{
              backgroundImage:
                "repeating-conic-gradient(#d1d5db 0% 25%, transparent 0% 50%) 0 0 / 12px 12px",
            }}
          >
            <div
              className="h-full w-full rounded-lg"
              style={{ backgroundColor: color ? toRgbaString(color) : "transparent" }}
            />
          </div>
        </div>

        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Hex Color
          </label>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            placeholder="#3B82F6"
            spellCheck={false}
            className={`w-full rounded-lg border p-2.5 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:text-gray-100 dark:placeholder:text-gray-500 transition-colors ${
              parsed
                ? "border-green-300 bg-white focus:border-green-400 focus:ring-green-100 dark:border-green-700 dark:bg-gray-800 dark:focus:border-green-500 dark:focus:ring-green-900"
                : "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:border-red-700 dark:bg-red-950 dark:focus:border-red-500 dark:focus:ring-red-900"
            }`}
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Alpha</label>
          <span className="font-mono text-sm text-gray-500 dark:text-gray-400">{alpha}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={alpha}
          onChange={(e) => setAlpha(Number(e.target.value))}
          className="w-full cursor-pointer accent-blue-600"
        />
      </div>

      {!parsed && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          Enter a valid 3, 4, 6, or 8-digit hex color (e.g. #3B82F6 or #38F).
        </div>
      )}

      {color && (
        <div className="grid gap-3 sm:grid-cols-2">
          <OutputRow label="HEX" value={toHexString(color)} />
          <OutputRow label="HEX (with alpha)" value={toHex8String(color)} />
          <OutputRow label="RGB" value={toRgbString(color)} />
          <OutputRow label="RGBA" value={toRgbaString(color)} />
          <OutputRow label="HSL" value={toHslString(color)} />
          <OutputRow label="HSLA" value={toHslaString(color)} />
        </div>
      )}

      <ToolSeoSection
        steps={[
          "Use the color picker or type a hex code directly — 3, 4, 6, and 8-digit hex formats are all supported.",
          "Drag the Alpha slider to adjust transparency; it's reflected instantly in the RGBA, HSLA, and 8-digit hex outputs.",
          "Every format (HEX, RGB, RGBA, HSL, HSLA) updates live and has its own Copy button.",
          "The checkered preview swatch shows exactly how the color renders with its current alpha value.",
        ]}
        faqs={[
          {
            q: "What's the difference between RGB and HSL?",
            a: "RGB defines a color by red, green, and blue channel intensities (0–255 each). HSL defines it by hue (0–360°), saturation, and lightness (0–100% each) — often more intuitive for adjusting a color's shade or brightness.",
          },
          {
            q: "What do 3-digit and 4-digit hex codes mean?",
            a: "They're shorthand where each digit is duplicated — #38F expands to #3388FF. A 4-digit hex (#38F8) adds a shorthand alpha channel the same way an 8-digit hex does.",
          },
          {
            q: "Is any data sent to a server?",
            a: "No. All color parsing and conversion math runs entirely in your browser with plain JavaScript. Nothing is transmitted anywhere.",
          },
        ]}
      />
    </div>
  )
}

function OutputRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className="truncate font-mono text-sm text-gray-900 dark:text-gray-100">{value}</p>
      </div>
      <CopyButton text={value} />
    </div>
  )
}
