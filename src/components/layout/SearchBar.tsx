import { forwardRef } from "react"
import { Search } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  { value, onChange },
  ref,
) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        ref={ref}
        type="text"
        placeholder="Search tools..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-72 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-8 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900"
      />
      {!value && (
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-gray-300 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-500">
          /
        </kbd>
      )}
    </div>
  )
})
