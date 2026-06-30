import { useState, useCallback } from "react"
import { Helmet } from "react-helmet-async"
import { RefreshCw } from "lucide-react"
import { CopyButton } from "../../components/ui/CopyButton"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

const CHAR_SETS = {
  upper:   { label: "Uppercase", example: "A–Z",  chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  lower:   { label: "Lowercase", example: "a–z",  chars: "abcdefghijklmnopqrstuvwxyz" },
  digits:  { label: "Digits",    example: "0–9",  chars: "0123456789" },
  symbols: { label: "Symbols",   example: "!@#…", chars: "!@#$%^&*()-_=+[]{}|;:,.<>?" },
} as const

type SetKey = keyof typeof CHAR_SETS

function generatePassword(length: number, enabled: Set<SetKey>): string {
  if (enabled.size === 0) return ""
  const pool = [...enabled].map((k) => CHAR_SETS[k].chars).join("")
  const arr = new Uint32Array(length)
  crypto.getRandomValues(arr)
  return Array.from(arr, (n) => pool[n % pool.length]).join("")
}

function getStrength(pwd: string): { label: string; color: string; pct: number } {
  if (!pwd) return { label: "", color: "bg-gray-200 dark:bg-gray-700", pct: 0 }
  let score = 0
  if (pwd.length >= 12) score++
  if (pwd.length >= 20) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 2) return { label: "Weak", color: "bg-red-500", pct: 25 }
  if (score <= 4) return { label: "Fair", color: "bg-yellow-400", pct: 50 }
  if (score === 5) return { label: "Strong", color: "bg-blue-500", pct: 75 }
  return { label: "Very Strong", color: "bg-green-500", pct: 100 }
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [enabled, setEnabled] = useState<Set<SetKey>>(
    () => new Set<SetKey>(["upper", "lower", "digits", "symbols"]),
  )
  const [password, setPassword] = useState(() =>
    generatePassword(16, new Set<SetKey>(["upper", "lower", "digits", "symbols"])),
  )

  const regen = useCallback((len: number, sets: Set<SetKey>) => {
    setPassword(generatePassword(len, sets))
  }, [])

  const toggleSet = (key: SetKey) => {
    const next = new Set(enabled)
    if (next.has(key)) {
      if (next.size === 1) return
      next.delete(key)
    } else {
      next.add(key)
    }
    setEnabled(next)
    regen(length, next)
  }

  const str = getStrength(password)

  return (
    <div className="mx-auto max-w-xl">
      <Helmet>
        <title>Secure Random Password Generator | DevBits</title>
        <meta
          name="description"
          content="Generate strong, random passwords with configurable length and character sets. Uses crypto.getRandomValues for true cryptographic randomness."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Password Generator</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Generate secure random passwords using your browser's cryptographic RNG.
        </p>
      </div>

      {/* Password output */}
      <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-3 p-4">
          <span className="min-w-0 flex-1 break-all font-mono text-lg font-semibold text-gray-900 dark:text-gray-100">
            {password || (
              <span className="text-gray-300 dark:text-gray-600">
                Select at least one character set
              </span>
            )}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => regen(length, enabled)}
              className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              aria-label="Regenerate password"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            {password && <CopyButton text={password} />}
          </div>
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full transition-all duration-300 ${str.color}`}
            style={{ width: `${str.pct}%` }}
          />
        </div>
        {str.label && (
          <div className="px-4 py-1.5 text-xs text-gray-500 dark:text-gray-400">
            Strength:{" "}
            <span className="font-medium text-gray-800 dark:text-gray-200">{str.label}</span>
          </div>
        )}
      </div>

      {/* Length slider */}
      <div className="mb-4 flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Length</span>
          <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
            {length}
          </span>
        </div>
        <input
          type="range"
          min={4}
          max={128}
          value={length}
          onChange={(e) => {
            const l = Number(e.target.value)
            setLength(l)
            regen(l, enabled)
          }}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>4</span>
          <span>128</span>
        </div>
      </div>

      {/* Character sets */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Character Sets
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(CHAR_SETS) as [SetKey, (typeof CHAR_SETS)[SetKey]][]).map(
            ([key, { label, example }]) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleSet(key)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  enabled.has(key)
                    ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/60"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                }`}
              >
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 ${
                    enabled.has(key)
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {enabled.has(key) && (
                    <span className="text-[10px] leading-none text-white">✓</span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {label}
                  </div>
                  <div className="font-mono text-xs text-gray-400 dark:text-gray-500">
                    {example}
                  </div>
                </div>
              </button>
            ),
          )}
        </div>
      </div>

      <ToolSeoSection
        steps={[
          "Adjust the length slider to set the desired password length (4–128 characters).",
          "Toggle character sets on or off to include or exclude uppercase, lowercase, digits, and symbols.",
          "Click the refresh icon or change any setting to generate a new password instantly.",
          "Click Copy to copy the password to your clipboard.",
        ]}
        faqs={[
          {
            q: "How is the password generated?",
            a: "Passwords are generated using crypto.getRandomValues(), the browser's cryptographically secure random number generator — the same RNG used by password managers and cryptographic libraries.",
          },
          {
            q: "Is the password sent to a server?",
            a: "No. Generation runs entirely in your browser. Nothing is transmitted over the network.",
          },
          {
            q: "What length should I use?",
            a: "For most accounts, 16–20 characters with all character sets enabled is considered very strong. For high-security keys or passphrases, 32+ characters is recommended.",
          },
        ]}
      />
    </div>
  )
}
