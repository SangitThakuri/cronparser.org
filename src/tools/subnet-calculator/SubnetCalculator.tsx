import { useState } from "react"
import { Helmet } from "react-helmet-async"
import { CopyButton } from "../../components/ui/CopyButton"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

function ipToNum(ip: string): number {
  return ip.split(".").reduce((acc, oct) => ((acc << 8) | parseInt(oct, 10)) >>> 0, 0)
}

function numToIp(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join(".")
}

function isValidIp(ip: string): boolean {
  const parts = ip.split(".")
  return (
    parts.length === 4 &&
    parts.every((p) => {
      const n = Number(p)
      return p !== "" && !isNaN(n) && Number.isInteger(n) && n >= 0 && n <= 255
    })
  )
}

interface SubnetResult {
  networkAddress: string
  broadcastAddress: string
  subnetMask: string
  wildcardMask: string
  firstHost: string
  lastHost: string
  usableHosts: number
  totalHosts: number
  cidr: number
  ipClass: string
  binaryMask: string
}

function calculate(ip: string, cidr: number): SubnetResult | null {
  if (!isValidIp(ip) || cidr < 0 || cidr > 32) return null

  const mask = cidr === 0 ? 0 : (((~0) << (32 - cidr)) >>> 0)
  const ipNum = ipToNum(ip)
  const network = (ipNum & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  const totalHosts = Math.pow(2, 32 - cidr)
  const usableHosts = cidr >= 31 ? totalHosts : Math.max(0, totalHosts - 2)

  const firstOctet = (ipNum >>> 24) & 0xff
  const ipClass =
    firstOctet < 128 ? "A" :
    firstOctet < 192 ? "B" :
    firstOctet < 224 ? "C" :
    firstOctet < 240 ? "D (Multicast)" :
    "E (Reserved)"

  const binaryMask = Array.from({ length: 4 }, (_, i) => {
    return ((mask >>> (24 - i * 8)) & 0xff).toString(2).padStart(8, "0")
  }).join(".")

  return {
    networkAddress: numToIp(network),
    broadcastAddress: numToIp(broadcast),
    subnetMask: numToIp(mask),
    wildcardMask: numToIp(~mask >>> 0),
    firstHost: cidr >= 31 ? numToIp(network) : numToIp(network + 1),
    lastHost: cidr >= 31 ? numToIp(broadcast) : numToIp(broadcast - 1),
    usableHosts,
    totalHosts,
    cidr,
    ipClass,
    binaryMask,
  }
}

export default function SubnetCalculator() {
  const [ip, setIp] = useState("192.168.1.0")
  const [cidr, setCidr] = useState(24)

  const result = calculate(ip, cidr)
  const inputInvalid = !isValidIp(ip) || cidr < 0 || cidr > 32

  const rows: { label: string; value: string }[] = result
    ? [
        { label: "Network Address", value: result.networkAddress },
        { label: "Broadcast Address", value: result.broadcastAddress },
        { label: "Subnet Mask", value: result.subnetMask },
        { label: "Wildcard Mask", value: result.wildcardMask },
        { label: "Binary Subnet Mask", value: result.binaryMask },
        { label: "First Usable Host", value: result.firstHost },
        { label: "Last Usable Host", value: result.lastHost },
        { label: "Usable Hosts", value: result.usableHosts.toLocaleString() },
        { label: "Total Addresses", value: result.totalHosts.toLocaleString() },
        { label: "IP Class", value: result.ipClass },
        { label: "CIDR Notation", value: `${result.networkAddress}/${result.cidr}` },
      ]
    : []

  return (
    <div className="mx-auto max-w-2xl">
      <Helmet>
        <title>IPv4 Subnet Calculator — CIDR, Mask & Host Range | DevBits</title>
        <meta
          name="description"
          content="Calculate network address, broadcast, subnet mask, wildcard mask, and usable host range for any IPv4 CIDR block instantly."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Subnet Calculator</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Calculate network address, mask, broadcast, and host range for any IPv4 CIDR block.
        </p>
      </div>

      {/* Inputs */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            IP Address
          </label>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="192.168.1.0"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-mono text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
          />
        </div>
        <div className="flex w-36 flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            CIDR Prefix
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-medium text-gray-400">/</span>
            <input
              type="number"
              min={0}
              max={32}
              value={cidr}
              onChange={(e) => setCidr(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 font-mono text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
            />
          </div>
        </div>
      </div>

      {inputInvalid && (ip || cidr !== 24) && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          Enter a valid IPv4 address (e.g. 192.168.1.0) and a prefix length between 0 and 32.
        </div>
      )}

      {result && (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          {rows.map(({ label, value }, i) => (
            <div
              key={label}
              className={`flex items-center justify-between gap-4 px-4 py-3 ${
                i % 2 === 0
                  ? "bg-white dark:bg-gray-900"
                  : "bg-gray-50 dark:bg-gray-800/50"
              }`}
            >
              <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">{label}</span>
              <div className="flex min-w-0 items-center gap-2">
                <span className="break-all font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                  {value}
                </span>
                <div className="shrink-0">
                  <CopyButton text={value} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ToolSeoSection
        steps={[
          "Enter an IPv4 address in the first field (e.g. 192.168.1.0).",
          "Enter the CIDR prefix length (0–32) in the second field — /24 equals 255.255.255.0.",
          "Results update instantly: network address, broadcast, subnet mask, wildcard mask, binary mask, and host range.",
          "Click the copy icon next to any value to copy it to your clipboard.",
        ]}
        faqs={[
          {
            q: "What is CIDR notation?",
            a: "CIDR (Classless Inter-Domain Routing) notation expresses an IP address and its routing prefix length as a single string (e.g. 192.168.1.0/24). The prefix length determines the subnet mask.",
          },
          {
            q: "What are usable hosts vs. total addresses?",
            a: "In most subnets, the first address is the network identifier and the last is the broadcast address — neither can be assigned to a host. Usable hosts = total addresses − 2. /31 and /32 subnets follow different rules per RFC 3021.",
          },
          {
            q: "What is the wildcard mask?",
            a: "The wildcard mask is the bitwise inverse of the subnet mask. It is used in access control lists (ACLs) on routers and firewalls to specify which bits of an address to match.",
          },
        ]}
      />
    </div>
  )
}
