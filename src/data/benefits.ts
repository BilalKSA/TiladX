// The "why Tilad" claims. Shared by the landing page's short section and the
// dedicated /why page, which adds the `detail` paragraph on top.
//
// Locale-keyed: `getBenefits(locale)` returns the list for the active language.
// `photo` is a gallery id, so imagery keeps a single source of truth.
import type { Locale } from '../i18n'

export interface Benefit {
  photo: string
  title: string
  description: string
  /** Longer treatment, shown only on /why. */
  detail: string
}

const benefits: Record<Locale, Benefit[]> = {
  ar: [
    {
      photo: 'alumni',
      title: 'من ناس جرّبوها فعلاً',
      description: 'المحتوى مبني على تجارب طلاب وصلوا للمنافسات الدولية، مو على كلام نظري.',
      detail:
        'كل درس هنا كتبه أحد وقف قدّام لجنة تحكيم دولية فعلاً. يعني اللي تسمعه مو نظريات من كتاب، بل تفاصيل صغيرة تفرق: كيف تختصر فكرتك في جملة، وش السؤال اللي غالباً يجيك من المحكّم، ووين يضيع أغلب الطلاب وقتهم بدون فايدة.',
    },
    {
      photo: 'methodology',
      title: 'مسار واضح خطوة بخطوة',
      description: 'تعرف وش تسوي هذي الأسبوع ووش الخطوة اللي بعدها، بدون ما تحتار من وين تبدأ.',
      detail:
        'ما نعطيك مكتبة ونقول لك دبّر حالك. البرنامج مرتّب من أول تحديد الفكرة، مروراً بالبحث والتجربة وكتابة الورقة، لين تجهيز البوستر والعرض. كل مرحلة لها مخرج واضح تعرف إنك خلصتها، وتقدر ترجع لأي درس متى ما احتجته.',
    },
    {
      photo: 'working',
      title: 'معك أي وقت',
      description:
        'جلسات مباشرة تسأل فيها وتاخذ ملاحظات على مشروعك، ومكتبة فيها بوسترات وملفات ونماذج من مشاريع سابقة تبني عليها، وكل شي في مكان واحد من جوالك أو لابتوبك وقت ما تحتاجه.',
      detail:
        'الجلسات المباشرة تعطيك ملاحظات على مشروعك أنت بالذات، والمكتبة فيها بوسترات وأوراق ونماذج من مشاريع وصلت لمراحل متقدمة تقدر تبني عليها بدل ما تبدأ من ورقة بيضاء. وكل هذا في مكان واحد، من الجوال أو اللابتوب، وقت ما يناسبك.',
    },
  ],
  en: [
    {
      photo: 'alumni',
      title: 'From people who’ve actually done it',
      description:
        'The content is built on the experience of students who reached international competitions — not on theory.',
      detail:
        'Every lesson here was written by someone who actually stood before an international judging panel. So what you hear isn’t theory from a textbook — it’s the small details that make the difference: how to condense your idea into a single sentence, the question a judge is most likely to ask, and where most students waste their time for nothing.',
    },
    {
      photo: 'methodology',
      title: 'A clear step-by-step path',
      description: 'You’ll know what to do this week and what comes next, without wondering where to begin.',
      detail:
        'We don’t hand you a library and tell you to figure it out. The program is ordered from defining your idea, through research, experimentation and writing the paper, to preparing the poster and the presentation. Each stage has a clear output so you know you’ve finished it, and you can return to any lesson whenever you need it.',
    },
    {
      photo: 'working',
      title: 'With you anytime',
      description:
        'Live sessions where you ask questions and get feedback on your project, a library of posters, files and templates from past projects to build on — all in one place, on your phone or laptop whenever you need it.',
      detail:
        'The live sessions give you feedback on your own project specifically, and the library holds posters, papers and templates from projects that reached advanced stages, so you can build on them instead of starting from a blank page. And all of it is in one place, on your phone or laptop, whenever suits you.',
    },
  ],
}

export function getBenefits(locale: Locale): Benefit[] {
  return benefits[locale]
}
