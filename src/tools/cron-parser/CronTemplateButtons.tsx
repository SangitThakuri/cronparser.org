export interface CronTemplate {
  cron: string
  label: string
}

interface CronTemplateButtonsProps {
  templates: readonly CronTemplate[]
  onSelect: (cron: string) => void
  heading?: string
}

export function CronTemplateButtons({
  templates,
  onSelect,
  heading = "Quick templates:",
}: CronTemplateButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-400 dark:text-gray-500">{heading}</span>
      {templates.map(({ cron, label }) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(cron)}
          className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
        >
          <span className="font-mono">{cron}</span>
          <span className="ml-1.5 text-gray-400 dark:text-gray-500">— {label}</span>
        </button>
      ))}
    </div>
  )
}
