// ⚠️ PLACEHOLDER FIGURES — NOT REAL.
//
// The numbers below are shape-only, so the /about impact strip can be designed
// and reviewed before the real ones exist. They are deliberately withheld from
// production: `IMPACT_READY` is false, and About renders the strip only in dev
// (`import.meta.env.DEV`). Nothing invented reaches tilad.org.
//
// To publish real figures: replace every `value` here, then flip IMPACT_READY
// to true. No layout change needed — the strip sizes itself to whatever is in
// this list, at three or four entries.
import type { Locale } from '../i18n'

/** Flip to `true` once every `value` below is a real, checkable figure. */
export const IMPACT_READY = false

export interface Stat {
  /** The figure itself. Kept a string so "+120" and "١٢٠" both work. */
  value: string
  label: string
  /** One line of provenance under the label — what the number counts. */
  note: string
}

const impact: Record<Locale, Stat[]> = {
  ar: [
    {
      value: '+120',
      label: 'طالب وطالبة',
      note: 'مرّوا ببرامج تلاد منذ انطلاقها',
    },
    {
      value: '+40',
      label: 'مشروع بحثي',
      note: 'اشتغلنا عليه مع أصحابه من الفكرة للعرض',
    },
    {
      value: '12',
      label: 'محفلاً علمياً',
      note: 'محلي ودولي وصلت له مشاريع طلابنا',
    },
    {
      value: '9',
      label: 'مرشدين',
      note: 'كلهم خاضوا المنافسة بأنفسهم قبل ما يرشدوا',
    },
  ],
  en: [
    {
      value: '120+',
      label: 'students',
      note: 'have been through a Tilad program since we started',
    },
    {
      value: '40+',
      label: 'research projects',
      note: 'worked on with their owners, from idea to presentation',
    },
    {
      value: '12',
      label: 'science fairs',
      note: 'local and international, reached by our students’ projects',
    },
    {
      value: '9',
      label: 'mentors',
      note: 'every one of them competed before they mentored',
    },
  ],
}

export function getImpact(locale: Locale): Stat[] {
  return impact[locale]
}
