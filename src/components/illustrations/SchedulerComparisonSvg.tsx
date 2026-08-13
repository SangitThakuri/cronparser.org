export function SchedulerComparisonSvg() {
  const branches = [
    { x: 90, label: "cron", sub: "simple, fixed-time" },
    { x: 230, label: "systemd timer", sub: "dependencies + logs" },
    { x: 370, label: "workflow engine", sub: "multi-step + retries" },
    { x: 510, label: "cloud scheduler", sub: "no server to run" },
  ]

  return (
    <svg viewBox="0 0 600 220" className="w-full" role="img" aria-label="A decision tree branching from a scheduled task into four scheduler options">
      <rect width="600" height="220" className="fill-gray-50 dark:fill-gray-900" rx="16" />

      <rect x="230" y="20" width="140" height="40" rx="10" className="fill-blue-100 stroke-blue-400 dark:fill-blue-950 dark:stroke-blue-700" strokeWidth="2" />
      <text x="300" y="45" textAnchor="middle" className="fill-blue-700 dark:fill-blue-300 text-[13px] font-semibold">Scheduled Task</text>

      {branches.map((b) => (
        <g key={b.label}>
          <path d={`M 300 60 L ${b.x} 100`} className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="2" fill="none" />
          <rect x={b.x - 55} y="100" width="110" height="46" rx="10" className="fill-white stroke-gray-300 dark:fill-gray-800 dark:stroke-gray-600" strokeWidth="2" />
          <text x={b.x} y="120" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100 text-[13px] font-semibold">{b.label}</text>
          <text x={b.x} y="136" textAnchor="middle" className="fill-gray-400 dark:fill-gray-500 text-[10px]">{b.sub}</text>
        </g>
      ))}

      <text x="300" y="195" textAnchor="middle" className="fill-gray-400 dark:fill-gray-500 text-[12px]">pick the simplest one that actually fits</text>
    </svg>
  )
}
