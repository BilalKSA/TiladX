// Sends the "today's workshop presentation" email.
//
// Usage:
//   node --env-file=.env.local workshop-email.js              → sends ONLY to the admin (preview), for review
//   node --env-file=.env.local workshop-email.js --send       → sends to all 63 students in the roster
//
// The roster is read from the CSV generated during onboarding (kept outside
// this repo — see ROSTER_PATH).

import { readFileSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const ROSTER_PATH =
  process.env.ROSTER_PATH ?? path.join(os.homedir(), 'Desktop/tilad-student-import/students_account_numbers.csv')
const FROM = 'Tilad <noreply@tilad.org>'
const ADMIN_EMAIL = 'zaki.bilal@icloud.com'
const WORKSHOP_LINK = 'https://drive.google.com/drive/folders/1ypELacybkf7C7Gaapzs05k2sz_GgndHG?usp=sharing'

function parseRoster(csv) {
  const [header, ...rows] = csv.trim().split('\n')
  const columns = header.split(',')
  return rows.map((row) => {
    const values = row.split(',')
    return Object.fromEntries(columns.map((col, i) => [col, values[i]]))
  })
}

function renderEmail(firstName) {
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>عرض ورشة اليوم</title>
  </head>
  <body style="margin:0;padding:0;background:#F8F0F1;font-family:'IBM Plex Sans Arabic', Tahoma, Arial, sans-serif;">
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
                <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#6E5C61;">
                  هذا رابط عرض ورشة اليوم. اضغط على الزر أدناه للوصول إلى المواد.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 8px;">
                  <tr>
                    <td style="border-radius:999px;background:#5F182A;">
                      <a href="${WORKSHOP_LINK}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:999px;">
                        عرض مواد الورشة
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#F8F0F1;text-align:center;">
                <p style="margin:0;font-size:12px;color:#8A787D;">تلاد — من الطالب وإلى الطالب</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

async function sendEmail(to, firstName) {
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
      subject: 'رابط عرض ورشة اليوم — تلاد',
      html: renderEmail(firstName),
    }),
  })

  const body = await res.text()
  if (!res.ok) throw new Error(`Resend error for ${to}: ${res.status} ${body}`)
  console.log('sent ->', to)
}

async function main() {
  const send = process.argv.includes('--send')

  if (!send) {
    console.log('Preview mode — sending only to admin for review.')
    await sendEmail(ADMIN_EMAIL, 'بلال')
    console.log('Done. Check the admin inbox, then re-run with --send to reach all students.')
    return
  }

  const csv = readFileSync(ROSTER_PATH, 'utf-8')
  const students = parseRoster(csv)
  console.log(`Sending workshop link to ${students.length} students...`)

  for (const student of students) {
    const firstName = student.full_name.trim().split(' ')[0]
    await sendEmail(student.email, firstName)
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
