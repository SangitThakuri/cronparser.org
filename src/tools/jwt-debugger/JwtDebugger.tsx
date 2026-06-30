import { Helmet } from "react-helmet-async"
import { useJwtDebugger } from "./useJwtDebugger"
import { JwtInput } from "./JwtInput"
import { JwtOutput } from "./JwtOutput"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

export default function JwtDebugger() {
  const { state, decoded, setInput } = useJwtDebugger()

  return (
    <div className="mx-auto max-w-4xl">
      <Helmet>
        <title>Secure Client-Side JWT Debugger &amp; Decoder | DevBits</title>
        <meta name="description" content="Decode JSON Web Tokens (JWT) safely. Inspect header, payload, and signature values completely client-side without sending sensitive data over the network." />
      </Helmet>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          JWT Debugger
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Decode and inspect JSON Web Tokens. All processing is done client-side.
        </p>
      </div>

      <div className="mb-6">
        <JwtInput value={state.input} onChange={setInput} />
      </div>

      <JwtOutput decoded={decoded} />

      <ToolSeoSection
        howItWorks={[
          "Paste a JWT (three Base64url-encoded segments separated by dots) into the input. The tool splits the token on the dot delimiter and decodes the header and payload segments using atob(), then pretty-prints the resulting JSON objects.",
          "The signature segment is displayed as-is. Signature verification requires the secret or public key and is intentionally out of scope — this tool focuses on safe, read-only inspection of token contents without transmitting anything to a server.",
        ]}
        faqs={[
          {
            q: "Is it safe to paste a real JWT here?",
            a: "All decoding happens in your browser with no network requests. However, as a best practice, avoid pasting production tokens containing sensitive claims into any online tool. Use a test or already-expired token when possible.",
          },
          {
            q: "Does this tool verify the JWT signature?",
            a: "No. Signature verification requires the signing secret or public key, which you should never share with a third-party tool. This tool only decodes and displays the header and payload.",
          },
          {
            q: "What algorithms does JWT support?",
            a: "JWTs can be signed with HMAC algorithms (HS256, HS384, HS512), RSA (RS256, RS384, RS512), or ECDSA (ES256, ES384, ES512). The algorithm is declared in the 'alg' field of the decoded header.",
          },
          {
            q: "What does 'exp' mean in the JWT payload?",
            a: "The 'exp' claim is a Unix timestamp (seconds since January 1 1970 UTC) indicating when the token expires. Servers reject tokens presented after this time.",
          },
        ]}
      />
    </div>
  )
}
