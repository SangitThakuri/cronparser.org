import { useState } from "react"
import { Helmet } from "react-helmet-async"
import { CopyButton } from "../../components/ui/CopyButton"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

type KeySize = 1024 | 2048 | 4096

function toPem(type: "PUBLIC KEY" | "PRIVATE KEY", buf: ArrayBuffer): string {
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
  const lines = b64.match(/.{1,64}/g)!.join("\n")
  return `-----BEGIN ${type}-----\n${lines}\n-----END ${type}-----`
}

export default function RsaGenerator() {
  const [keySize, setKeySize] = useState<KeySize>(2048)
  const [publicKey, setPublicKey] = useState("")
  const [privateKey, setPrivateKey] = useState("")
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    setPublicKey("")
    setPrivateKey("")
    try {
      const pair = await crypto.subtle.generateKey(
        {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: keySize,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["sign", "verify"],
      )
      const [pubBuf, privBuf] = await Promise.all([
        crypto.subtle.exportKey("spki", pair.publicKey),
        crypto.subtle.exportKey("pkcs8", pair.privateKey),
      ])
      setPublicKey(toPem("PUBLIC KEY", pubBuf))
      setPrivateKey(toPem("PRIVATE KEY", privBuf))
    } finally {
      setLoading(false)
    }
  }

  const sizes: KeySize[] = [1024, 2048, 4096]

  return (
    <div className="mx-auto max-w-3xl">
      <Helmet>
        <title>RSA Key Pair Generator (1024 / 2048 / 4096-bit) | DevBits</title>
        <meta
          name="description"
          content="Generate RSA public and private key pairs in PEM format directly in your browser using the Web Crypto API."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">RSA Key Generator</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Generate RSA key pairs in PEM format — entirely client-side via the Web Crypto API.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setKeySize(s)}
              className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                keySize === s
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              {s}-bit
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating…" : "Generate Keys"}
        </button>
        {loading && (
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {keySize === 4096 ? "4096-bit keys may take a few seconds…" : "Generating…"}
          </span>
        )}
      </div>

      {publicKey && (
        <div className="flex flex-col gap-4">
          {[
            { label: "Public Key (SPKI / PEM)", value: publicKey },
            { label: "Private Key (PKCS#8 / PEM)", value: privateKey },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                <CopyButton text={value} />
              </div>
              <textarea
                readOnly
                value={value}
                rows={8}
                className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
              />
            </div>
          ))}
        </div>
      )}

      {!publicKey && !loading && (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 p-16 dark:border-gray-700">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Click "Generate Keys" to create a new RSA key pair
          </p>
        </div>
      )}

      <ToolSeoSection
        steps={[
          "Select the key size — 2048-bit is recommended for most uses; 4096-bit provides higher security at the cost of generation time.",
          "Click 'Generate Keys'. Key generation uses the browser's Web Crypto API (crypto.subtle.generateKey) and runs entirely client-side.",
          "Copy the Public Key to share with others. Keep the Private Key secret — it is never transmitted anywhere.",
        ]}
        faqs={[
          {
            q: "Is the private key ever sent to a server?",
            a: "No. Key generation uses crypto.subtle.generateKey(), which runs entirely in your browser. The keys never leave your machine.",
          },
          {
            q: "What format are the keys in?",
            a: "The public key is exported in SPKI (Subject Public Key Info) format and the private key in PKCS#8 format, both PEM-encoded (base64 with -----BEGIN/END----- headers).",
          },
          {
            q: "Should I use 1024-bit keys?",
            a: "No. 1024-bit RSA is considered cryptographically insecure and is included only for legacy compatibility testing. Use at least 2048-bit for any real-world purpose.",
          },
        ]}
      />
    </div>
  )
}
