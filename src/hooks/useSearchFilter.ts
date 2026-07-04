import { useMemo, useState } from "react"
import type { RegistryEntry } from "../registry/types"

export function filterTools(items: RegistryEntry[], query: string): RegistryEntry[] {
  if (!query.trim()) return items
  const q = query.toLowerCase().trim()
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q),
  )
}

export function useSearchFilter(items: RegistryEntry[]) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => filterTools(items, query), [items, query])

  return { query, setQuery, filtered }
}
