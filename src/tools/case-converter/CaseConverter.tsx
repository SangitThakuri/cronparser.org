import { useState } from "react"
import { Helmet } from "react-helmet-async"
import { CopyButton } from "../../components/ui/CopyButton"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"
import { CASE_CONVERSIONS, CHAR_TRANSFORMS, applyConversion } from "./caseConvert"

export default function CaseConverter() {
  const [text, setText] = useState("")

  return (
    <div className="mx-auto max-w-3xl">
      <Helmet>
        <title>Case Converter — camelCase, snake_case, PascalCase, kebab-case | CronParser</title>
        <meta
          name="description"
          content="Convert text instantly between camelCase, PascalCase, snake_case, kebab-case, and UPPER_SNAKE_CASE. A free, client-side identifier case converter for developers."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Case Converter</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Transform text between camelCase, PascalCase, snake_case, kebab-case, and more.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Text</label>
          {text && <CopyButton text={text} />}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text here… e.g. my_variable_name"
          rows={8}
          className="w-full resize-y rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
        />
      </div>

      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Convert
        </p>
        <div className="flex flex-wrap gap-2">
          {CASE_CONVERSIONS.map(({ label, fn }) => (
            <button
              key={label}
              type="button"
              onClick={() => setText((prev) => applyConversion(prev, fn))}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 font-mono text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
            >
              {label}
            </button>
          ))}
          {CHAR_TRANSFORMS.map(({ label, fn }) => (
            <button
              key={label}
              type="button"
              onClick={() => setText((prev) => fn(prev))}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 font-mono text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ToolSeoSection
        steps={[
          "Type or paste your text into the input area.",
          "Click any conversion button (camelCase, snake_case, kebab-case, etc.) to transform the text in-place. Conversions can be chained — press Ctrl+Z to undo.",
          "Word-level conversions tokenize each line independently on word boundaries, underscores, hyphens, and camelCase transitions, so 'my_variable', 'MyVariable', and 'my-variable' all convert identically.",
          "UPPERCASE and lowercase apply a simple character-level transformation without altering word structure.",
        ]}
        faqs={[
          {
            q: "What naming conventions does this support?",
            a: "camelCase, PascalCase, snake_case, kebab-case, UPPER_SNAKE_CASE, and Title Case — covering the identifier and file-naming conventions used across JavaScript, Python, Ruby, CSS, and most style guides.",
          },
          {
            q: "Does it convert multi-line text?",
            a: "Yes. Each line is converted independently, so you can paste a whole list of variable names or file names and convert them all at once. Empty lines are preserved as-is.",
          },
          {
            q: "How does the tokenizer handle mixed input?",
            a: "It splits on non-alphanumeric characters (spaces, underscores, hyphens) and on camelCase/PascalCase boundaries, so inconsistently-cased input still converts correctly.",
          },
          {
            q: "Is any data sent to a server?",
            a: "No. All conversions run entirely in your browser. Nothing you type ever leaves your machine.",
          },
        ]}
      />
    </div>
  )
}
