import { useCallback, useEffect, useState } from "react"

function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : []
  } catch {
    return []
  }
}

export function useLocalStorageList(key: string, maxItems = 10) {
  const [items, setItems] = useState<string[]>(() => readList(key))

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(items))
  }, [key, items])

  const add = useCallback(
    (value: string) => {
      if (!value.trim()) return
      setItems((prev) => [value, ...prev.filter((v) => v !== value)].slice(0, maxItems))
    },
    [maxItems],
  )

  const remove = useCallback((value: string) => {
    setItems((prev) => prev.filter((v) => v !== value))
  }, [])

  const has = useCallback((value: string) => items.includes(value), [items])

  const clear = useCallback(() => setItems([]), [])

  return { items, add, remove, has, clear }
}
