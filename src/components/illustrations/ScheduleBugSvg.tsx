const DAYS = ["S", "M", "T", "W", "T", "F", "S"]

export function ScheduleBugSvg() {
  const cellSize = 56
  const gridX = 90
  const gridY = 40
  const flaggedIndex = 17 // third row, third column-ish

  return (
    <svg viewBox="0 0 600 250" className="w-full" role="img" aria-label="A calendar grid with one day flagged by a warning triangle">
      <rect width="600" height="250" className="fill-gray-50 dark:fill-gray-900" rx="16" />

      {DAYS.map((d, i) => (
        <text
          key={`h-${i}`}
          x={gridX + i * cellSize + cellSize / 2}
          y={gridY - 10}
          textAnchor="middle"
          className="fill-gray-400 dark:fill-gray-500 text-[11px] font-semibold"
        >
          {d}
        </text>
      ))}

      {Array.from({ length: 21 }).map((_, i) => {
        const col = i % 7
        const row = Math.floor(i / 7)
        const x = gridX + col * cellSize
        const y = gridY + row * cellSize
        const flagged = i === flaggedIndex
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={cellSize - 6}
            height={cellSize - 6}
            rx="8"
            className={
              flagged
                ? "fill-amber-100 stroke-amber-400 dark:fill-amber-950 dark:stroke-amber-600"
                : "fill-white stroke-gray-200 dark:fill-gray-800 dark:stroke-gray-700"
            }
            strokeWidth="1.5"
          />
        )
      })}

      {/* warning triangle on the flagged cell */}
      <g transform={`translate(${gridX + (flaggedIndex % 7) * cellSize + cellSize / 2}, ${gridY + Math.floor(flaggedIndex / 7) * cellSize + cellSize / 2 - 6})`}>
        <path d="M 0 -14 L 14 10 L -14 10 Z" className="fill-amber-400 dark:fill-amber-500" />
        <text x="0" y="7" textAnchor="middle" className="fill-white text-[13px] font-bold">!</text>
      </g>

      <text x="300" y="232" textAnchor="middle" className="fill-gray-400 dark:fill-gray-500 text-[12px]">
        one wrong assumption, one bad day
      </text>
    </svg>
  )
}
