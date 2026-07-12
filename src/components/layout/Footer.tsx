import { Link } from "react-router-dom"

const LINKS: { label: string; to: string }[] = [
  { label: "Cron Parser", to: "/" },
  { label: "All Tools", to: "/all-tools" },
  { label: "Platform Guides", to: "/platforms" },
  { label: "Cheat Sheet", to: "/cheat-sheet" },
  { label: "About", to: "/about" },
  { label: "Privacy Policy", to: "/privacy" },
]

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 py-6 dark:border-gray-800">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 text-xs text-gray-400 dark:text-gray-500 sm:flex-row sm:justify-between">
        <p>&copy; {new Date().getFullYear()} CronParser.org</p>
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
