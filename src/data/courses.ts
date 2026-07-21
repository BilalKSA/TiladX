export interface Course {
  id: string
  tag: string
  title: string
  description: string
  disabled?: boolean
}

export const courses: Course[] = [
  {
    id: 'isef',
    tag: 'ISEF',
    title: 'دورة ISEF',
    description:
      'إعداد المشاركين في آيسف الدولي للعلوم والهندسة، من بناء فكرة المشروع البحثي إلى عرضها أمام لجنة التحكيم الدولية.',
  },
  {
    id: 'stem-racing',
    tag: 'STEM Racing',
    title: 'دورة STEM Racing',
    description:
      'تصميم وبناء والتنافس بسيارات مصغّرة، تجمع بين مهارات الهندسة والبرمجة والعمل الجماعي.',
    disabled: true,
  },
  {
    id: 'elo',
    tag: 'ELO',
    title: 'دورة ELO',
    description: 'إعداد الطلاب للمشاركة والتميز في مسابقات ELO.',
    disabled: true,
  },
]
