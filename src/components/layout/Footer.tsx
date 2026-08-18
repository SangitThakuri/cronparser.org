import { Link } from "react-router-dom"

// A literal, not new Date().getFullYear() — that would differ between whenever
// this page was prerendered (build time) and whenever a visitor's browser
// hydrates it (any time until the next deploy), causing a hydration mismatch.
// Bump this once a year.
const COPYRIGHT_YEAR = 2026

const LINKS: { label: string; to: string }[] = [
  { label: "Cron Parser", to: "/" },
  { label: "All Tools", to: "/all-tools" },
  { label: "Platform Guides", to: "/platforms" },
  { label: "Blog", to: "/blog" },
  { label: "Cheat Sheet", to: "/cheat-sheet" },
  { label: "About", to: "/about" },
  { label: "Privacy Policy", to: "/privacy" },
]

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 py-6 dark:border-gray-800">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 text-xs text-gray-400 dark:text-gray-500 sm:flex-row sm:justify-between">
        <p>&copy; {COPYRIGHT_YEAR} CronParser.org</p>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-gray-600 dark:hover:text-gray-300">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
