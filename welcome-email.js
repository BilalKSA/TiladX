// Renders (and optionally sends) the welcome email to people who completed the
// landing page's program quiz and left their name + email.
//
// Usage:
//   node welcome-email.js                                 → dry run: writes previews into email-previews/, sends nothing
//   node --env-file=.env.local welcome-email.js --send     → actually sends via Resend
//
// Where the leads come from:
//   The public can INSERT into public.leads but has no SELECT policy, so there
//   is no way (and no key in this repo) to read them from client code. Export
//   the table from the Supabase dashboard instead:
//     Table Editor → leads → Export → Download as CSV
//   Save it OUTSIDE this repo — it holds real names and emails, which must
//   never be committed (see docs/PROJECT.md). Default location below, or set
//   LEADS_PATH to point somewhere else.
//
// Already-sent tracking: addresses are appended to a local log next to the CSV
// and skipped on later runs, so re-running won't email the same person twice.

import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const LEADS_PATH = process.env.LEADS_PATH ?? path.join(os.homedir(), 'Desktop/tilad-leads/leads.csv')
const SENT_LOG_PATH = process.env.SENT_LOG_PATH ?? path.join(path.dirname(LEADS_PATH), 'welcome-sent.log')
const PREVIEW_DIR = 'email-previews'
const FROM = 'Tilad <noreply@tilad.org>'
const SITE_URL = process.env.SITE_URL ?? 'https://tilad.org'

// Mirrors src/data/courses.ts. Kept in sync by hand — this script is plain
// Node and can't import the TypeScript module.
const PROGRAM_NAMES = {
  isef: 'دورة ISEF',
  'stem-racing': 'دورة STEM Racing',
  elo: 'دورة ELO',
}

// Quote-aware CSV parser. Supabase exports quote any field containing a comma
// or newline (the `answers` JSON column always does), so splitting on ','
// the way email.js does would corrupt every row here.
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const [header, ...body] = rows
  return body
    .filter((cells) => cells.some((cell) => cell.trim() !== ''))
    .map((cells) => Object.fromEntries(header.map((col, i) => [col.trim(), (cells[i] ?? '').trim()])))
}

function renderEmail({ full_name, recommended_program }) {
  const firstName = full_name.trim().split(' ')[0]
  const programName = PROGRAM_NAMES[recommended_program] ?? 'برامج تلاد'

  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>أهلاً بك في تلاد</title>
  </head>
  <body style="margin:0;padding:0;background:#F8F0F1;font-family:'Tajawal', Tahoma, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #EADDE0;">
            <tr>
              <td style="background:#5F182A;padding:32px;text-align:center;">
                <div style="font-family:Tahoma, Arial, sans-serif;font-weight:800;font-size:22px;color:#FFFFFF;">تلاد</div>
                <div style="font-size:12px;letter-spacing:1px;color:#E9CFD5;margin-top:4px;">tilad</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;text-align:right;">
                <h1 style="margin:0 0 16px;font-size:22px;color:#2E2226;">أهلاً ${firstName}! 👋</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#6E5C61;">
                  شكراً إنك عبّيت الاختبار في <strong style="color:#2E2226;">تلاد</strong>. حسب إجاباتك، البرنامج الأنسب لك هو:
                </p>
                <div style="margin:0 0 24px;padding:16px 20px;background:#F8F0F1;border-radius:10px;text-align:center;font-size:18px;font-weight:700;color:#5F182A;">
                  ${programName}
                </div>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#6E5C61;">
                  تلاد منصة عربية من الطالب إلى الطالب، تجهّزك للمنافسة في أقوى البرامج الطلابية — من أول فكرة لمشروعك
                  إلى لحظة ما توقف قدّام لجنة التحكيم. تقدر تتصفح البرامج والملفات من الموقع.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 8px;">
                  <tr>
                    <td style="border-radius:999px;background:#5F182A;">
                      <a href="${SITE_URL}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:999px;">
                        تصفّح تلاد
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:16px 0 0;font-size:13px;line-height:1.8;color:#8A787D;text-align:center;">
                  عندك سؤال؟ ردّ على هذي الرسالة وبنساعدك.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#F8F0F1;text-align:center;">
                <p style="margin:0;font-size:12px;color:#8A787D;">تلاد — من الطالب إلى الطالب</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

async function sendEmail(to, html) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY env var is not set — refusing to send.')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject: 'أهلاً بك في تلاد 👋',
      html,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend error for ${to}: ${res.status} ${body}`)
  }
}

function loadAlreadySent() {
  if (!existsSync(SENT_LOG_PATH)) return new Set()
  return new Set(
    readFileSync(SENT_LOG_PATH, 'utf-8')
      .split('\n')
      .map((line) => line.trim().toLowerCase())
      .filter(Boolean),
  )
}

async function main() {
  const send = process.argv.includes('--send')

  if (!existsSync(LEADS_PATH)) {
    throw new Error(
      `No leads CSV at ${LEADS_PATH}.\n` +
        'Export public.leads from the Supabase dashboard (Table Editor → leads → Export → CSV) ' +
        'and save it there, or set LEADS_PATH to its location.',
    )
  }

  const leads = parseCsv(readFileSync(LEADS_PATH, 'utf-8'))
  const alreadySent = loadAlreadySent()

  // Skip anyone already emailed — either flagged in the export, or in the local log.
  const seen = new Set()
  const pending = leads.filter((lead) => {
    const email = (lead.email ?? '').toLowerCase()
    if (!email || !lead.full_name) return false
    if (lead.emailed_at) return false
    if (alreadySent.has(email)) return false
    if (seen.has(email)) return false
    seen.add(email)
    return true
  })

  const skipped = leads.length - pending.length
  if (skipped > 0) console.log(`Skipping ${skipped} lead(s) — already emailed, duplicate, or incomplete.`)

  if (pending.length === 0) {
    console.log('Nothing to send.')
    return
  }

  if (send) {
    console.log(`Sending live emails to ${pending.length} lead(s) via Resend...`)
  } else {
    mkdirSync(PREVIEW_DIR, { recursive: true })
    console.log(`Dry run — rendering ${pending.length} preview(s) into ${PREVIEW_DIR}/ (nothing will be sent)`)
  }

  for (const lead of pending) {
    const html = renderEmail(lead)

    if (send) {
      await sendEmail(lead.email, html)
      appendFileSync(SENT_LOG_PATH, `${lead.email.toLowerCase()}\n`)
      console.log(`sent -> ${lead.email}`)
    } else {
      const safeName = lead.email.replace(/[^a-z0-9]/gi, '_')
      writeFileSync(path.join(PREVIEW_DIR, `lead-${safeName}.html`), html)
    }
  }

  console.log(send ? 'Done.' : `Done. Open any file in ${PREVIEW_DIR}/ in a browser to review.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
