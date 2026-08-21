import { supabase } from './supabase'

// Access is per course. A user always sees every programme on /home; whether a
// card is enterable depends on holding a live enrolment for it.

export interface Enrollment {
  course_id: string
  status: 'active' | 'expired' | 'pending'
  expires_at: string | null
  /** Computed server-side, so a wrong client clock can't unlock an expired one. */
  active: boolean
}

export async function listMyEnrollments(): Promise<Enrollment[]> {
  const { data, error } = await supabase.rpc('my_enrollments')
  if (error) throw error
  return data ?? []
}

export async function canAccessCourse(courseId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_access_course', { p_course_id: courseId })
  if (error) throw error
  return data ?? false
}

export type LockState = 'open' | 'locked' | 'expired'

/** What a course card should show, given the caller's enrolments. */
export function lockStateFor(courseId: string, enrollments: Enrollment[], isAdmin = false): LockState {
  if (isAdmin) return 'open'

  const enrollment = enrollments.find((e) => e.course_id === courseId)
  if (!enrollment) return 'locked'
  if (enrollment.active) return 'open'
  // Enrolled but lapsed — worth distinguishing from never-enrolled, since the
  // action differs: renew vs subscribe.
  return 'expired'
}
