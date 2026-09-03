/** Shared shape for the two legal pages, so a clause is data rather than
 *  hand-built markup. Clauses are numbered in source order — the number is
 *  what a support email points at, so don't reorder them casually. */
export interface Clause {
  title: string
  /** Body paragraphs, in order. */
  body?: string[]
  /** Bulleted items, rendered after the paragraphs. */
  points?: string[]
}

interface LegalBodyProps {
  /** Rendered above the first clause, e.g. "آخر تحديث: ٣ سبتمبر ٢٠٢٦". */
  updated: string
  intro: string[]
  clauses: Clause[]
}

function LegalBody({ updated, intro, clauses }: LegalBodyProps) {
  return (
    <div className="tld-prose">
      <p className="tld-prose__updated">{updated}</p>

      {intro.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      {clauses.map((clause, index) => (
        <section className="tld-prose__clause" key={clause.title}>
          <h2>
            {index + 1}. {clause.title}
          </h2>

          {clause.body?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          {clause.points && (
            <ul>
              {clause.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}

export default LegalBody
