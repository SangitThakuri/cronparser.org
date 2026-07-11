import type { FieldConfig, FieldMode, FieldState } from "./fieldBuilder"

const MODES: { value: FieldMode; label: string }[] = [
  { value: "every", label: "Every" },
  { value: "specific", label: "Specific" },
  { value: "range", label: "Range" },
  { value: "step", label: "Step" },
]

interface FieldCardProps {
  config: FieldConfig
  state: FieldState
  onChange: (next: FieldState) => void
}

export function FieldCard({ config, state, onChange }: FieldCardProps) {
  const inputClass =
    "w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm font-mono text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-900"

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{config.label}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {config.min}–{config.max}
        </span>
      </div>

      <div className="mb-3 flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange({ ...state, mode: m.value })}
            className={`flex-1 cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              state.mode === m.value
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {state.mode === "specific" && (
        <input
          type="text"
          value={state.specific}
          onChange={(e) => onChange({ ...state, specific: e.target.value })}
          placeholder={`e.g. ${config.min},${config.min + 1}`}
          className={inputClass}
        />
      )}

      {state.mode === "range" && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={state.rangeStart}
            onChange={(e) => onChange({ ...state, rangeStart: e.target.value })}
            placeholder="from"
            min={config.min}
            max={config.max}
            className={inputClass}
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            value={state.rangeEnd}
            onChange={(e) => onChange({ ...state, rangeEnd: e.target.value })}
            placeholder="to"
            min={config.min}
            max={config.max}
            className={inputClass}
          />
        </div>
      )}

      {state.mode === "step" && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={state.stepStart}
            onChange={(e) => onChange({ ...state, stepStart: e.target.value })}
            placeholder="start (blank = any)"
            min={config.min}
            max={config.max}
            className={inputClass}
          />
          <span className="shrink-0 text-xs text-gray-400">every</span>
          <input
            type="number"
            value={state.stepValue}
            onChange={(e) => onChange({ ...state, stepValue: e.target.value })}
            placeholder="N"
            min={1}
            className={inputClass}
          />
        </div>
      )}

      {state.mode === "every" && (
        <p className="text-xs text-gray-400 dark:text-gray-500">Matches any {config.label.toLowerCase()}.</p>
      )}
    </div>
  )
}
