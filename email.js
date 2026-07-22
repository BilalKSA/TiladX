// Renders (and optionally sends) the Tilad welcome email to the student roster.
//
// Usage:
//   node email.js              → dry run: writes previews into email-previews/, sends nothing
//   node email.js --send       → actually sends via Resend (requires RESEND_API_KEY env var)
//
// The roster (real names/emails) is intentionally NOT in this repo — it's read
// from the CSV generated during onboarding. Override its location with
// ROSTER_PATH if needed.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const ROSTER_PATH =
  process.env.ROSTER_PATH ?? path.join(os.homedir(), 'Desktop/tilad-student-import/students_account_numbers.csv')
const PREVIEW_DIR = 'email-previews'
const FROM = 'Tilad <noreply@tilad.org>'
// Confirm this matches wherever the app actually ends up hosted before sending for real.
const SITE_URL = process.env.SITE_URL ?? 'https://tilad.org'

function parseRoster(csv) {
  const [header, ...rows] = csv.trim().split('\n')
  const columns = header.split(',')
  return rows.map((row) => {
    const values = row.split(',')
    return Object.fromEntries(columns.map((col, i) => [col, values[i]]))
  })
}

function renderEmail({ full_name, account_number }) {
  const firstName = full_name.trim().split(' ')[0]
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>مرحباً بك في تلاد</title>
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
                <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#6E5C61;">
                  حياك الله في <strong style="color:#2E2226;">تلاد</strong> — منصتك التعليمية لمتابعة برامجك وموادك التدريبية من مكان واحد.
                </p>
                <p style="margin:0 0 8px;font-size:15px;line-height:1.8;color:#6E5C61;">
                  رقم حسابك للدخول هو:
                </p>
                <div style="margin:0 0 24px;padding:12px 20px;background:#F8F0F1;border-radius:10px;text-align:center;font-size:20px;font-weight:700;letter-spacing:2px;color:#5F182A;">
                  ${account_number}
                </div>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#6E5C61;">
                  لتفعيل حسابك، اضغط على الزر أدناه وأدخل رقم حسابك وبريدك الإلكتروني وكلمة مرور من اختيارك.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 8px;">
                  <tr>
                    <td style="border-radius:999px;background:#5F182A;">
                      <a href="${SITE_URL}/activate" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:999px;">
                        فعّل حسابك الآن
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
      subject: 'مرحباً بك في تلاد 👋',
      html,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend error for ${to}: ${res.status} ${body}`)
  }
}

async function main() {
  const send = process.argv.includes('--send')
  const csv = readFileSync(ROSTER_PATH, 'utf-8')
  const students = parseRoster(csv)

  if (send) {
    console.log(`Sending live emails to ${students.length} students via Resend...`)
  } else {
    mkdirSync(PREVIEW_DIR, { recursive: true })
    console.log(`Dry run — rendering ${students.length} previews into ${PREVIEW_DIR}/ (nothing will be sent)`)
  }

  for (const student of students) {
    const html = renderEmail(student)

    if (send) {
      await sendEmail(student.email, html)
      console.log(`sent -> ${student.email}`)
    } else {
      writeFileSync(path.join(PREVIEW_DIR, `${student.account_number}.html`), html)
    }
  }

  console.log(send ? 'Done.' : `Done. Open any file in ${PREVIEW_DIR}/ in a browser to review.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
