import { useEffect, useState, type FormEvent } from 'react'
import Button from './Button'
import { quiz, recommendSlug } from '../data/quiz'
import { submitLead } from '../lib/leads'
import { listCourses, type Course } from '../lib/content'
// Login.css owns the shared .tld-field / .tld-field__input form styles.
import '../pages/Login.css'
import './ProgramQuiz.css'

type Stage = { kind: 'questions'; index: number } | { kind: 'form' } | { kind: 'done' }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function ProgramQuiz() {
  const [stage, setStage] = useState<Stage>({ kind: 'questions', index: 0 })
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<Course | null>(null)
  const [courses, setCourses] = useState<Course[]>([])

  // Courses are admin-editable, so the recommendation resolves against the
  // live list rather than a hardcoded copy.
  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch(() => {})
  }, [])

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const total = quiz.length

  function goNext(index: number) {
    if (index + 1 < total) {
      setStage({ kind: 'questions', index: index + 1 })
      return
    }
    const slug = recommendSlug(answers)
    setResult(courses.find((course) => course.slug === slug) ?? courses[0] ?? null)
    setStage({ kind: 'form' })
  }

  function restart() {
    setAnswers({})
    setResult(null)
    setFullName('')
    setEmail('')
    setError('')
    setStage({ kind: 'questions', index: 0 })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!fullName.trim()) {
      setError('اكتب اسمك عشان نعرف نخاطبك.')
      return
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('تأكد من بريدك الإلكتروني، يبدو فيه شي ناقص.')
      return
    }

    setLoading(true)
    try {
      await submitLead({
        fullName,
        email,
        recommendedProgram: result?.slug ?? recommendSlug(answers),
        answers,
      })
      setStage({ kind: 'done' })
    } catch {
      setError('ما قدرنا نستقبل بياناتك الحين، حاول مرة ثانية بعد شوي.')
    } finally {
      setLoading(false)
    }
  }

  if (stage.kind === 'done') {
    return (
      <div className="tld-quiz">
        <div className="tld-quiz__done">
          <div className="tld-quiz__done-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m4 12.5 5.2 5.2L20 7" />
            </svg>
          </div>
          <h3>وصلنا طلبك، شكراً {fullName.trim().split(' ')[0]} 👋</h3>
          <p>
            سجّلنا اهتمامك بـ <strong>{result?.title}</strong>. بنرسل لك تفاصيل البرنامج وخطوات المشاركة على بريدك قريباً.
          </p>
          <p className="tld-quiz__hint">
            لو ما وصلتك الرسالة، تأكد من مجلد الرسائل غير المرغوب فيها (Spam).
          </p>
          <button type="button" className="tld-quiz__restart" onClick={restart}>
            جرّب الاختبار مرة ثانية
          </button>
        </div>
      </div>
    )
  }

  if (stage.kind === 'form') {
    return (
      <div className="tld-quiz">
        <div className="tld-quiz__result">
          <span className="tld-pill-tag tld-pill-tag--outline">الأنسب لك</span>
          <h3>{result?.title}</h3>
          <p>{result?.description}</p>
        </div>

        <form className="tld-quiz__form" onSubmit={handleSubmit}>
          <p className="tld-quiz__form-intro">اكتب اسمك وبريدك ونرسل لك التفاصيل الكاملة.</p>

          <label className="tld-field">
            <span className="tld-field__label">الاسم</span>
            <input
              className="tld-field__input"
              type="text"
              autoComplete="name"
              placeholder="اسمك الكامل"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>

          <label className="tld-field">
            <span className="tld-field__label">البريد الإلكتروني</span>
            <input
              className="tld-field__input"
              type="email"
              autoComplete="email"
              dir="ltr"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          {error && (
            <p className="tld-quiz__error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" loading={loading}>
            أرسل لي التفاصيل
          </Button>

          <button type="button" className="tld-quiz__restart" onClick={restart}>
            ابدأ من جديد
          </button>
        </form>
      </div>
    )
  }

  const question = quiz[stage.index]
  const selected = answers[question.id]

  return (
    <div className="tld-quiz">
      <div className="tld-quiz__progress">
        <span className="tld-quiz__step">
          سؤال {stage.index + 1} من {total}
        </span>
        <div className="tld-quiz__bar" role="presentation">
          <span style={{ inlineSize: `${((stage.index + 1) / total) * 100}%` }} />
        </div>
      </div>

      <fieldset className="tld-quiz__fieldset">
        <legend className="tld-quiz__prompt">{question.prompt}</legend>

        <div className="tld-quiz__options">
          {question.options.map((option) => (
            <label
              key={option.id}
              className={`tld-quiz__option${selected === option.id ? ' tld-quiz__option--active' : ''}`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={selected === option.id}
                onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="tld-quiz__nav">
        {stage.index > 0 && (
          <button
            type="button"
            className="tld-quiz__restart"
            onClick={() => setStage({ kind: 'questions', index: stage.index - 1 })}
          >
            رجوع
          </button>
        )}
        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={!selected}
          onClick={() => goNext(stage.index)}
        >
          {stage.index + 1 === total ? 'اعرض النتيجة' : 'التالي'}
        </Button>
      </div>
    </div>
  )
}

export default ProgramQuiz
