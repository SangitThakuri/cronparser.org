import { Upload, CloudUpload } from "lucide-react"
import { useFileDropZone } from "../../hooks/useFileDropZone"

interface EncodedInputProps {
  value: string
  hasError: boolean
  onChange: (value: string) => void
  placeholder: string
  label?: string
}

export function EncodedInput({ value, hasError, onChange, placeholder, label = "Input" }: EncodedInputProps) {
  const { isDragging, onDragEnter, onDragLeave, onDragOver, onDrop, onFileInput } =
    useFileDropZone(onChange)

  const borderClass = hasError
    ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100 dark:border-red-700 dark:bg-red-950 dark:focus:border-red-500 dark:focus:ring-red-900"
    : value.trim()
      ? "border-green-300 bg-white focus:border-green-400 focus:ring-green-100 dark:border-green-700 dark:bg-gray-800 dark:focus:border-green-500 dark:focus:ring-green-900"
      : "border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900"

  return (
    <div
      className="relative flex flex-col gap-3"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300">
          <Upload className="h-3.5 w-3.5" />
          Upload file
          <input
            type="file"
            accept=".txt,.json"
            className="sr-only"
            onChange={onFileInput}
          />
        </label>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={8}
        className={`w-full resize-y rounded-lg border p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:text-gray-100 dark:placeholder:text-gray-500 transition-colors ${borderClass}`}
      />

      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50/80 dark:bg-blue-950/80">
          <CloudUpload className="h-8 w-8 text-blue-500" />
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Drop .txt or .json file
          </p>
        </div>
      )}
    </div>
  )
}
