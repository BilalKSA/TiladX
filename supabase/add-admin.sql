-- ===========================================================================
-- Tilad — grant admin to an account
-- ===========================================================================
-- Currently filled in for: info@tilad.org
-- To add a different admin later, change the three values in the DECLARE block
-- and run it again. Safe to re-run.
--
-- ---------------------------------------------------------------------------
-- PREREQUISITE — do this first, the script refuses to run without it
-- ---------------------------------------------------------------------------
-- Supabase Auth users cannot be created safely from SQL. Create it in the
-- dashboard:
--
--   Authentication → Users → Add user
--     Email:              info@tilad.org
--     Password:           (choose a strong one — this account can read the
--                          entire roster, including minors' contact details)
--     Auto Confirm User:  ON      ← required
--
-- "Auto Confirm" matters: without a confirmed user there is no session, and
-- you land in the orphaned-auth-row problem described in docs/TECH_STACK.md.
--
-- Note: unlike the students' own activation flow, this does NOT go through
-- /activate. Admin accounts are provisioned directly.
-- ===========================================================================

do $$
declare
  -- ---- edit these three for a new admin -------------------------------
  v_email  text := 'info@tilad.org';
  v_number text := '900002';           -- admin account numbers run 9000xx
  v_name   text := 'فريق تلاد';
  -- ---------------------------------------------------------------------
  v_uid       uuid;
  v_existing  uuid;
begin
  select id into v_uid
  from auth.users
  where lower(email) = lower(v_email);

  if v_uid is null then
    raise exception
      'No auth user for %. Create it first: Authentication → Users → Add user, with Auto Confirm ON.', v_email;
  end if;

  -- Match on email first: if this person is already on the roster under some
  -- other account number, promote that row instead of inserting a duplicate.
  select id into v_existing
  from public.students
  where lower(email) = lower(v_email);

  if v_existing is not null then
    update public.students
    set role         = 'admin',
        auth_user_id = v_uid,
        activated_at = coalesce(activated_at, now())
    where id = v_existing;

    raise notice 'Promoted existing roster row for % to admin.', v_email;
  else
    insert into public.students (student_number, full_name, email, role, auth_user_id, activated_at)
    values (v_number, v_name, lower(v_email), 'admin', v_uid, now())
    on conflict (student_number) do update
      set full_name    = excluded.full_name,
          email        = excluded.email,
          role         = 'admin',
          auth_user_id = excluded.auth_user_id,
          activated_at = coalesce(students.activated_at, now());

    raise notice 'Created admin row % for %.', v_number, v_email;
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- Verify — every row must show linked = true AND activated = true
-- ---------------------------------------------------------------------------
-- is_admin() requires BOTH role = 'admin' AND auth_user_id = auth.uid().
-- A row with the right role but a null auth_user_id will not open /admin.
--
-- (Don't try calling is_admin() here — the SQL Editor has no JWT, so
-- auth.uid() is null and it returns false regardless. Test in the browser.)

select
  s.student_number,
  s.full_name,
  s.email,
  s.role,
  s.auth_user_id is not null  as linked,
  s.activated_at is not null  as activated,
  u.email                     as auth_email
from public.students s
left join auth.users u on u.id = s.auth_user_id
where s.role = 'admin'
order by s.student_number;


-- ===========================================================================
-- Signing in
-- ===========================================================================
-- حساب فردي      → info@tilad.org + the password you set
-- دخول المؤسسات  → account number 900002 + the same password
--
-- Both land on /admin, and the admin shortcut appears bottom-right on every
-- page once signed in.
-- ===========================================================================
