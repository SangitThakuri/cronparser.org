import { useState, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { ToolSeoSection } from "../../components/ui/ToolSeoSection"

interface StatusCode {
  code: number
  name: string
  description: string
}

interface Category {
  label: string
  range: string
  bgColor: string
  textColor: string
  borderColor: string
  badgeColor: string
  codes: StatusCode[]
}

const CATEGORIES: Category[] = [
  {
    label: "1xx Informational",
    range: "100–199",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    textColor: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    codes: [
      { code: 100, name: "Continue", description: "The server has received the request headers and the client should proceed to send the request body." },
      { code: 101, name: "Switching Protocols", description: "The requester has asked the server to switch protocols and the server has agreed to do so." },
      { code: 102, name: "Processing", description: "The server has received and is processing the request, but no response is available yet." },
      { code: 103, name: "Early Hints", description: "Used to return some response headers before the final HTTP message, often for preloading resources." },
    ],
  },
  {
    label: "2xx Success",
    range: "200–299",
    bgColor: "bg-green-50 dark:bg-green-950/40",
    textColor: "text-green-700 dark:text-green-300",
    borderColor: "border-green-200 dark:border-green-800",
    badgeColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    codes: [
      { code: 200, name: "OK", description: "The request succeeded. The meaning depends on the HTTP method: GET returns the resource, POST returns the result of an action." },
      { code: 201, name: "Created", description: "The request succeeded and a new resource was created as a result. Typically the response of a POST or PUT request." },
      { code: 202, name: "Accepted", description: "The request has been received but not yet acted upon. It is intended for cases where another process or server handles the request." },
      { code: 203, name: "Non-Authoritative Information", description: "The returned metadata is not exactly the same as is available from the origin server — a transformed or cached copy." },
      { code: 204, name: "No Content", description: "There is no content to send for this request, but the headers may be useful. Used by DELETE and PUT to signal success without a body." },
      { code: 205, name: "Reset Content", description: "Tells the user agent to reset the document which sent this request." },
      { code: 206, name: "Partial Content", description: "This response code is used when the Range header is sent from the client to request only part of a resource." },
      { code: 207, name: "Multi-Status", description: "Conveys information about multiple resources, for situations where multiple status codes might be appropriate (WebDAV)." },
      { code: 208, name: "Already Reported", description: "Used inside a DAV propstat response element to avoid enumerating the internal members of multiple bindings to the same collection." },
      { code: 226, name: "IM Used", description: "The server has fulfilled a GET request and the response is a representation of the result of one or more instance-manipulations applied to the current instance." },
    ],
  },
  {
    label: "3xx Redirection",
    range: "300–399",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/40",
    textColor: "text-yellow-700 dark:text-yellow-300",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    badgeColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    codes: [
      { code: 300, name: "Multiple Choices", description: "The request has more than one possible response. The user agent or user should choose one of them." },
      { code: 301, name: "Moved Permanently", description: "The URL of the requested resource has been changed permanently. The new URL is given in the Location response header." },
      { code: 302, name: "Found", description: "The URI of requested resource has been changed temporarily. Future requests should use the original URI." },
      { code: 303, name: "See Other", description: "The server sent this response to direct the client to get the requested resource at another URI with a GET request." },
      { code: 304, name: "Not Modified", description: "Used for caching. Tells the client that the response has not been modified, so the client can continue to use the same cached version." },
      { code: 307, name: "Temporary Redirect", description: "The server sends this response to direct the client to get the resource at another URI using the same method as the prior request." },
      { code: 308, name: "Permanent Redirect", description: "The resource is now permanently located at another URI. The client must use the same HTTP method as before." },
    ],
  },
  {
    label: "4xx Client Error",
    range: "400–499",
    bgColor: "bg-orange-50 dark:bg-orange-950/40",
    textColor: "text-orange-700 dark:text-orange-300",
    borderColor: "border-orange-200 dark:border-orange-800",
    badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    codes: [
      { code: 400, name: "Bad Request", description: "The server cannot process the request due to a client error — malformed syntax, invalid request message framing, or deceptive request routing." },
      { code: 401, name: "Unauthorized", description: "The client must authenticate itself to get the requested response. Credentials are missing or invalid." },
      { code: 402, name: "Payment Required", description: "Reserved for future use. Originally created for digital payment systems; rarely used in practice." },
      { code: 403, name: "Forbidden", description: "The client does not have access rights to the content. Unlike 401, the client's identity is known to the server." },
      { code: 404, name: "Not Found", description: "The server cannot find the requested resource. The URL is not recognized or the resource doesn't exist." },
      { code: 405, name: "Method Not Allowed", description: "The request method is known by the server but is not supported by the target resource (e.g. DELETE on a read-only resource)." },
      { code: 406, name: "Not Acceptable", description: "The server cannot produce a response matching the list of acceptable values defined in the request's Accept headers." },
      { code: 407, name: "Proxy Authentication Required", description: "Authentication must be done by a proxy." },
      { code: 408, name: "Request Timeout", description: "The server timed out waiting for the request. The client may repeat the request without modifications." },
      { code: 409, name: "Conflict", description: "The request conflicts with the current state of the server (e.g. editing conflict in a version control system)." },
      { code: 410, name: "Gone", description: "The requested content has been permanently deleted from the server with no forwarding address." },
      { code: 411, name: "Length Required", description: "The server rejected the request because the Content-Length header field is not defined." },
      { code: 412, name: "Precondition Failed", description: "The client has indicated preconditions in its headers which the server does not meet." },
      { code: 413, name: "Content Too Large", description: "The request entity is larger than limits defined by the server." },
      { code: 414, name: "URI Too Long", description: "The URI requested by the client is longer than the server is willing to interpret." },
      { code: 415, name: "Unsupported Media Type", description: "The media format of the requested data is not supported by the server." },
      { code: 416, name: "Range Not Satisfiable", description: "The range specified by the Range header field in the request cannot be fulfilled." },
      { code: 417, name: "Expectation Failed", description: "The expectation given in the Expect request header field cannot be met by the server." },
      { code: 418, name: "I'm a Teapot", description: "The server refuses to brew coffee because it is a teapot (RFC 2324, April Fools). Used by some services for intentional rejections." },
      { code: 421, name: "Misdirected Request", description: "The request was directed at a server that is not able to produce a response." },
      { code: 422, name: "Unprocessable Content", description: "The request was well-formed but could not be followed due to semantic errors." },
      { code: 423, name: "Locked", description: "The resource that is being accessed is locked (WebDAV)." },
      { code: 424, name: "Failed Dependency", description: "The request failed because it depended on another request that failed (WebDAV)." },
      { code: 425, name: "Too Early", description: "The server is unwilling to risk processing a request that might be replayed." },
      { code: 426, name: "Upgrade Required", description: "The server refuses to perform the request using the current protocol." },
      { code: 428, name: "Precondition Required", description: "The origin server requires the request to be conditional to prevent the 'lost update' problem." },
      { code: 429, name: "Too Many Requests", description: "The user has sent too many requests in a given amount of time (rate limiting)." },
      { code: 431, name: "Request Header Fields Too Large", description: "The server is unwilling to process the request because its header fields are too large." },
      { code: 451, name: "Unavailable For Legal Reasons", description: "The user agent requested a resource that cannot legally be provided, such as a page censored by a government." },
    ],
  },
  {
    label: "5xx Server Error",
    range: "500–599",
    bgColor: "bg-red-50 dark:bg-red-950/40",
    textColor: "text-red-700 dark:text-red-300",
    borderColor: "border-red-200 dark:border-red-800",
    badgeColor: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    codes: [
      { code: 500, name: "Internal Server Error", description: "The server encountered an unexpected condition that prevented it from fulfilling the request." },
      { code: 501, name: "Not Implemented", description: "The request method is not supported by the server and cannot be handled." },
      { code: 502, name: "Bad Gateway", description: "The server, while working as a gateway, received an invalid response from the upstream server." },
      { code: 503, name: "Service Unavailable", description: "The server is not ready to handle the request. Common causes are a server down for maintenance or overloaded." },
      { code: 504, name: "Gateway Timeout", description: "The server, while acting as a gateway, did not get a response in time from the upstream server." },
      { code: 505, name: "HTTP Version Not Supported", description: "The HTTP version used in the request is not supported by the server." },
      { code: 506, name: "Variant Also Negotiates", description: "The server has an internal configuration error: transparent content negotiation results in a circular reference." },
      { code: 507, name: "Insufficient Storage", description: "The server is unable to store the representation needed to complete the request (WebDAV)." },
      { code: 508, name: "Loop Detected", description: "The server detected an infinite loop while processing the request (WebDAV)." },
      { code: 510, name: "Not Extended", description: "Further extensions to the request are required for the server to fulfill it." },
      { code: 511, name: "Network Authentication Required", description: "The client needs to authenticate to gain network access (e.g. a captive portal)." },
    ],
  },
]

export default function HttpStatusCodes() {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CATEGORIES
    return CATEGORIES.map((cat) => ({
      ...cat,
      codes: cat.codes.filter(
        (c) =>
          String(c.code).includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.codes.length > 0)
  }, [query])

  return (
    <div className="mx-auto max-w-3xl">
      <Helmet>
        <title>HTTP Status Code Reference — All Codes Explained | DevBits</title>
        <meta
          name="description"
          content="Complete reference for all HTTP status codes — 1xx informational through 5xx server errors, with plain-English descriptions."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          HTTP Status Codes
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Complete reference for all standard HTTP status codes with plain-English descriptions.
        </p>
      </div>

      <div className="mb-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by code, name, or description…"
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-colors"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500">
          No status codes match your search.
        </p>
      )}

      <div className="flex flex-col gap-6">
        {filtered.map((cat) => (
          <div
            key={cat.label}
            className={`overflow-hidden rounded-xl border ${cat.borderColor}`}
          >
            <div className={`px-4 py-3 ${cat.bgColor}`}>
              <span className={`text-sm font-semibold ${cat.textColor}`}>{cat.label}</span>
              <span className={`ml-2 text-xs opacity-70 ${cat.textColor}`}>{cat.range}</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {cat.codes.map((c) => (
                <div key={c.code} className="flex gap-4 px-4 py-3">
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 font-mono text-sm font-bold ${cat.badgeColor} self-start`}
                  >
                    {c.code}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {c.name}
                    </div>
                    <div className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      {c.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ToolSeoSection
        steps={[
          "Browse all HTTP status codes grouped by category: 1xx Informational, 2xx Success, 3xx Redirection, 4xx Client Error, 5xx Server Error.",
          "Use the search box to filter by code number, name, or description keyword.",
        ]}
        faqs={[
          {
            q: "What is the difference between 401 and 403?",
            a: "401 (Unauthorized) means the client must authenticate — credentials are missing or invalid. 403 (Forbidden) means the server understood the request but refuses to authorize it — authentication would not help.",
          },
          {
            q: "When should I use 404 vs 410?",
            a: "Use 404 (Not Found) when the resource may exist in the future. Use 410 (Gone) when the resource has been permanently removed and will not return.",
          },
          {
            q: "What is the difference between 301 and 308?",
            a: "Both are permanent redirects, but 301 allows the client to change the HTTP method (typically from POST to GET), while 308 requires the client to use the same HTTP method as the original request.",
          },
        ]}
      />
    </div>
  )
}
