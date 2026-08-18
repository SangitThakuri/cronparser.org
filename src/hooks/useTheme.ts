import { useCallback, useSyncExternalStore } from "react"

const STORAGE_KEY = "cronparser-theme"

function getSnapshot() {
  // Dark mode is the site's default appearance (see index.html's inline theme
  // script and main.tsx) — only an explicit "light" choice opts out — so the
  // fallback here must match that, not the inverse.
  if (typeof document === "undefined") return "dark"
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

function getServerSnapshot() {
  return "dark"
}

function subscribe(callback: () => void) {
  const observer = new MutationObserver(() => callback())
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => observer.disconnect()
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark"
    if (next === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem(STORAGE_KEY, next)
  }, [theme])

  const setTheme = useCallback((t: "light" | "dark") => {
    if (t === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem(STORAGE_KEY, t)
  }, [])

  return { theme, toggleTheme, setTheme }
}
