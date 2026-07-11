export type FieldMode = "every" | "specific" | "range" | "step"

export interface FieldState {
  mode: FieldMode
  specific: string
  rangeStart: string
  rangeEnd: string
  stepStart: string
  stepValue: string
}

export function defaultFieldState(): FieldState {
  return { mode: "every", specific: "", rangeStart: "", rangeEnd: "", stepStart: "", stepValue: "1" }
}

export function buildFieldExpr(state: FieldState): string {
  switch (state.mode) {
    case "every":
      return "*"
    case "specific":
      return state.specific.trim() || "*"
    case "range":
      return state.rangeStart !== "" && state.rangeEnd !== ""
        ? `${state.rangeStart}-${state.rangeEnd}`
        : "*"
    case "step":
      return `${state.stepStart || "*"}/${state.stepValue || "1"}`
  }
}

export interface FieldConfig {
  key: string
  label: string
  min: number
  max: number
}

export const BUILDER_FIELDS: FieldConfig[] = [
  { key: "minute", label: "Minute", min: 0, max: 59 },
  { key: "hour", label: "Hour", min: 0, max: 23 },
  { key: "day", label: "Day of Month", min: 1, max: 31 },
  { key: "month", label: "Month", min: 1, max: 12 },
  { key: "weekday", label: "Day of Week", min: 0, max: 6 },
]
