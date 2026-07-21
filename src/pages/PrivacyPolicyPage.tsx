import { Breadcrumbs } from "../components/ui/Breadcrumbs"
import { SeoMeta } from "../components/ui/SeoMeta"

export function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl py-10">
      <SeoMeta
        title="Privacy Policy | CronParser"
        description="How CronParser.org handles your data: what's stored locally in your browser, what Google Analytics collects, and how that could change if ads are added."
        path="/privacy"
      />

      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />

      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">Last updated: July 2026</p>

      <div className="prose prose-sm mt-6 max-w-none text-gray-600 dark:text-gray-300">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Summary</h2>
        <p>
          CronParser.org has no backend and no user accounts. Every tool on this site — the parser, the visual
          builder, the timezone converter, and so on — runs entirely in your browser. The cron expressions and
          schedules you enter are never transmitted to, or stored on, any server.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">What's stored locally</h2>
        <p>
          A small amount of data is saved in your browser's <code>localStorage</code> so the site remembers your
          preferences between visits. This never leaves your device:
        </p>
        <ul>
          <li>Your light/dark theme preference</li>
          <li>Favorited cron expressions and recent expression history, if you use the Favorites tool</li>
        </ul>
        <p>
          You can clear this at any time by clearing your browser's site data for cronparser.org, or by using the
          clear/delete controls inside the Favorites tool itself.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analytics and tracking</h2>
        <p>
          CronParser.org uses Google Analytics (GA4) to understand which pages and tools are actually useful, so
          the site can be improved over time. Google Analytics sets cookies and collects standard usage data —
          pages visited, approximate location (country/region level), device and browser type, and how you got to
          the site. It does not see the cron expressions or schedules you enter into any tool, since those never
          leave your browser in the first place.
        </p>
        <p>
          You can opt out of Google Analytics tracking using a browser extension like the{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Analytics Opt-out Browser Add-on
          </a>
          , or by blocking analytics scripts with an ad/tracker blocker. See{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google's Privacy Policy
          </a>{" "}
          for details on how Google itself handles this data.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Advertising</h2>
        <p>
          Some pages reserve space for advertisements. If and when ads are enabled, they will be served through a
          third-party network (such as Google AdSense), which may use cookies or similar technology to serve
          relevant ads and measure performance, as described in that network's own privacy policy. This page will
          be updated if and when that changes.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Third-party links</h2>
        <p>
          Platform guide pages link to official documentation on other sites (e.g. Kubernetes, AWS, GitHub). Once
          you leave cronparser.org, that site's own privacy policy applies.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Changes to this policy</h2>
        <p>
          If this site's data practices change further — for example, if ads are added — this page will be updated
          to reflect that.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contact</h2>
        <p>
          Questions about this policy can be raised via{" "}
          <a href="https://github.com/SangitThakuri/cronparser.org" target="_blank" rel="noopener noreferrer">
            the project's GitHub repository
          </a>
          .
        </p>
      </div>
    </div>
  )
}
