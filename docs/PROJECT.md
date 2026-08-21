# Tilad — Project Overview

## What this is

Tilad (تلاد) is an Arabic-first educational platform built to support Saudi students in competitive extracurricular programs — currently **ISEF** (Intel International Science and Engineering Fair), **STEM Racing**, and **ELO**. Tagline: **"من الطالب وإلى الطالب"** (from student to student).

It's a single organization-style platform: students don't self-register freely. They're pre-loaded into a roster by an admin, then activate their own account with a password. There is no public marketing/signup flow yet — access is closed to the current cohort.

See [`IDENTITY.md`](IDENTITY.md) for the brand/design system and [`TECH_STACK.md`](TECH_STACK.md) for the technical architecture.

## Current status (as of this writing)

- **Frontend**: built and functional — sign-in, activation, password reset, home, courses (البرامج), library (المكتبة, including a posters subsection), videos, course detail pages.
- **Backend**: Supabase Postgres + Auth wired up. One organization/roster table (`students`) maps a student-facing **account number** to their real email, since students log in by number, not email.
- **Real data loaded**: 63 students (roster provided by the user) + 1 admin account (Bilal Zaki, account `900001`, `role: 'admin'`). Course content itself (ISEF/STEM Racing/ELO curriculum, lessons, files) is still placeholder — only ISEF is currently active; STEM Racing and ELO are marked disabled ("غير مشترك") in the UI pending real content.
- **Email**: transactional/announcement email sends via Resend (`noreply@tilad.org`), triggered by two standalone Node scripts (`email.js` for welcome/activation emails, `workshop-email.js` for one-off announcement links) — both already used to send real emails to the full roster.
- **Hosting**: Firebase Hosting (project `tilad-sa`), Supabase is backend-only (no static hosting product).

### Known issue — email deliverability

`tilad.org` has **DKIM configured but no SPF record**, and an inherited DMARC policy (`p=quarantine`) that actively sends unauthenticated mail to spam. This has caused real, repeated "I didn't get the email" reports from students. **Fix**: add a `v=spf1 include:resend.net ~all` TXT record on the root of `tilad.org`. This was diagnosed but, as of this writing, not yet confirmed fixed — check DNS before assuming email delivery works reliably.

## People/roles

- **Bilal Zaki** (`zaki.bilal@icloud.com`) — the platform owner/admin. Account number `900001`, `role: 'admin'` in the `students` table, which unlocks the admin panel at `/admin` (content + roster management).
- **Students** — real roster of 63, mostly personal Gmail/iCloud addresses (not institutional). Likely includes minors (ISEF/STEM Racing are pre-university competitions) — treat any student PII (names, emails, phone numbers) accordingly.

## Hard rule: never commit student/personal data

Real names, emails, and phone numbers for students **must never be committed to this git repository** — not in SQL files, not in scripts, not in comments. This has been enforced throughout the project:

- `supabase/schema.sql` (tracked) contains only schema/structure, no real data.
- Actual roster inserts live in `~/Desktop/tilad-student-import/` (outside the repo, gitignored territory, never committed).
- `email.js`/`workshop-email.js` (tracked) read the roster from that external path at runtime — the scripts themselves contain no PII.
- Generated email previews (`email-previews/`) are gitignored.

If a future task involves adding, editing, or emailing real people, follow this same pattern: code/scripts in the repo, data outside it.
