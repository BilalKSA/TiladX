// Three-question quiz on the landing page. Each answer votes for one course
// slug; the slug with the most votes wins.
//
// Courses themselves now live in Postgres (admin-editable), so this file deals
// only in slugs — ProgramQuiz looks the winning slug up against the live list.

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

/** Tie-break order — earlier wins a dead heat. */
const PRIORITY = ['isef', 'stem-racing', 'elo']

export const quiz: QuizQuestion[] = [
  {
    id: 'stage',
    prompt: 'وش المرحلة اللي أنت فيها الحين؟',
    options: [
      { id: 'middle', label: 'المرحلة المتوسطة', votes: 'stem-racing' },
      { id: 'high', label: 'المرحلة الثانوية', votes: 'isef' },
      { id: 'uni', label: 'جامعي أو متخرج', votes: 'elo' },
    ],
  },
  {
    id: 'interest',
    prompt: 'أي مجال يشدّك أكثر؟',
    options: [
      { id: 'research', label: 'البحث العلمي والتجارب', votes: 'isef' },
      { id: 'building', label: 'الهندسة والتصميم والبرمجة', votes: 'stem-racing' },
      { id: 'leading', label: 'القيادة والتنظيم والعمل ضمن فريق', votes: 'elo' },
    ],
  },
  {
    id: 'goal',
    prompt: 'وش تبي توصل له؟',
    options: [
      { id: 'international', label: 'أشارك بمشروع بحثي في مسابقة دولية', votes: 'isef' },
      { id: 'build', label: 'أبني شي بيدي وأتنافس فيه مع فريقي', votes: 'stem-racing' },
      { id: 'skills', label: 'أطوّر مهاراتي وأقوّي سيرتي الذاتية', votes: 'elo' },
    ],
  },
]

/** Tallies the answers and returns the winning course slug. */
export function recommendSlug(answers: Record<string, string>): string {
  const tally = new Map<string, number>()

  for (const question of quiz) {
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
