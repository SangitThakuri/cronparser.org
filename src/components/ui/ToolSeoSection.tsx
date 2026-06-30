interface FaqItem {
  q: string
  a: string
}

interface ToolSeoSectionProps {
  howItWorks: string[]
  faqs: FaqItem[]
}

export function ToolSeoSection({ howItWorks, faqs }: ToolSeoSectionProps) {
  return (
    <div className="mt-12 border-t border-gray-100 pt-10 text-gray-400 dark:border-gray-800 dark:text-gray-600">
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest">
          How it works
        </h2>
        {howItWorks.map((p, i) => (
          <p key={i} className="mb-2 text-sm leading-relaxed">
            {p}
          </p>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest">
          Frequently asked questions
        </h2>
        <dl className="space-y-4">
          {faqs.map((item, i) => (
            <div key={i}>
              <dt className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-500">
                {item.q}
              </dt>
              <dd className="text-sm leading-relaxed">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
