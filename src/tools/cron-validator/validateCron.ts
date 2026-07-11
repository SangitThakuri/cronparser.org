export interface FieldValidation {
  name: string
  value: string
  valid: boolean
  message: string | null
}

export interface CronValidationResult {
  fields: FieldValidation[]
  overallValid: boolean
  errorCount: number
  normalized: string | null
}

const FIELD_DEFS_5 = [
  { name: "Minute", min: 0, max: 59 },
  { name: "Hour", min: 0, max: 23 },
  { name: "Day of Month", min: 1, max: 31 },
  { name: "Month", min: 1, max: 12 },
  { name: "Day of Week", min: 0, max: 7 },
]

const FIELD_DEFS_6 = [{ name: "Second", min: 0, max: 59 }, ...FIELD_DEFS_5]

function validateField(raw: string, min: number, max: number): { valid: boolean; message: string | null } {
  if (!raw) return { valid: false, message: "Empty field" }

  const segments = raw.split(",")
  for (const segment of segments) {
    const [rangePart, stepPart] = segment.split("/")

    if (stepPart !== undefined && (!/^\d+$/.test(stepPart) || Number(stepPart) <= 0)) {
      return { valid: false, message: `Invalid step "${stepPart}" in "${segment}"` }
    }

    if (rangePart === "*" || rangePart === "?") continue

    if (rangePart.includes("-")) {
      const [a, b] = rangePart.split("-")
      const an = Number(a)
      const bn = Number(b)
      if (!Number.isInteger(an) || !Number.isInteger(bn)) {
        return { valid: false, message: `Non-numeric range "${rangePart}"` }
      }
      if (an < min || an > max || bn < min || bn > max) {
        return { valid: false, message: `"${rangePart}" out of range ${min}-${max}` }
      }
      if (an > bn) {
        return { valid: false, message: `Range start greater than end in "${rangePart}"` }
      }
    } else {
      const n = Number(rangePart)
      if (!Number.isInteger(n)) {
        return { valid: false, message: `"${rangePart}" is not a number` }
      }
      if (n < min || n > max) {
        return { valid: false, message: `${n} out of range ${min}-${max}` }
      }
    }
  }

  return { valid: true, message: null }
}

export function validateCron(input: string): CronValidationResult {
  const trimmed = input.trim().replace(/\s+/g, " ")
  if (!trimmed) return { fields: [], overallValid: false, errorCount: 0, normalized: null }

  const parts = trimmed.split(" ")

  if (parts.length !== 5 && parts.length !== 6) {
    return {
      fields: [
        {
          name: "Field Count",
          value: String(parts.length),
          valid: false,
          message: `Expected 5 or 6 space-separated fields, found ${parts.length}`,
        },
      ],
      overallValid: false,
      errorCount: 1,
      normalized: null,
    }
  }

  const defs = parts.length === 6 ? FIELD_DEFS_6 : FIELD_DEFS_5
  const fields: FieldValidation[] = parts.map((value, i) => {
    const def = defs[i]
    const result = validateField(value, def.min, def.max)
    return { name: def.name, value, valid: result.valid, message: result.message }
  })

  const errorCount = fields.filter((f) => !f.valid).length

  return {
    fields,
    overallValid: errorCount === 0,
    errorCount,
    normalized: errorCount === 0 ? parts.join(" ") : null,
  }
}
