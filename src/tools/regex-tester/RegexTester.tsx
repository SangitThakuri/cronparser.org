import { Helmet } from "react-helmet-async"
import { useRegexTester } from "./useRegexTester"
import { RegexInput } from "./RegexInput"
import { RegexOutput } from "./RegexOutput"
import { RegexCheatSheet } from "./RegexCheatSheet"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

export default function RegexTester() {
  const {
    state,
    setPattern,
    setFlags,
    setTestText,
    regexError,
    matches,
    matchCount,
  } = useRegexTester()

  return (
    <div className="mx-auto max-w-5xl">
      <Helmet>
        <title>Real-Time Regex Tester &amp; Cheat Sheet | DevBits</title>
        <meta name="description" content="Test and debug regular expressions with live regex match highlighting. Includes a quick reference cheat sheet for standard expression patterns." />
      </Helmet>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Regex Tester
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Test regular expressions with real-time match highlighting.
        </p>
      </div>

      <div className="mb-6">
        <RegexCheatSheet />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RegexInput
          pattern={state.pattern}
          flags={state.flags}
          testText={state.testText}
          onPatternChange={setPattern}
          onFlagsChange={setFlags}
          onTestTextChange={setTestText}
          regexError={regexError}
        />
        <RegexOutput
          testText={state.testText}
          pattern={state.pattern}
          flags={state.flags}
          matches={matches}
          matchCount={matchCount}
          regexError={regexError}
        />
      </div>

      <ToolSeoSection
        howItWorks={[
          "Enter a regular expression pattern and optional flags (g, i, m, s, u, y) in the pattern field, then type your test string. The engine uses JavaScript's native RegExp to find all matches and highlights them inline in the output panel in real time.",
          "The cheat sheet above the editor lists the most common regex tokens — character classes, quantifiers, anchors, and groups — so you can build and refine patterns without leaving the page.",
        ]}
        faqs={[
          {
            q: "Which regex flavor does this tester use?",
            a: "JavaScript's ECMAScript regex engine (ECMA-262). The syntax is broadly compatible with PCRE but has differences around lookbehind, atomic groups, and Unicode handling. Enable the 'u' flag for full Unicode mode.",
          },
          {
            q: "What does the 'g' flag do?",
            a: "The global flag tells the engine to find all matches in the string rather than stopping after the first. The match count displayed in the output reflects the total number of non-overlapping matches.",
          },
          {
            q: "Why does my pattern cause the page to freeze?",
            a: "Certain patterns with nested quantifiers can trigger catastrophic backtracking, causing the engine to hang. If you notice slowness, simplify your quantifiers or add atomic-style grouping.",
          },
          {
            q: "Can I test multiline strings?",
            a: "Yes. Press Shift+Enter in the test text area to insert a newline. Enable the 'm' flag so that ^ and $ match the start and end of each line rather than the entire string.",
          },
        ]}
      />
    </div>
  )
}
