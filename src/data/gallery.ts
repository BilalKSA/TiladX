// Photo strip on the landing page.
//
// No real photos exist in the repo yet, so every item below renders as a
// branded placeholder tile. To use a real photo:
//   1. drop the file into public/assets/gallery/
//   2. set `src` on the matching item, e.g. src: '/assets/gallery/isef-2025.jpg'
// Nothing else needs to change — the tile swaps from placeholder to image.
//
// Landscape (4:3-ish) crops look best. Keep files under ~300KB.

export interface GalleryItem {
  id: string
  /** Shown under the photo, and as the placeholder label until `src` is set. */
  caption: string
  /** Program/context label shown as a small pill on the tile. */
  tag: string
  /** Path under public/ — leave undefined to keep the placeholder. */
  src?: string
}

export const gallery: GalleryItem[] = [
  { id: 'isef-booth', tag: 'ISEF', caption: 'عرض المشاريع أمام لجنة التحكيم' },
  { id: 'isef-poster', tag: 'ISEF', caption: 'بوسترات الطلاب المشاركين' },
  { id: 'stem-pit', tag: 'STEM Racing', caption: 'ورشة تجهيز السيارة' },
  { id: 'stem-track', tag: 'STEM Racing', caption: 'يوم السباق' },
  { id: 'team-work', tag: 'تلاد', caption: 'جلسات العمل الجماعي' },
  { id: 'mentoring', tag: 'تلاد', caption: 'إرشاد مباشر من طلاب سبقوك' },
  { id: 'awards', tag: 'إنجازات', caption: 'لحظة تتويج الفائزين' },
  { id: 'workshop', tag: 'تلاد', caption: 'ورش تدريبية حضورية' },
]
