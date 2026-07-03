export interface FormatResult {
  formatted: string | null
  error: string | null
}

export function formatJSON(input: string): FormatResult {
  if (!input.trim()) {
    return { formatted: null, error: null }
  }

  try {
    const parsed = JSON.parse(input)
    const formatted = JSON.stringify(parsed, null, 2)
    return { formatted, error: null }
  } catch (e) {
    const err = e as SyntaxError
    const message = err.message
    return { formatted: null, error: message }
  }
}

export function minifyJSON(input: string): FormatResult {
  if (!input.trim()) {
    return { formatted: null, error: null }
  }

  try {
    const parsed = JSON.parse(input)
    const formatted = JSON.stringify(parsed)
    return { formatted, error: null }
  } catch (e) {
    const err = e as SyntaxError
    const message = err.message
    return { formatted: null, error: message }
  }
}
