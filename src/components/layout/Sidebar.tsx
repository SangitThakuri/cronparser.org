import { ChevronLeft, ChevronRight, Clock, Code2, Grid2x2, X } from "lucide-react"
import { NavLink } from "react-router-dom"
import type { RegistryEntry } from "../../registry/types"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  items: RegistryEntry[]
  onNavigate?: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

function groupByCategory(items: RegistryEntry[]): [string, RegistryEntry[]][] {
  const map = new Map<string, RegistryEntry[]>()
  for (const item of items) {
    const cat = item.category ?? "Other"
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(item)
  }
  return [...map.entries()]
}

export function Sidebar({
  collapsed,
  onToggle,
  items,
  onNavigate,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const groups = groupByCategory(items)
  const singleGroup = groups.length === 1

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white
          transition-transform duration-200 dark:border-gray-800 dark:bg-gray-900
          md:relative md:z-auto md:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "w-16" : "w-64"}
        `}
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-200 px-4 dark:border-gray-800">
          <NavLink to="/" onClick={onNavigate} className="flex min-w-0 items-center gap-2">
            <Code2 className="h-6 w-6 shrink-0 text-blue-600" />
            {!collapsed && (
              <span className="truncate text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                CronParser
              </span>
            )}
          </NavLink>
          <button
            type="button"
            onClick={onMobileClose}
            className="ml-auto flex items-center justify-center rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 md:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* Pinned: home tool + full catalog */}
          <div className="mb-2 border-b border-gray-100 pb-2 dark:border-gray-800">
            <NavLink
              to="/"
              end
              onClick={onNavigate}
              title={collapsed ? "Cron Parser" : undefined}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                }`
              }
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                <Clock className="h-4 w-4" />
              </span>
              {!collapsed && <span className="font-medium">Cron Parser</span>}
            </NavLink>
            <NavLink
              to="/all-tools"
              onClick={onNavigate}
              title={collapsed ? "All Tools" : undefined}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                }`
              }
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                <Grid2x2 className="h-4 w-4" />
              </span>
              {!collapsed && <span className="font-medium">All Tools</span>}
            </NavLink>
          </div>

          {groups.map(([category, catItems]) => (
            <div key={category}>
              {/* Category label — only when expanded and there are multiple categories */}
              {!collapsed && !singleGroup && (
                <div className="px-4 pb-1 pt-3 first:pt-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                    {category}
                  </span>
                </div>
              )}

              {catItems.map((tool) => (
                <NavLink
                  key={tool.id}
                  to={`/${tool.id}`}
                  onClick={onNavigate}
                  title={collapsed ? tool.name : undefined}
                  className={({ isActive }) =>
                    `flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    }`
                  }
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <tool.icon className="h-4 w-4" />
                  </span>
                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{tool.name}</div>
                      <div className="truncate text-xs text-gray-400 dark:text-gray-500">
                        {tool.description}
                      </div>
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Collapse toggle (desktop only) */}
        <div className="shrink-0 border-t border-gray-200 p-2 dark:border-gray-800">
          <button
            type="button"
            onClick={onToggle}
            className="hidden w-full cursor-pointer items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 md:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
