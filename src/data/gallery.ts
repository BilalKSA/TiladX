// Photo strip on the landing page.
//
// Locale-keyed: `getGallery(locale)` merges the shared image list (id + src)
// with per-locale captions and tags. The id and src are language-independent,
// so imagery has a single source of truth; only the words change.
//
// To use a real photo: drop the file into public/assets/Gallery/ and set `src`
// in `photos` below. Landscape (4:3-ish) crops look best; keep files ~300KB.
import type { Locale } from '../i18n'

export interface GalleryItem {
  id: string
  /** Shown under the photo, and as the placeholder label until `src` is set. */
  caption: string
  /** Program/context label shown as a small pill on the tile. */
  tag: string
  /** Path under public/ — leave undefined to keep the placeholder. */
  src?: string
}

/** Shared, language-independent: which photo each id points at. */
const photos: { id: string; src?: string }[] = [
  { id: 'alumni', src: '/assets/Gallery/AlumniTalk.jpg' },
  { id: 'methodology', src: '/assets/Gallery/Methodology.jpg' },
  { id: 'lab', src: '/assets/Gallery/LabWork.jpg' },
  { id: 'presenting', src: '/assets/Gallery/PresentationSkills.jpg' },
  { id: 'working', src: '/assets/Gallery/ProjectWork.jpg' },
  { id: 'isef-talk', src: '/assets/Gallery/IsefTalk.jpg' },
  { id: 'audience', src: '/assets/Gallery/Attendees.jpg' },
]

const text: Record<Locale, Record<string, { tag: string; caption: string }>> = {
  ar: {
    alumni: { tag: 'ISEF', caption: 'مرشد يشارك تجربته في آيسف' },
    methodology: { tag: 'تلاد', caption: 'جلسة منهجية البحث' },
    lab: { tag: 'ISEF', caption: 'تجارب داخل المختبر' },
    presenting: { tag: 'تلاد', caption: 'ورشة مهارات العرض' },
    working: { tag: 'تلاد', caption: 'شغل مباشر على المشاريع' },
    'isef-talk': { tag: 'ISEF', caption: 'شرح مشروع آيسف قدّام الطلاب' },
    audience: { tag: 'تلاد', caption: 'حضور وتركيز في الجلسات' },
  },
  en: {
    alumni: { tag: 'ISEF', caption: 'A mentor sharing their ISEF experience' },
    methodology: { tag: 'Tilad', caption: 'A research-methodology session' },
    lab: { tag: 'ISEF', caption: 'Experiments in the lab' },
    presenting: { tag: 'Tilad', caption: 'A presentation-skills workshop' },
    working: { tag: 'Tilad', caption: 'Hands-on project work' },
    'isef-talk': { tag: 'ISEF', caption: 'Presenting an ISEF project to students' },
    audience: { tag: 'Tilad', caption: 'An engaged audience in the sessions' },
  },
}

export function getGallery(locale: Locale): GalleryItem[] {
  const t = text[locale]
  return photos.map((photo) => ({
    id: photo.id,
    src: photo.src,
    tag: t[photo.id].tag,
    caption: t[photo.id].caption,
  }))
}
