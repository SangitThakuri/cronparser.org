const FLAG_OPTIONS = [
  { char: "g", label: "Global (g)" },
  { char: "i", label: "Case-insensitive (i)" },
  { char: "m", label: "Multiline (m)" },
  { char: "s", label: "Dot-all (s)" },
] as const

function toggleFlag(flags: string, char: string): string {
  const set = new Set(flags.split(""))
  if (set.has(char)) set.delete(char)
  else set.add(char)
  return FLAG_OPTIONS.map((f) => f.char)
    .filter((c) => set.has(c))
    .join("")
}

interface RegexInputProps {
  pattern: string
  flags: string
  testText: string
  matchCount: number
  onPatternChange: (value: string) => void
  onFlagsChange: (value: string) => void
  onTestTextChange: (value: string) => void
  regexError: string | null
}

export function RegexInput({
  pattern,
  flags,
  testText,
  matchCount,
  onPatternChange,
  onFlagsChange,
  onTestTextChange,
  regexError,
}: RegexInputProps) {
  const patternClass = regexError
    ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:border-red-700 dark:bg-red-950 dark:focus:border-red-500 dark:focus:ring-red-900"
    : pattern.trim() && !regexError
      ? "border-green-300 bg-white focus:border-green-400 focus:ring-green-100 dark:border-green-700 dark:bg-gray-800 dark:focus:border-green-500 dark:focus:ring-green-900"
      : "border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900"

  const testTextClass =
    testText && matchCount > 0
      ? "border-green-300 bg-white focus:border-green-400 focus:ring-green-100 dark:border-green-700 dark:bg-gray-800 dark:focus:border-green-500 dark:focus:ring-green-900"
      : "border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900"

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Regular Expression
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-gray-400">
            /
          </span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => onPatternChange(e.target.value)}
            placeholder="[a-z]+"
            className={`w-full rounded-lg border py-2 pl-7 pr-3 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:text-gray-100 dark:placeholder:text-gray-500 transition-colors ${patternClass}`}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-sm text-gray-400">
            /
          </span>
        </div>
        {regexError && (
          <p className="mt-1.5 font-mono text-xs text-red-500">{regexError}</p>
        )}

        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
          {FLAG_OPTIONS.map(({ char, label }) => (
            <label
              key={char}
              className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400"
            >
              <input
                type="checkbox"
                checked={flags.includes(char)}
                onChange={() => onFlagsChange(toggleFlag(flags, char))}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-blue-900"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Test Text
        </label>
        <textarea
          value={testText}
          onChange={(e) => onTestTextChange(e.target.value)}
          placeholder="Enter text to test against..."
          rows={6}
          className={`w-full resize-y rounded-lg border p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:text-gray-100 dark:placeholder:text-gray-500 transition-colors ${testTextClass}`}
        />
      </div>
    </div>
  )
}
