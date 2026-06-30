import { Menu } from "lucide-react"
import { SearchBar } from "./SearchBar"
import { ThemeToggle } from "./ThemeToggle"

interface TopBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onMenuToggle: () => void
}

export function TopBar({ searchQuery, onSearchChange, onMenuToggle }: TopBarProps) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 md:px-6">
      <button
        type="button"
        onClick={onMenuToggle}
        className="flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex flex-1 items-center justify-between">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
        <ThemeToggle />
      </div>
    </header>
  )
}
