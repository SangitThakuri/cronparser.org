import { X } from "lucide-react"

interface ClearInputButtonProps {
  onClear: () => void
}

export function ClearInputButton({ onClear }: ClearInputButtonProps) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
    >
      <X className="h-3.5 w-3.5" />
      Clear
    </button>
  )
}
