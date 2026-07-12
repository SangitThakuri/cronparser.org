import { useCallback, useEffect, useState } from "react"

export interface FavoriteDetail {
  label: string
  category: string
  notes: string
}

const KEY = "cronparser-favorite-details"
const DEFAULT_DETAIL: FavoriteDetail = { label: "", category: "Uncategorized", notes: "" }

function readDetails(): Record<string, FavoriteDetail> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === "object" && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

export function useFavoriteDetails() {
  const [details, setDetails] = useState<Record<string, FavoriteDetail>>(() => readDetails())

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(details))
  }, [details])

  const getDetail = useCallback((cron: string): FavoriteDetail => details[cron] ?? DEFAULT_DETAIL, [details])

  const setDetail = useCallback((cron: string, patch: Partial<FavoriteDetail>) => {
    setDetails((prev) => ({ ...prev, [cron]: { ...(prev[cron] ?? DEFAULT_DETAIL), ...patch } }))
  }, [])

  const removeDetail = useCallback((cron: string) => {
    setDetails((prev) => {
      const next = { ...prev }
      delete next[cron]
      return next
    })
  }, [])

  const importDetail = useCallback((cron: string, detail: Partial<FavoriteDetail>) => {
    setDetails((prev) => ({ ...prev, [cron]: { ...DEFAULT_DETAIL, ...prev[cron], ...detail } }))
  }, [])

  return { details, getDetail, setDetail, removeDetail, importDetail }
}
