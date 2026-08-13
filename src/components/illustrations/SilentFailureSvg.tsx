export function SilentFailureSvg() {
  return (
    <svg viewBox="0 0 600 220" className="w-full" role="img" aria-label="A timeline of cron runs, most successful, with one silent gap and a downstream failure">
      <rect width="600" height="220" className="fill-gray-50 dark:fill-gray-900" rx="16" />
      <line x1="60" y1="110" x2="540" y2="110" className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="2" strokeDasharray="6 6" />

      {[100, 190, 280].map((x) => (
        <g key={x}>
          <circle cx={x} cy="110" r="20" className="fill-green-100 stroke-green-400 dark:fill-green-950 dark:stroke-green-700" strokeWidth="2" />
          <path d={`M ${x - 8} 110 l 6 6 l 10 -12`} className="stroke-green-600 dark:stroke-green-400" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}

      {/* the silent gap */}
      <circle cx="370" cy="110" r="20" className="fill-gray-100 stroke-gray-300 dark:fill-gray-800 dark:stroke-gray-600" strokeWidth="2" strokeDasharray="4 3" />
      <text x="370" y="117" textAnchor="middle" className="fill-gray-400 dark:fill-gray-500 text-[16px] font-semibold">?</text>

      <circle cx="460" cy="110" r="20" className="fill-red-100 stroke-red-400 dark:fill-red-950 dark:stroke-red-700" strokeWidth="2" />
      <path d="M 452 102 l 16 16 M 468 102 l -16 16" className="stroke-red-600 dark:stroke-red-400" strokeWidth="2.5" strokeLinecap="round" />

      <text x="415" y="165" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400 text-[13px]">missed run, no alert —</text>
      <text x="415" y="184" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400 text-[13px]">discovered days later</text>
    </svg>
  )
}
