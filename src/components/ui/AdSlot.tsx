interface AdSlotProps {
  variant?: "horizontal" | "square"
}

export function AdSlot({ variant = "horizontal" }: AdSlotProps) {
  const height = variant === "horizontal" ? "min-h-[90px] sm:min-h-[100px]" : "min-h-[250px]"

  return (
    <div
      className={`flex w-full items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50 ${height}`}
      aria-hidden="true"
    >
      <span className="text-[11px] font-medium uppercase tracking-widest text-gray-300 dark:text-gray-700">
        Advertisement
      </span>
    </div>
  )
}
