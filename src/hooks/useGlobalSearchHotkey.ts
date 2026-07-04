import { useEffect } from "react"
import type { RefObject } from "react"

export function useGlobalSearchHotkey(inputRef: RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return

      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      const isEditable =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable
      if (isEditable) return

      e.preventDefault()
      inputRef.current?.focus()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [inputRef])
}
