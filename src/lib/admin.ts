import { supabase } from './supabase'
import type { Course, Lesson, LibraryAsset, Mentor } from './content'

// Write side. Every one of these is gated by an is_admin() RLS policy on the
// server — a non-admin calling them gets an error from Postgres, not a blank
// screen. The UI guard in RequireAdmin is convenience, not security.

// Lives in ./errors so student-facing pages can use it without pulling in
// this module. Re-exported here for the admin screens that already import it.
export { errorMessage } from './errors'

// Throws if the check itself fails, rather than reporting a false negative —
// "the RPC is missing" and "you aren't an admin" need to look different, or a
// half-deployed schema is indistinguishable from a permissions problem.
export async function isAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) throw error
  return data ?? false
}

// ---------------------------------------------------------------- uploads

/** Uploads to a bucket under a collision-proof path and returns that path. */
export async function uploadFile(bucket: 'media' | 'library', file: File, folder: string): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const path = `${folder}/${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  return path
}

export async function deleteFile(bucket: 'media' | 'library', path: string | null) {
  if (!path) return
  await supabase.storage.from(bucket).remove([path])
}

// ---------------------------------------------------------------- courses

export async function saveCourse(course: Partial<Course> & { id?: string }) {
  const payload = {
    slug: course.slug,
    tag: course.tag,
    title: course.title,
    description: course.description,
    thumbnail_path: course.thumbnail_path,
    position: course.position ?? 0,
    published: course.published ?? false,
    updated_at: new Date().toISOString(),
  }

  const query = course.id
    ? supabase.from('courses').update(payload).eq('id', course.id)
    : supabase.from('courses').insert(payload)

  const { error } = await query
  if (error) throw error
}

export async function deleteCourse(id: string) {
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------- lessons

export async function saveLesson(lesson: Partial<Lesson> & { id?: string; course_id: string }) {
  const payload = {
    course_id: lesson.course_id,
    title: lesson.title,
    description: lesson.description,
    video_url: lesson.video_url,
    duration_minutes: lesson.duration_minutes,
    position: lesson.position ?? 0,
    published: lesson.published ?? false,
    updated_at: new Date().toISOString(),
  }

  const query = lesson.id
    ? supabase.from('lessons').update(payload).eq('id', lesson.id)
    : supabase.from('lessons').insert(payload)

  const { error } = await query
  if (error) throw error
}

export async function deleteLesson(id: string) {
  const { error } = await supabase.from('lessons').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------- library

export async function saveLibraryAsset(asset: Partial<LibraryAsset> & { id?: string }) {
  const payload = {
    course_id: asset.course_id ?? null,
    title: asset.title,
    category: asset.category,
    description: asset.description,
    file_path: asset.file_path,
    external_url: asset.external_url,
    position: asset.position ?? 0,
    published: asset.published ?? false,
    updated_at: new Date().toISOString(),
  }

  const query = asset.id
    ? supabase.from('library_assets').update(payload).eq('id', asset.id)
    : supabase.from('library_assets').insert(payload)

  const { error } = await query
  if (error) throw error
}

export async function deleteLibraryAsset(id: string) {
  const { error } = await supabase.from('library_assets').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------- mentors

export async function saveMentor(mentor: Partial<Mentor> & { id?: string }) {
  const payload = {
    name: mentor.name,
    title: mentor.title,
    bio: mentor.bio,
    photo_path: mentor.photo_path,
    // Empty string means "no track" — stored as null so the /mentors filter
    // doesn't grow a blank chip.
    track: mentor.track?.trim() || null,
    position: mentor.position ?? 0,
    published: mentor.published ?? false,
    updated_at: new Date().toISOString(),
  }

  const query = mentor.id
    ? supabase.from('mentors').update(payload).eq('id', mentor.id)
    : supabase.from('mentors').insert(payload)

  const { error } = await query
  if (error) throw error
}

export async function deleteMentor(id: string) {
  const { error } = await supabase.from('mentors').delete().eq('id', id)
  if (error) throw error
}

// ----------------------------------------------------------------- roster

// admin_list_students() returns `setof public.students`, so every column on
// the table comes back — including the ones this screen doesn't render.
export interface RosterStudent {
  id: string
  student_number: string
  full_name: string | null
  email: string | null
  phone: string | null
  gender: string | null
  role: string
  organization: string | null
  auth_user_id: string | null
  activated_at: string | null
  created_at: string
}

export async function listStudents(): Promise<RosterStudent[]> {
  const { data, error } = await supabase.rpc('admin_list_students')
  if (error) throw error
  return data ?? []
}

export async function addStudent(input: {
  studentNumber: string
  fullName: string
  email: string
  phone?: string
  gender?: string
}) {
  const { error } = await supabase.rpc('admin_add_student', {
    p_student_number: input.studentNumber,
    p_full_name: input.fullName,
    p_email: input.email,
    p_phone: input.phone || null,
    p_gender: input.gender || null,
  })
  if (error) throw error
}

// ------------------------------------------------------------ enrollments

export interface AdminEnrollment {
  id: string
  student_number: string
  full_name: string | null
  email: string | null
  course_id: string
  course_title: string
  status: string
  expires_at: string | null
  active: boolean
}

export async function listEnrollments(): Promise<AdminEnrollment[]> {
  const { data, error } = await supabase.rpc('admin_list_enrollments')
  if (error) throw error
  return data ?? []
}

export async function setEnrollment(input: {
  /** Account number or email — the RPC accepts either. */
  identifier: string
  courseId: string
  status: string
  expiresAt: string | null
}) {
  const { error } = await supabase.rpc('admin_set_enrollment', {
    p_identifier: input.identifier,
    p_course_id: input.courseId,
    p_status: input.status,
    p_expires_at: input.expiresAt,
  })
  if (error) throw error
}

export async function deleteEnrollment(id: string) {
  const { error } = await supabase.rpc('admin_delete_enrollment', { p_id: id })
  if (error) throw error
}
