-- Tilad: organization sign-in schema
-- Run this once in the Supabase dashboard's SQL Editor (safe to re-run).

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  student_number text not null unique,
  full_name text,
  organization text,
  email text,
  phone text,
  gender text,
  role text not null default 'student',
  auth_user_id uuid references auth.users (id),
  activated_at timestamptz,
  created_at timestamptz not null default now()
);

-- Columns added after the initial rollout — safe to re-run on an existing table.
alter table public.students add column if not exists phone text;
alter table public.students add column if not exists gender text;
alter table public.students add column if not exists role text not null default 'student';
alter table public.students alter column organization drop not null;
alter table public.students alter column organization drop default;

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

-- ---------------------------------------------------------------------------
-- Activation by email
-- ---------------------------------------------------------------------------
-- The activation UI no longer asks for an account number — students activate
-- with the email already on their roster row. check_student_number and
-- link_student_account above are kept for the SQL API but are no longer called
-- by the app.
--
-- SECURITY NOTE: without the account number there is no shared secret proving
-- the person activating is the student. Anyone who knows a roster email can
-- claim that account by activating it first. Closing that gap means requiring
-- email confirmation and moving the link step to first sign-in (signUp returns
-- no session when confirmation is on, so the RPC below can't run at that point).

-- True if the email is on the roster and not yet activated. Used before
-- signUp so we don't strand an auth.users row with no students row to link to.
create or replace function public.check_student_email(p_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.students
    where lower(email) = lower(trim(p_email))
      and activated_at is null
  );
$$;

grant execute on function public.check_student_email(text) to anon;

-- Links the just-created auth.users row to the roster entry with this email.
-- Like link_student_account, this must be called by the new user themselves
-- right after signUp, since it relies on auth.uid().
create or replace function public.link_student_account_by_email(p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Match exactly one row: a duplicated roster email must never activate two
  -- students onto the same auth user.
  update public.students
  set auth_user_id = auth.uid(),
      activated_at = now()
  where id = (
    select id
    from public.students
    where lower(email) = lower(trim(p_email))
      and activated_at is null
    order by created_at
    limit 1
  );

  return found;
end;
$$;

grant execute on function public.link_student_account_by_email(text) to authenticated;

-- get_my_profile() is defined once, further down with the access-gating
-- section — it returns access_status and student_number too. Defining it
-- twice with different return types would break re-running this file.

-- Lets a student rename themselves. Scoped to auth.uid(), so a caller can only
-- ever touch their own row — this is the only write path students have into
-- `students`, which otherwise has no update policy at all.
-- Deliberately limited to full_name: email, account number and role stay
-- admin-managed, since they're identity and access, not preference.
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

-- The real student roster is loaded separately, outside this repo, since it
-- contains personal data (names, emails, phone numbers) that must never be
-- committed to git. See the accompanying import file handed to you directly.


-- ---------------------------------------------------------------------------
-- Admin check
-- ---------------------------------------------------------------------------
-- Every content policy below leans on this. It's SECURITY DEFINER because
-- `students` has no select policy — a normal client can't read its own role
-- row directly, only through functions like this one.
--
-- IMPORTANT: authorization lives here and in the policies, never in the React
-- app. The anon key ships in the JS bundle, so anyone can query these tables
-- directly; hiding a button in the UI protects nothing.

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.students
    where auth_user_id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;


-- ---------------------------------------------------------------------------
-- Content model
-- ---------------------------------------------------------------------------
-- Replaces src/data/courses.ts and src/data/mentors.ts, which were hardcoded
-- and needed a deploy to change. Everything here is admin-editable at runtime.
--
-- The `published` flag is the draft/live switch: anon and signed-in users only
-- ever see published rows, admins see everything.

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  tag text not null,
  title text not null,
  description text,
  thumbnail_path text,
  position integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text,
  -- A YouTube or Vimeo watch URL. Converted to an embed URL client-side by
  -- src/lib/video.ts — stored raw so admins can paste whatever they copied.
  video_url text,
  duration_minutes integer,
  position integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lessons_course_idx on public.lessons (course_id, position);

create table if not exists public.library_assets (
  id uuid primary key default gen_random_uuid(),
  -- The program this file belongs to. The library is per-program: a student
  -- inside ISEF sees ISEF's files, not everyone's.
  -- NULL is the deliberate escape hatch for genuinely cross-program material
  -- (a general research-writing template, say) — those show in every program.
  course_id uuid references public.courses (id) on delete cascade,
  title text not null,
  category text not null,
  description text,
  -- Either an uploaded file in the `library` storage bucket, or an external
  -- link. One of the two should be set.
  file_path text,
  external_url text,
  position integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint library_assets_category_check check (
    category in ('papers', 'posters', 'presentations', 'plans', 'templates', 'videos')
  )
);

-- Added after the table existed in some environments — safe to re-run.
alter table public.library_assets
  add column if not exists course_id uuid references public.courses (id) on delete cascade;

create index if not exists library_assets_category_idx on public.library_assets (category, position);
create index if not exists library_assets_course_idx on public.library_assets (course_id, position);

create table if not exists public.mentors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text,
  bio text,
  photo_path text,
  position integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.library_assets enable row level security;
alter table public.mentors enable row level security;

-- Read: published rows are world-readable (the landing page is public and has
-- no session). Write: admins only.
do $$
declare
  t text;
begin
  foreach t in array array['courses', 'lessons', 'library_assets', 'mentors'] loop
    execute format('drop policy if exists "public reads published %1$s" on public.%1$I', t);
    execute format(
      'create policy "public reads published %1$s" on public.%1$I
         for select to anon, authenticated using (published)', t);

    execute format('drop policy if exists "admins read all %1$s" on public.%1$I', t);
    execute format(
      'create policy "admins read all %1$s" on public.%1$I
         for select to authenticated using (public.is_admin())', t);

    execute format('drop policy if exists "admins write %1$s" on public.%1$I', t);
    execute format(
      'create policy "admins write %1$s" on public.%1$I
         for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;


-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
-- `media`   — course thumbnails and mentor photos. Meant to be public.
-- `library` — library files (PDFs etc).
--
-- Both are public-read for now, matching how public/assets/ already works.
-- NOTE: gating library files behind a subscription tier later means flipping
-- `library` to private and serving signed URLs — a public bucket URL is
-- readable by anyone who has it, forever.

insert into storage.buckets (id, name, public)
values ('media', 'media', true), ('library', 'library', true)
on conflict (id) do nothing;

drop policy if exists "public reads tilad buckets" on storage.objects;
create policy "public reads tilad buckets" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('media', 'library'));

drop policy if exists "admins write tilad buckets" on storage.objects;
create policy "admins write tilad buckets" on storage.objects
  for all to authenticated
  using (bucket_id in ('media', 'library') and public.is_admin())
  with check (bucket_id in ('media', 'library') and public.is_admin());


-- ---------------------------------------------------------------------------
-- Roster administration
-- ---------------------------------------------------------------------------
-- `students` deliberately has no select policy, so the admin roster screen
-- can't query it directly. These functions are the only way in, and each one
-- re-checks is_admin() itself — being SECURITY DEFINER, they'd otherwise
-- bypass RLS for anyone who could call them.

-- `returns setof public.students` rather than an explicit `returns table(...)`:
-- the explicit form has to match the table's column types exactly, and any
-- drift (a varchar where text was declared, a column added later) fails at
-- runtime with a 400 that looks identical to a permissions error. Returning
-- the table's own row type can't drift.
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

create or replace function public.admin_add_student(
  p_student_number text,
  p_full_name text,
  p_email text,
  p_phone text default null,
  p_gender text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  insert into public.students (student_number, full_name, email, phone, gender)
  values (trim(p_student_number), trim(p_full_name), lower(trim(p_email)),
          nullif(trim(coalesce(p_phone, '')), ''), nullif(trim(coalesce(p_gender, '')), ''))
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.admin_add_student(text, text, text, text, text) to authenticated;


-- ---------------------------------------------------------------------------
-- Seed: content that used to live in src/data/*.ts
-- ---------------------------------------------------------------------------
-- Safe to re-run — matches on the natural key and leaves existing rows alone,
-- so it won't overwrite edits made through the admin panel.

insert into public.courses (slug, tag, title, description, position, published)
values
  ('isef', 'ISEF', 'دورة ISEF',
   'إعداد المشاركين في آيسف الدولي للعلوم والهندسة، من بناء فكرة المشروع البحثي إلى عرضها أمام لجنة التحكيم الدولية.',
   0, true),
  ('stem-racing', 'STEM Racing', 'دورة STEM Racing',
   'تصميم وبناء والتنافس بسيارات مصغّرة، تجمع بين مهارات الهندسة والبرمجة والعمل الجماعي.',
   1, true),
  ('elo', 'ELO', 'دورة ELO',
   'إعداد الطلاب للمشاركة والتميز في مسابقات ELO.',
   2, true)
on conflict (slug) do nothing;

insert into public.mentors (name, position, published)
select name, ordinality - 1, true
from unnest(array[
  'جمانة بلال', 'مازن مراد', 'رضا العبدي', 'عمران التركستاني',
  'يارا القاضي', 'محمد الأسمري', 'إلياس خان', 'جمال لقماني'
]) with ordinality as t(name, ordinality)
where not exists (select 1 from public.mentors);


-- ---------------------------------------------------------------------------
-- Landing page leads
-- ---------------------------------------------------------------------------
-- Public visitors who complete the 3-question program quiz on the landing page
-- can leave a name + email. This is a separate table from `students` on
-- purpose: these are strangers, not roster members, and nothing here should
-- ever be able to touch the roster or grant access to the platform.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  recommended_program text,
  answers jsonb,
  emailed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

-- Insert-only for the public. There is deliberately NO select/update/delete
-- policy, so the anon client can submit a lead but can never read back the
-- list — not even the row it just inserted. Export leads from the Supabase
-- dashboard when you want to email them (see welcome-email.js).
drop policy if exists "public can submit a lead" on public.leads;
create policy "public can submit a lead" on public.leads
  for insert to anon, authenticated
  with check (
    char_length(full_name) between 1 and 120
    and char_length(email) between 5 and 254
    and email like '%_@_%.__%'
    -- Submitters can't backdate their own "already emailed" flag.
    and emailed_at is null
  );


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
