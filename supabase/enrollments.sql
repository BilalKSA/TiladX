-- ===========================================================================
-- Tilad — per-course enrolment
-- ===========================================================================
-- Run in the Supabase SQL Editor. Safe to re-run.
-- Also folded into schema.sql; this file is just the delta.
--
-- Access is per COURSE, not per account. A registered user always sees the
-- full /home programme picker; each card is enterable only if they hold a live
-- enrolment for it. `students.access_status` is no longer used for gating —
-- it's left in place for account-level suspension later.
-- ===========================================================================

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  course_id  uuid not null references public.courses (id)  on delete cascade,
  status text not null default 'active',
  starts_at  timestamptz not null default now(),
  -- null = no expiry. A past date renders the card as "انتهت الصلاحية".
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint enrollments_status_check check (status in ('active', 'expired', 'pending')),
  constraint enrollments_unique unique (student_id, course_id)
);

create index if not exists enrollments_student_idx on public.enrollments (student_id);
create index if not exists enrollments_course_idx  on public.enrollments (course_id);

alter table public.enrollments enable row level security;

-- Students never query this table directly — my_enrollments() is the read path,
-- and admins go through the admin_* functions. Admin policy exists so the
-- admin screens can read/write it via PostgREST if that's ever simpler.
drop policy if exists "admins manage enrollments" on public.enrollments;
create policy "admins manage enrollments" on public.enrollments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());


-- ---------------------------------------------------------------------------
-- Read path for the signed-in student
-- ---------------------------------------------------------------------------
-- `active` is computed server-side so an incorrect client clock can't unlock
-- an expired enrolment.

create or replace function public.my_enrollments()
returns table (course_id uuid, status text, expires_at timestamptz, active boolean)
language sql
security definer
stable
set search_path = public
as $$
  select e.course_id,
         e.status,
         e.expires_at,
         (e.status = 'active' and (e.expires_at is null or e.expires_at > now())) as active
  from public.enrollments e
  join public.students s on s.id = e.student_id
  where s.auth_user_id = auth.uid();
$$;

grant execute on function public.my_enrollments() to authenticated;

-- Gate for a single course page. Admins always pass.
create or replace function public.can_access_course(p_course_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.enrollments e
    join public.students s on s.id = e.student_id
    where s.auth_user_id = auth.uid()
      and e.course_id = p_course_id
      and e.status = 'active'
      and (e.expires_at is null or e.expires_at > now())
  );
$$;

grant execute on function public.can_access_course(uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- Admin management
-- ---------------------------------------------------------------------------

create or replace function public.admin_list_enrollments()
returns table (
  id uuid,
  student_number text,
  full_name text,
  email text,
  course_id uuid,
  course_title text,
  status text,
  expires_at timestamptz,
  active boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = 'P0001';
  end if;

  return query
    select e.id, s.student_number, s.full_name, s.email,
           c.id, c.title, e.status, e.expires_at,
           (e.status = 'active' and (e.expires_at is null or e.expires_at > now()))
    from public.enrollments e
    join public.students s on s.id = e.student_id
    join public.courses  c on c.id = e.course_id
    order by s.student_number, c.position;
end;
$$;

grant execute on function public.admin_list_enrollments() to authenticated;

-- Enrol (or update) a student on a course. Accepts either an account number or
-- an email address, so the admin screen doesn't have to carry internal ids and
-- doesn't force you to look a number up first.
--
-- Renaming a parameter needs a drop: Postgres identifies a function by name and
-- argument TYPES, and CREATE OR REPLACE cannot rename an input parameter.
drop function if exists public.admin_set_enrollment(text, uuid, text, timestamptz);

create function public.admin_set_enrollment(
  p_identifier text,
  p_course_id uuid,
  p_status text default 'active',
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key     text := trim(coalesce(p_identifier, ''));
  v_student uuid;
  v_matches int;
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = 'P0001';
  end if;

  -- Match on account number or email, whichever was given.
  select count(*), min(id)
  into v_matches, v_student
  from public.students
  where student_number = v_key
     or lower(email) = lower(v_key);

  if v_matches = 0 then
    raise exception 'ما لقينا طالب بـ «%» — تأكد من رقم الحساب أو البريد.', v_key using errcode = 'P0001';
  end if;

  -- A duplicated roster email would otherwise enrol an arbitrary one of them.
  if v_matches > 1 then
    raise exception 'فيه أكثر من طالب بنفس «%» — استخدم رقم الحساب بدل البريد.', v_key using errcode = 'P0001';
  end if;

  insert into public.enrollments (student_id, course_id, status, expires_at)
  values (v_student, p_course_id, coalesce(p_status, 'active'), p_expires_at)
  on conflict (student_id, course_id) do update
    set status     = excluded.status,
        expires_at = excluded.expires_at
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.admin_set_enrollment(text, uuid, text, timestamptz) to authenticated;

create or replace function public.admin_delete_enrollment(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = 'P0001';
  end if;

  delete from public.enrollments where id = p_id;
end;
$$;

grant execute on function public.admin_delete_enrollment(uuid) to authenticated;
