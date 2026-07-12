import { useEffect, useRef, useState } from "react"
import { Download, History, Star, Trash2, Upload } from "lucide-react"
import { useLocalStorageList } from "../../hooks/useLocalStorageList"

interface HistoryPanelProps {
  currentExpression: string
  isValid: boolean
  onSelect: (cron: string) => void
}

type Tab = "recent" | "favorites"

export function HistoryPanel({ currentExpression, isValid, onSelect }: HistoryPanelProps) {
  const [tab, setTab] = useState<Tab>("recent")
  const recent = useLocalStorageList("cronparser-recent", 8)
  const favorites = useLocalStorageList("cronparser-favorites", 50)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Record a valid expression to recent history once the user pauses typing.
  useEffect(() => {
    if (!isValid) return
    const trimmed = currentExpression.trim()
    if (!trimmed) return
    const timeout = setTimeout(() => recent.add(trimmed), 1500)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, currentExpression])

  const isFavorited = currentExpression.trim() ? favorites.has(currentExpression.trim()) : false
  const active = tab === "recent" ? recent : favorites

  const handleExport = () => {
    const payload = { favorites: favorites.items, recent: recent.items }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cronparser-expressions.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        const importedFavorites = Array.isArray(parsed.favorites) ? parsed.favorites : []
        const importedRecent = Array.isArray(parsed.recent) ? parsed.recent : []
        for (const cron of importedFavorites) if (typeof cron === "string") favorites.add(cron)
        for (const cron of importedRecent) if (typeof cron === "string") recent.add(cron)
      } catch {
        // Silently ignore malformed import files — nothing to recover from client-side.
      }
    }
    reader.readAsText(file)
  }

  if (recent.items.length === 0 && favorites.items.length === 0 && !isValid) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setTab("recent")}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              tab === "recent"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            Recent
          </button>
          <button
            type="button"
            onClick={() => setTab("favorites")}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              tab === "favorites"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            <Star className="h-3.5 w-3.5" />
            Favorites
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isValid && currentExpression.trim() && (
            <button
              type="button"
              onClick={() =>
                isFavorited ? favorites.remove(currentExpression.trim()) : favorites.add(currentExpression.trim())
              }
              className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                isFavorited
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-gray-400 hover:text-amber-500 dark:text-gray-500 dark:hover:text-amber-400"
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${isFavorited ? "fill-current" : ""}`} />
              {isFavorited ? "Saved" : "Save"}
            </button>
          )}
          {active.items.length > 0 && (
            <button
              type="button"
              onClick={active.clear}
              className="cursor-pointer rounded-md p-1 text-gray-400 transition-colors hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
              aria-label={`Clear ${tab}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <div className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700" />
          {(recent.items.length > 0 || favorites.items.length > 0) && (
            <button
              type="button"
              onClick={handleExport}
              className="cursor-pointer rounded-md p-1 text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
              aria-label="Export favorites and recent as JSON"
              title="Export as JSON"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-md p-1 text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
            aria-label="Import expressions from JSON"
            title="Import from JSON"
          >
            <Upload className="h-3.5 w-3.5" />
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="sr-only" onChange={handleImportFile} />
        </div>
      </div>

      <div className="p-2">
        {active.items.length === 0 ? (
          <p className="px-2 py-3 text-center text-xs text-gray-400 dark:text-gray-500">
            {tab === "recent" ? "Expressions you parse will show up here." : "Star an expression to save it here."}
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {active.items.map((cron) => (
              <div
                key={cron}
                className="group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <button
                  type="button"
                  onClick={() => onSelect(cron)}
                  className="min-w-0 flex-1 cursor-pointer truncate text-left font-mono text-sm text-gray-700 dark:text-gray-300"
                >
                  {cron}
                </button>
                <button
                  type="button"
                  onClick={() => active.remove(cron)}
                  className="cursor-pointer p-1 text-gray-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 dark:text-gray-600"
                  aria-label="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
