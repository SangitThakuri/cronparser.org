import { useCallback, useSyncExternalStore } from "react"

const STORAGE_KEY = "cronparser-theme"

function getSnapshot() {
  if (typeof document === "undefined") return "light"
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

function getServerSnapshot() {
  return "light"
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
