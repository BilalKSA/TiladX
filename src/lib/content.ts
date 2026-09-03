import { supabase } from './supabase'

// Read side of the content model. RLS restricts these to published rows for
// everyone except admins, so no filtering is needed here.

export interface Course {
  id: string
  slug: string
  tag: string
  title: string
  description: string | null
  thumbnail_path: string | null
  position: number
  published: boolean
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string | null
  video_url: string | null
  duration_minutes: number | null
  position: number
  published: boolean
}

export interface LibraryAsset {
  id: string
  /** Owning program. null = general material, shown inside every program. */
  course_id: string | null
  title: string
  category: LibraryCategory
  description: string | null
  file_path: string | null
  external_url: string | null
  position: number
  published: boolean
}

export interface Mentor {
  id: string
  name: string
  title: string | null
  bio: string | null
  photo_path: string | null
  /** Free-text track, e.g. "بحث علمي". The /mentors filter chips are derived
   *  from the distinct values across published mentors, so an empty column
   *  simply means no filter bar. */
  track: string | null
  position: number
  published: boolean
}

export type LibraryCategory = 'papers' | 'posters' | 'presentations' | 'plans' | 'templates' | 'videos'

export const LIBRARY_CATEGORIES: { value: LibraryCategory; label: string }[] = [
  { value: 'papers', label: 'أوراق بحثية' },
  { value: 'posters', label: 'بوسترات علمية' },
  { value: 'presentations', label: 'عروض تقديمية' },
  { value: 'plans', label: 'مخططات البحث' },
  { value: 'templates', label: 'نماذج وتقارير' },
  { value: 'videos', label: 'فيديوهات تعليمية' },
]

export function categoryLabel(category: string): string {
  return LIBRARY_CATEGORIES.find((c) => c.value === category)?.label ?? category
}

/** Public URL for a file in one of the storage buckets. */
export function fileUrl(bucket: 'media' | 'library', path: string | null | undefined): string | null {
  if (!path) return null
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export async function listCourses(): Promise<Course[]> {
  const { data, error } = await supabase.from('courses').select('*').order('position')
  if (error) throw error
  return data ?? []
}

/** Published courses only, for public surfaces.
 *
 *  `listCourses` leans on RLS to hide unpublished rows — but RLS deliberately
 *  exempts admins, so an admin browsing a public page would see drafts that
 *  nobody else can. Marketing pages must render the same for everyone, so the
 *  filter is explicit here rather than left to the policy. */
export async function listPublishedCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('published', true)
    .order('position')
  if (error) throw error
  return data ?? []
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const { data, error } = await supabase.from('courses').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data
}

export async function listLessons(courseId: string): Promise<Lesson[]> {
  const { data, error } = await supabase.from('lessons').select('*').eq('course_id', courseId).order('position')
  if (error) throw error
  return data ?? []
}

/**
 * Library files for one program — its own assets plus anything marked general
 * (`course_id is null`). Omit `courseId` to list everything, which is what the
 * admin screen does.
 */
export async function listLibraryAssets(courseId?: string): Promise<LibraryAsset[]> {
  let query = supabase.from('library_assets').select('*').order('position')
  if (courseId) query = query.or(`course_id.eq.${courseId},course_id.is.null`)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function listMentors(): Promise<Mentor[]> {
  const { data, error } = await supabase.from('mentors').select('*').order('position')
  if (error) throw error
  return data ?? []
}
