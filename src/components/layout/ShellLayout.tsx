import { useState } from "react"
import type { ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { useSearchFilter } from "../../hooks/useSearchFilter"
import { tools } from "../../registry/tools"

interface ShellLayoutProps {
  children: ReactNode
}

export function ShellLayout({ children }: ShellLayoutProps) {
  const { query, setQuery, filtered } = useSearchFilter(tools)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        items={filtered}
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
        />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-950 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
