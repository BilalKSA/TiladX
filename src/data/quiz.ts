// Three-question quiz on the landing page. Each answer votes for one course
// slug; the slug with the most votes wins.
//
// Locale-keyed: the *structure* (question ids, option ids, and which slug each
// option votes for) is language-independent and drives recommendSlug; only the
// prompts and labels translate. `getQuiz(locale)` merges the two.
//
// Courses themselves live in Postgres (admin-editable), so this file deals only
// in slugs — ProgramQuiz looks the winning slug up against the live list.
import type { Locale } from '../i18n'

export interface QuizOption {
  id: string
  label: string
  /** Which course slug this answer votes for. */
  votes: string
}

export interface QuizQuestion {
  id: string
  prompt: string
  options: QuizOption[]
}

/** Language-independent skeleton: ids and vote targets. */
const structure: { id: string; options: { id: string; votes: string }[] }[] = [
  {
    id: 'stage',
    options: [
      { id: 'middle', votes: 'stem-racing' },
      { id: 'high', votes: 'isef' },
      { id: 'uni', votes: 'elo' },
    ],
  },
  {
    id: 'interest',
    options: [
      { id: 'research', votes: 'isef' },
      { id: 'building', votes: 'stem-racing' },
      { id: 'leading', votes: 'elo' },
    ],
  },
  {
    id: 'goal',
    options: [
      { id: 'international', votes: 'isef' },
      { id: 'build', votes: 'stem-racing' },
      { id: 'skills', votes: 'elo' },
    ],
  },
]

const text: Record<Locale, { prompts: Record<string, string>; options: Record<string, string> }> = {
  ar: {
    prompts: {
      stage: 'وش المرحلة اللي أنت فيها الحين؟',
      interest: 'أي مجال يشدّك أكثر؟',
      goal: 'وش تبي توصل له؟',
    },
    options: {
      middle: 'المرحلة المتوسطة',
      high: 'المرحلة الثانوية',
      uni: 'جامعي أو متخرج',
      research: 'البحث العلمي والتجارب',
      building: 'الهندسة والتصميم والبرمجة',
      leading: 'القيادة والتنظيم والعمل ضمن فريق',
      international: 'أشارك بمشروع بحثي في مسابقة دولية',
      build: 'أبني شي بيدي وأتنافس فيه مع فريقي',
      skills: 'أطوّر مهاراتي وأقوّي سيرتي الذاتية',
    },
  },
  en: {
    prompts: {
      stage: 'What stage are you in right now?',
      interest: 'Which field pulls you in most?',
      goal: 'What do you want to achieve?',
    },
    options: {
      middle: 'Middle school',
      high: 'High school',
      uni: 'University or graduate',
      research: 'Scientific research and experiments',
      building: 'Engineering, design and programming',
      leading: 'Leadership, organizing and teamwork',
      international: 'Enter a research project in an international competition',
      build: 'Build something with my hands and compete with my team',
      skills: 'Grow my skills and strengthen my résumé',
    },
  },
}

/** Tie-break order — earlier wins a dead heat. */
const PRIORITY = ['isef', 'stem-racing', 'elo']

export function getQuiz(locale: Locale): QuizQuestion[] {
  const t = text[locale]
  return structure.map((question) => ({
    id: question.id,
    prompt: t.prompts[question.id],
    options: question.options.map((option) => ({
      id: option.id,
      label: t.options[option.id],
      votes: option.votes,
    })),
  }))
}

/** Tallies the answers and returns the winning course slug. Reads the shared
 *  structure, so it needs no locale. */
export function recommendSlug(answers: Record<string, string>): string {
  const tally = new Map<string, number>()

  for (const question of structure) {
    const chosen = question.options.find((option) => option.id === answers[question.id])
    if (!chosen) continue
    tally.set(chosen.votes, (tally.get(chosen.votes) ?? 0) + 1)
  }

  let winner = PRIORITY[0]
  let best = -1
  for (const slug of PRIORITY) {
    const score = tally.get(slug) ?? 0
    if (score > best) {
      best = score
      winner = slug
    }
  }

  return winner
}
