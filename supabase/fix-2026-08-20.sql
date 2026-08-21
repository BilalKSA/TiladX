-- ===========================================================================
-- Tilad — fixes for the two 400s reported on 2026-08-20
-- ===========================================================================
-- Run the whole file in the Supabase SQL Editor. Safe to re-run.
-- All of this is also folded into schema.sql; this file is just the delta so
-- you don't have to re-paste the whole schema.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. POST /rest/v1/library_assets → 400
-- ---------------------------------------------------------------------------
-- Cause: 42703, column library_assets.course_id does not exist. The library
-- became per-program after you'd already run schema.sql, and
-- `create table if not exists` is a no-op on an existing table — so only this
-- alter applies the column.

alter table public.library_assets
  add column if not exists course_id uuid
  references public.courses (id) on delete cascade;

create index if not exists library_assets_course_idx
  on public.library_assets (course_id, position);


-- ---------------------------------------------------------------------------
-- 2. POST /rest/v1/rpc/admin_list_students → 400
-- ---------------------------------------------------------------------------
-- The old definition used `returns table (...)`, which must match the
-- students table's column types exactly. Any drift raises 42804 at runtime —
-- a 400 that looks identical to a permissions failure. `returns setof
-- public.students` uses the table's own row type and cannot drift.
--
-- The guard now also reports which auth.uid() it saw, so "not authorized"
-- becomes diagnosable instead of opaque.

-- Return type changed from `returns table (...)` to `setof students`, and
-- Postgres refuses to change a return type via CREATE OR REPLACE — the drop is
-- required. Nothing else depends on this function, so dropping is safe.
drop function if exists public.admin_list_students();

create function public.admin_list_students()
returns setof public.students
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized (is_admin() returned false for auth.uid() = %)', auth.uid()
      using errcode = 'P0001';
  end if;

  return query
    select s.*
    from public.students s
    order by s.student_number;
end;
$$;

grant execute on function public.admin_list_students() to authenticated;


-- ---------------------------------------------------------------------------
-- 3. Diagnostics — read the output of this last query
-- ---------------------------------------------------------------------------
-- is_admin() checks BOTH role = 'admin' AND auth_user_id = auth.uid().
-- A row with the right role but a null auth_user_id will fail the check, and
-- that is the most common reason for "not authorized".
--
-- Every admin row below must show linked = true. If one doesn't, the account
-- exists in auth.users but was never linked — re-run supabase/admin-setup.sql.
--
-- (Running this in the SQL Editor, is_admin() itself would return false no
-- matter what: the editor has no JWT, so auth.uid() is null. Don't test it
-- here — test by loading /admin in the browser.)

select
  s.student_number,
  s.email                                as roster_email,
  s.role,
  s.auth_user_id is not null             as linked,
  s.activated_at is not null             as activated,
  u.email                                as auth_email,
  case
    when s.auth_user_id is null then 'NOT LINKED — re-run admin-setup.sql'
    when u.id is null           then 'linked to a missing auth user'
    else 'ok'
  end                                    as status
from public.students s
left join auth.users u on u.id = s.auth_user_id
where s.role = 'admin'
order by s.student_number;


-- ---------------------------------------------------------------------------
-- 4. Let students rename themselves
-- ---------------------------------------------------------------------------
-- `students` has no update policy, so this SECURITY DEFINER function is the
-- only write path a student has into their own row. Scoped to auth.uid(), so
-- a caller can never touch anyone else's.
--
-- Deliberately limited to full_name — email, account number and role stay
-- admin-managed, since they're identity and access rather than preference.

create or replace function public.update_my_name(p_full_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := trim(coalesce(p_full_name, ''));
begin
  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'الاسم لازم يكون بين حرفين و120 حرف.' using errcode = 'P0001';
  end if;

  update public.students
  set full_name = v_name
  where auth_user_id = auth.uid();

  if not found then
    raise exception 'ما لقينا حسابك في قائمة الطلاب.' using errcode = 'P0001';
  end if;

  return v_name;
end;
$$;

grant execute on function public.update_my_name(text) to authenticated;


-- ---------------------------------------------------------------------------
-- 5. Open registration + access gating
-- ---------------------------------------------------------------------------
-- Anyone can now create an account. Access to programme content is gated on
-- access_status, which starts as 'pending' for self-registered users and only
-- becomes 'active' once they've purchased.
--
-- The column defaults to 'active' on purpose: every existing roster row, and
-- every future admin-added roster row, should keep access. Only register_self()
-- sets 'pending', so self-signup is the sole path that lands gated.

alter table public.students
  add column if not exists access_status text not null default 'active';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'students_access_status_check'
  ) then
    alter table public.students
      add constraint students_access_status_check
      check (access_status in ('pending', 'active', 'suspended'));
  end if;
end $$;

create index if not exists students_access_status_idx on public.students (access_status);

-- Does the caller get to see programme content?
-- Admins always do; everyone else needs access_status = 'active'.
create or replace function public.has_access()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.students
    where auth_user_id = auth.uid()
      and (role = 'admin' or access_status = 'active')
  );
$$;

grant execute on function public.has_access() to authenticated;

-- Called straight after signUp, with the new user's own session.
-- Idempotent: calling it twice returns the same account number.
--
-- If the signup email happens to match an unactivated roster row, that row is
-- claimed rather than duplicated — so a roster student who takes the public
-- signup route still lands on their real record, with their existing access.
create or replace function public.register_self(p_full_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_email  text;
  v_name   text := trim(coalesce(p_full_name, ''));
  v_number text;
begin
  if v_uid is null then
    raise exception 'لازم تسجّل دخولك أول.' using errcode = 'P0001';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'الاسم لازم يكون بين حرفين و120 حرف.' using errcode = 'P0001';
  end if;

  -- Already registered → hand back the existing number.
  select student_number into v_number
  from public.students
  where auth_user_id = v_uid;

  if v_number is not null then
    return v_number;
  end if;

  select email into v_email from auth.users where id = v_uid;

  -- On the roster already but never activated → claim that row.
  select student_number into v_number
  from public.students
  where lower(email) = lower(v_email)
    and auth_user_id is null
  limit 1;

  if v_number is not null then
    update public.students
    set auth_user_id = v_uid,
        activated_at = coalesce(activated_at, now()),
        full_name    = coalesce(nullif(full_name, ''), v_name)
    where student_number = v_number;

    return v_number;
  end if;

  -- Brand new self-registration. Self-signup numbers live in the 2xxxxx block,
  -- clear of the roster (1xxxxx) and admins (9xxxxx). The regex filter matters:
  -- student_number is text and some rows are non-numeric, so an unguarded cast
  -- would fail.
  select coalesce(max(student_number::bigint), 200000) + 1
  into v_number
  from public.students
  where student_number ~ '^2[0-9]{5}$';

  insert into public.students (
    student_number, full_name, email, role, access_status, auth_user_id, activated_at
  )
  values (v_number, v_name, lower(v_email), 'student', 'pending', v_uid, now());

  return v_number;
end;
$$;

grant execute on function public.register_self(text) to authenticated;

-- Expose access_status on the caller's own profile so the app can gate on it.
-- Adding columns changes the return type, which CREATE OR REPLACE cannot do —
-- hence the drop. No RLS policy or other function references this one.
drop function if exists public.get_my_profile();

create function public.get_my_profile()
returns table (full_name text, gender text, role text, access_status text, student_number text)
language sql
security definer
set search_path = public
as $$
  select full_name, gender, role, access_status, student_number
  from public.students
  where auth_user_id = auth.uid();
$$;

grant execute on function public.get_my_profile() to authenticated;
