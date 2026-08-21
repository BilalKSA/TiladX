import { supabase } from './supabase'

export interface LeadSubmission {
  fullName: string
  email: string
  recommendedProgram: string
  answers: Record<string, string>
}

// Writes to public.leads, which is insert-only for anon (see supabase/schema.sql).
// No .select() is chained on purpose: there's no select policy, so asking for
// the row back would just fail. Fire and forget.
export async function submitLead(lead: LeadSubmission): Promise<void> {
  const { error } = await supabase.from('leads').insert({
    full_name: lead.fullName.trim(),
    email: lead.email.trim().toLowerCase(),
    recommended_program: lead.recommendedProgram,
    answers: lead.answers,
  })

  if (error) throw error
}
