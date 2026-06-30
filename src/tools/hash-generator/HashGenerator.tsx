import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { CopyButton } from "../../components/ui/CopyButton"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

// ── MD5 (pure TypeScript, RFC 1321) ──────────────────────────────────────────

function md5(str: string): string {
  const S = [
    7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
    5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
    4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
    6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,
  ]
  const K = Array.from({ length: 64 }, (_, i) => (Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0)
  const rol = (x: number, n: number) => (x << n) | (x >>> (32 - n))
  const add = (a: number, b: number) => (a + b) | 0

  const msg = new TextEncoder().encode(str)
  const len = msg.length
  const padLen = Math.ceil((len + 9) / 64) * 64
  const buf = new Uint8Array(padLen)
  buf.set(msg)
  buf[len] = 0x80
  const bitLen = len * 8
  // Append bit length as 64-bit little-endian (lower 32 bits only; upper = 0 for inputs < 512 MB)
  new DataView(buf.buffer).setUint32(padLen - 8, bitLen >>> 0, true)

  let a = 0x67452301, b = 0xefcdab89 | 0, c = 0x98badcfe | 0, d = 0x10325476

  for (let o = 0; o < padLen; o += 64) {
    const dv = new DataView(buf.buffer, o, 64)
    const M = Array.from({ length: 16 }, (_, j) => dv.getUint32(j * 4, true))
    let [A, B, C, D] = [a, b, c, d]
    for (let j = 0; j < 64; j++) {
      let F: number, g: number
      if      (j < 16) { F = (B & C) | (~B & D); g = j }
      else if (j < 32) { F = (D & B) | (~D & C); g = (5 * j + 1) % 16 }
      else if (j < 48) { F = B ^ C ^ D;           g = (3 * j + 5) % 16 }
      else             { F = C ^ (B | ~D);         g = (7 * j) % 16 }
      F = add(add(add(A, F), M[g]), K[j])
      A = D; D = C; C = B; B = add(B, rol(F, S[j]))
    }
    a = add(a, A); b = add(b, B); c = add(c, C); d = add(d, D)
  }

  const out = new DataView(new ArrayBuffer(16))
  out.setUint32(0, a, true); out.setUint32(4, b, true)
  out.setUint32(8, c, true); out.setUint32(12, d, true)
  return Array.from(new Uint8Array(out.buffer)).map(x => x.toString(16).padStart(2, "0")).join("")
}

// ── SHA helpers (Web Crypto API) ──────────────────────────────────────────────

const toHex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")

async function computeSha(text: string) {
  const enc = new TextEncoder().encode(text)
  const [sha1, sha256, sha512] = await Promise.all([
    crypto.subtle.digest("SHA-1",   enc),
    crypto.subtle.digest("SHA-256", enc),
    crypto.subtle.digest("SHA-512", enc),
  ])
  return { sha1: toHex(sha1), sha256: toHex(sha256), sha512: toHex(sha512) }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Hashes {
  md5:    string
  sha1:   string
  sha256: string
  sha512: string
}

// ── Component ─────────────────────────────────────────────────────────────────

const HASH_ROWS: { label: string; key: keyof Hashes; bits: string }[] = [
  { label: "MD5",     key: "md5",    bits: "128-bit" },
  { label: "SHA-1",   key: "sha1",   bits: "160-bit" },
  { label: "SHA-256", key: "sha256", bits: "256-bit" },
  { label: "SHA-512", key: "sha512", bits: "512-bit" },
]

export default function HashGenerator() {
  const [input, setInput] = useState("")
  const [hashes, setHashes] = useState<Hashes | null>(null)

  useEffect(() => {
    if (!input) { setHashes(null); return }
    let cancelled = false
    computeSha(input).then(sha => {
      if (!cancelled) setHashes({ md5: md5(input), ...sha })
    })
    return () => { cancelled = true }
  }, [input])

  return (
    <div className="mx-auto max-w-3xl">
      <Helmet>
        <title>Client-Side Cryptographic Hash Generator (MD5, SHA-256) | DevBits</title>
        <meta
          name="description"
          content="Generate secure MD5, SHA-1, SHA-256, and SHA-512 cryptographic hashes completely client-side in your browser."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hash Generator</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Generate MD5, SHA-1, SHA-256, and SHA-512 hashes instantly — 100% client-side.
        </p>
      </div>

      {/* Input */}
      <div className="mb-6 flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Input Text</label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type or paste any text to generate hashes…"
          rows={5}
          className="w-full resize-y rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
        />
      </div>

      {/* Hash output grid */}
      <div className="flex flex-col divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
        {HASH_ROWS.map(({ label, key, bits }) => (
          <div key={key} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex shrink-0 flex-row items-center gap-2 sm:w-28 sm:flex-col sm:items-start sm:gap-0.5">
              <span className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">
                {label}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{bits}</span>
            </div>

            <div className="flex flex-1 items-start gap-3">
              {hashes ? (
                <>
                  <span className="min-w-0 flex-1 break-all font-mono text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                    {hashes[key]}
                  </span>
                  <div className="shrink-0">
                    <CopyButton text={hashes[key]} />
                  </div>
                </>
              ) : (
                <span className="font-mono text-xs text-gray-300 dark:text-gray-600">
                  {input ? "computing…" : "—"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state hint */}
      {!input && (
        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          Hashes appear as you type — no button press needed
        </p>
      )}

      <ToolSeoSection
        steps={[
          "Type or paste any text into the input area. Hashes are recalculated on every keystroke with no button required.",
          "MD5 is computed synchronously using a pure TypeScript implementation of RFC 1321.",
          "SHA-1, SHA-256, and SHA-512 use the browser's built-in Web Crypto API (crypto.subtle), which is hardware-accelerated where available.",
          "Click any individual Copy button to copy that specific hash to your clipboard.",
        ]}
        faqs={[
          {
            q: "Is my text sent to a server?",
            a: "No. All hash computation runs entirely in your browser. MD5 is computed with a pure TypeScript implementation; SHA variants use the browser's built-in Web Crypto API. Nothing is transmitted over the network.",
          },
          {
            q: "Should I use MD5 for password hashing?",
            a: "No. MD5 and SHA-1 are cryptographically broken for security-critical use. For password storage, use a slow key-derivation function like bcrypt, scrypt, or Argon2. These tools are suitable for checksums and data integrity verification only.",
          },
          {
            q: "What is the difference between SHA-256 and SHA-512?",
            a: "Both are members of the SHA-2 family. SHA-256 produces a 256-bit (32-byte) digest and is the most widely used. SHA-512 produces a 512-bit (64-byte) digest and can be faster on 64-bit hardware due to its wider internal word size.",
          },
          {
            q: "What is the maximum input length?",
            a: "There is no hard limit imposed by the tool. Performance depends on your browser and hardware; inputs up to several megabytes typically hash in milliseconds.",
          },
        ]}
      />
    </div>
  )
}
