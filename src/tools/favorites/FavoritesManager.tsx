import { useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import cronstrue from "cronstrue"
import { FileJson, FileSpreadsheet, FileText, Plus, Search, Star, Trash2, Upload } from "lucide-react"
import { AdSlot } from "../../components/ui/AdSlot"
import { Breadcrumbs } from "../../components/ui/Breadcrumbs"
import { CopyButton } from "../../components/ui/CopyButton"
import { RelatedToolsFooter } from "../../components/ui/RelatedToolsFooter"
import { SeoMeta } from "../../components/ui/SeoMeta"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { useLocalStorageList } from "../../hooks/useLocalStorageList"
import { useFavoriteDetails } from "../../hooks/useFavoriteDetails"

function describe(cron: string): string | null {
  try {
    return cronstrue.toString(cron, { use24HourTimeFormat: false, verbose: true })
  } catch {
    return null
  }
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export default function FavoritesManager() {
  const favorites = useLocalStorageList("cronparser-favorites", 200)
  const { getDetail, setDetail, removeDetail, importDetail } = useFavoriteDetails()

  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [newExpression, setNewExpression] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const items = useMemo(
    () => favorites.items.map((cron) => ({ cron, detail: getDetail(cron), description: describe(cron) })),
    [favorites.items, getDetail],
  )

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const item of items) set.add(item.detail.category || "Uncategorized")
    return ["All", ...[...set].sort()]
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      const matchesCategory = categoryFilter === "All" || (item.detail.category || "Uncategorized") === categoryFilter
      const matchesQuery =
        !q ||
        item.cron.toLowerCase().includes(q) ||
        item.detail.label.toLowerCase().includes(q) ||
        item.detail.notes.toLowerCase().includes(q) ||
        item.detail.category.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [items, query, categoryFilter])

  const addExpression = () => {
    const trimmed = newExpression.trim()
    if (!trimmed) return
    favorites.add(trimmed)
    setNewExpression("")
  }

  const removeExpression = (cron: string) => {
    favorites.remove(cron)
    removeDetail(cron)
  }

  const exportAs = (format: "json" | "csv" | "txt") => {
    if (format === "json") {
      const payload = items.map((i) => ({ cron: i.cron, ...i.detail }))
      downloadFile("cron-favorites.json", JSON.stringify(payload, null, 2), "application/json")
    } else if (format === "csv") {
      const rows = [
        ["Cron Expression", "Label", "Category", "Notes"],
        ...items.map((i) => [i.cron, i.detail.label, i.detail.category, i.detail.notes]),
      ]
      const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n")
      downloadFile("cron-favorites.csv", csv, "text/csv")
    } else {
      const txt = items
        .map((i) => (i.detail.label ? `${i.cron}  # ${i.detail.label}` : i.cron))
        .join("\n")
      downloadFile("cron-favorites.txt", txt, "text/plain")
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!Array.isArray(parsed)) return
        for (const entry of parsed) {
          if (typeof entry?.cron !== "string") continue
          favorites.add(entry.cron)
          importDetail(entry.cron, {
            label: typeof entry.label === "string" ? entry.label : undefined,
            category: typeof entry.category === "string" ? entry.category : undefined,
            notes: typeof entry.notes === "string" ? entry.notes : undefined,
          })
        }
      } catch {
        // Silently ignore malformed import files.
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <SeoMeta
        title="Favorite Cron Expressions Manager — Categories, Notes & Export | CronParser"
        description="Organize your saved cron expressions with categories, notes, and custom labels. Search, rename, and export to JSON, CSV, or TXT — all stored locally in your browser."
        path="/favorites"
      />

      <Breadcrumbs items={[{ label: "Cron Tools", path: "/all-tools" }, { label: "Favorites Manager" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Favorites Manager</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Organize saved cron expressions with categories, notes, and custom labels — synced with the
          Favorites list on the home page.
        </p>
      </div>

      {/* Add new */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newExpression}
          onChange={(e) => setNewExpression(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addExpression()}
          placeholder="Paste a cron expression to save..."
          spellCheck={false}
          className="flex-1 rounded-lg border border-gray-200 bg-white p-3 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900"
        />
        <button
          type="button"
          onClick={addExpression}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Search + export/import */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search favorites..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900"
          />
        </div>
        <button
          type="button"
          onClick={() => exportAs("json")}
          disabled={items.length === 0}
          title="Export as JSON"
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
        >
          <FileJson className="h-3.5 w-3.5" /> JSON
        </button>
        <button
          type="button"
          onClick={() => exportAs("csv")}
          disabled={items.length === 0}
          title="Export as CSV"
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
        </button>
        <button
          type="button"
          onClick={() => exportAs("txt")}
          disabled={items.length === 0}
          title="Export as TXT"
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
        >
          <FileText className="h-3.5 w-3.5" /> TXT
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Import from JSON"
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
        >
          <Upload className="h-3.5 w-3.5" /> Import
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" className="sr-only" onChange={handleImport} />
      </div>

      {/* Category pills */}
      {categories.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mb-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 py-14 text-center dark:border-gray-800">
          <Star className="h-8 w-8 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {items.length === 0
              ? "No favorites yet — add one above, or star an expression on the home page."
              : `No favorites match your search.`}
          </p>
        </div>
      ) : (
        <div className="mb-8 flex flex-col gap-3">
          {filtered.map(({ cron, detail, description }) => (
            <div key={cron} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <input
                    type="text"
                    value={detail.label}
                    onChange={(e) => setDetail(cron, { label: e.target.value })}
                    placeholder="Add a name..."
                    className="w-full truncate border-none bg-transparent p-0 text-sm font-semibold text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-gray-100 dark:placeholder:text-gray-500"
                  />
                  <p className="truncate font-mono text-sm text-gray-600 dark:text-gray-400">{cron}</p>
                  {description && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{description}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <CopyButton text={cron} />
                  <Link
                    to={`/?expr=${encodeURIComponent(cron)}`}
                    className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
                  >
                    Try it
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeExpression(cron)}
                    className="cursor-pointer rounded-lg p-1.5 text-gray-300 transition-colors hover:text-red-500 dark:text-gray-600"
                    aria-label="Delete favorite"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={detail.category}
                  onChange={(e) => setDetail(cron, { category: e.target.value || "Uncategorized" })}
                  placeholder="Category"
                  className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:w-40"
                />
                <input
                  type="text"
                  value={detail.notes}
                  onChange={(e) => setDetail(cron, { notes: e.target.value })}
                  placeholder="Notes..."
                  className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:placeholder:text-gray-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-8">
        <AdSlot />
      </div>

      <ToolSeoSection
        steps={[
          "Add an expression directly here, or star one from the Cron Parser home page — both share the same Favorites list.",
          "Give each favorite a name, assign it to a category, and jot down notes — all editable inline.",
          "Search across cron text, names, categories, and notes, or filter by category using the pills.",
          "Export everything as JSON (full detail), CSV (spreadsheet-ready), or TXT (crontab-style, one per line), and re-import a JSON export later.",
        ]}
        faqs={[
          {
            q: "Does this replace the Favorites tab on the home page?",
            a: "No — they share the same underlying list, stored under the same browser local storage key. Starring an expression on the home page shows it here too, and vice versa; this page just adds categories, notes, renaming, and export on top.",
          },
          {
            q: "Where are categories and notes stored?",
            a: "Entirely in your browser's local storage, in a separate key from the base favorites list. Clearing your browser data, or using a different browser or device, will reset them.",
          },
          {
            q: "What's in the CSV and TXT exports?",
            a: "CSV includes four columns — cron expression, label, category, and notes — ready to open in a spreadsheet. TXT is a plain crontab-style list, one expression per line, with the label appended as a trailing comment when set.",
          },
          {
            q: "Can I import a CSV or TXT file back in?",
            a: "Import currently accepts JSON exports (which preserve full detail). CSV and TXT are one-way export formats intended for spreadsheets and crontab files rather than round-tripping back into this tool.",
          },
        ]}
      />

      <RelatedToolsFooter toolIds={["home", "compare", "cheat-sheet"]} />
    </div>
  )
}
