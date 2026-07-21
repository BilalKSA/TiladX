-- Tilad: organization (KFUPM) sign-in schema
-- Run this once in the Supabase dashboard's SQL Editor.

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  student_number text not null unique,
  full_name text,
  organization text not null default 'KFUPM',
  email text,
  auth_user_id uuid references auth.users (id),
  activated_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.students enable row level security;
-- No select/insert/update policies are defined on purpose: the table is only
-- reachable through the SECURITY DEFINER functions below, so anon/authenticated
-- clients can never scrape the roster or student emails directly.

-- Resolve a student number to its login email, only once activated.
-- Used at sign-in time (before the client has a session).
create or replace function public.resolve_login_email(p_student_number text)
returns text
language sql
security definer
set search_path = public
as $$
  select email
  from public.students
  where student_number = p_student_number
    and activated_at is not null;
$$;

grant execute on function public.resolve_login_email(text) to anon, authenticated;

-- True if the student number is a valid, not-yet-activated roster entry.
-- Used at activation time to validate the ID before asking for a password.
create or replace function public.check_student_number(p_student_number text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.students
    where student_number = p_student_number
      and activated_at is null
  );
$$;

grant execute on function public.check_student_number(text) to anon;

-- Link the just-created auth.users row to the roster entry. Must be called
-- by the newly authenticated user themselves right after supabase.auth.signUp,
-- since it relies on auth.uid() to know which user to link.
create or replace function public.link_student_account(p_student_number text, p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.students
  set email = p_email,
      auth_user_id = auth.uid(),
      activated_at = now()
  where student_number = p_student_number
    and activated_at is null;

  return found;
end;
$$;

grant execute on function public.link_student_account(text, text) to authenticated;

-- Test data — replace/remove once the real roster is loaded.
insert into public.students (student_number)
values ('202212345')
on conflict (student_number) do nothing;
