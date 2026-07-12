import { useRef, useState } from "react"
import type { ReactNode } from "react"
import { Footer } from "./Footer"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { useSearchFilter } from "../../hooks/useSearchFilter"
import { useGlobalSearchHotkey } from "../../hooks/useGlobalSearchHotkey"
import { SearchContext } from "../../context/SearchContext"
import { tools } from "../../registry/tools"

interface ShellLayoutProps {
  children: ReactNode
}

export function ShellLayout({ children }: ShellLayoutProps) {
  const { query, setQuery, filtered } = useSearchFilter(tools)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useGlobalSearchHotkey(searchInputRef)

  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          items={filtered}
          query={query}
          onNavigate={() => {
            setQuery("")
            setMobileSidebarOpen(false)
          }}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            searchQuery={query}
            onSearchChange={setQuery}
            onMenuToggle={() => setMobileSidebarOpen(true)}
            searchInputRef={searchInputRef}
          />
          <main className="flex flex-1 flex-col overflow-y-auto bg-gray-50 p-4 dark:bg-gray-950 md:p-6">
            <div className="flex-1">{children}</div>
            <Footer />
          </main>
        </div>
      </div>
    </SearchContext.Provider>
  )
}
