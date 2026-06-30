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

      <div className="grid gap-6 md:grid-cols-2">
        <RegexInput
          pattern={state.pattern}
          flags={state.flags}
          testText={state.testText}
          matchCount={matchCount}
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
        steps={[
          "Type your regex pattern in the pattern field — the border turns green when the expression is valid, red if it has a syntax error.",
          "Add optional flags in the flags box: g (global), i (case-insensitive), m (multiline), s (dotAll).",
          "Enter your test string in the Test Text area. Matches are highlighted in real-time in the output panel.",
          "Refer to the cheat sheet above the editor for a quick reference of common tokens, quantifiers, and anchors.",
        ]}
        faqs={[
          {
            q: "Which regex flavor does this tester use?",
            a: "JavaScript's ECMAScript regex engine (ECMA-262). It is broadly compatible with PCRE but has differences around lookbehind support and Unicode handling. Enable the 'u' flag for full Unicode mode.",
          },
          {
            q: "What does the 'g' flag do?",
            a: "The global flag tells the engine to find all matches in the string rather than stopping after the first. The match count in the output reflects total non-overlapping matches.",
          },
          {
            q: "Is my test text sent anywhere?",
            a: "No. The regex engine runs entirely in your browser via JavaScript's native RegExp. No data is transmitted over the network.",
          },
          {
            q: "Why does my pattern cause the page to freeze?",
            a: "Certain patterns with nested quantifiers can trigger catastrophic backtracking. If you notice slowness, simplify your quantifiers or add possessive-style grouping.",
          },
        ]}
      />
    </div>
  )
}
