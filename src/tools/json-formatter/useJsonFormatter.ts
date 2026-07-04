import { useState, useCallback } from "react"
import { formatJSON } from "../../lib/json"
import type { JsonFormatterState } from "./types"

export function useJsonFormatter() {
  const [state, setState] = useState<JsonFormatterState>({
    input: "",
    formatted: null,
    error: null,
  })

  const handleInputChange = useCallback((value: string) => {
    setState((prev) => ({ ...prev, input: value }))
  }, [])

  const handleFormat = useCallback(() => {
    const result = formatJSON(state.input)
    setState((prev) => ({
      ...prev,
      formatted: result.formatted,
      error: result.error,
    }))
  }, [state.input])

  const handleClear = useCallback(() => {
    setState({ input: "", formatted: null, error: null })
  }, [])

  return {
    state,
    handleInputChange,
    handleFormat,
    handleClear,
  }
}
