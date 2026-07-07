import { Check, Share2 } from "lucide-react"
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard"

interface ShareButtonProps {
  getUrl: () => string
  title?: string
}

export function ShareButton({ getUrl, title = "CronParser" }: ShareButtonProps) {
  const { copy, copied } = useCopyToClipboard()

  const handleShare = async () => {
    const url = getUrl()
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // user cancelled or share failed — fall through to clipboard copy
      }
    }
    await copy(url)
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
        copied
          ? "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750 dark:hover:text-gray-100"
      }`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          <span>Link copied!</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </>
      )}
    </button>
  )
}
