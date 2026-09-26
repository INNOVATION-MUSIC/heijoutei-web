// メール送信（Brevo Transactional Email の HTTP API）。
// Cloudflare Workers では nodemailer/SMTP（生TCP）が動かないため fetch ベースに統一。
// BREVO_API_KEY 未設定時は送信せず false を返す（best-effort：呼び出し側は受付を成立させる）。

type Mail = {
  to: string | string[]
  subject: string
  text: string
  html: string
  replyTo?: string
}

import { IS_PRODUCTION_SITE } from './site'

// 本番以外（ローカル・確認環境）は店舗・お客様に届かないよう MAIL_REDIRECT_TO だけへ送る。
// 設定忘れでも先方に届かないよう、本番以外で未設定なら送信しない。
function resolveRedirect(): { to: string } | { skip: true } | null {
  const redirect = process.env.MAIL_REDIRECT_TO?.trim()
  if (redirect) return { to: redirect }
  const isProduction = process.env.NODE_ENV === 'production' && IS_PRODUCTION_SITE
  return isProduction ? null : { skip: true }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

// "平壌亭 <addr@example.com>" / "addr@example.com" を {name?, email} に分解
function parseFrom(raw?: string): { name?: string; email: string } | null {
  if (!raw) return null
  const m = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  if (m) return { name: m[1] || undefined, email: m[2].trim() }
  const t = raw.trim()
  return t ? { email: t } : null
}

export async function sendEmail(mail: Mail): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY
  const from = parseFrom(process.env.MAIL_FROM || process.env.SMTP_USER)
  if (!apiKey || !from) return false // 未設定＝送信スキップ（受付自体は成立させる）

  // 複数宛先に対応（重複除去・空要素除去）。1件も無ければ送信スキップ。
  let recipients = [...new Set((Array.isArray(mail.to) ? mail.to : [mail.to]).map((e) => e.trim()).filter(Boolean))]
  if (recipients.length === 0) return false

  let { subject, text, html } = mail
  const redirect = resolveRedirect()
  if (redirect && 'skip' in redirect) {
    console.warn('[email] MAIL_REDIRECT_TO 未設定のため本番以外では送信しません:', recipients.join(', '))
    return false
  }
  if (redirect) {
    const original = recipients.join(', ')
    recipients = [redirect.to]
    subject = `[確認環境] ${subject}`
    text = `【確認環境】本来の宛先: ${original}\n\n${text}`
    html = `<p style="padding:8px;background:#fff3cd;color:#664d03;font-size:13px">【確認環境】本来の宛先: ${escapeHtml(original)}</p>${html}`
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: from.name ? { name: from.name, email: from.email } : { email: from.email },
        to: recipients.map((email) => ({ email })),
        ...(mail.replyTo ? { replyTo: { email: mail.replyTo } } : {}),
        subject,
        textContent: text,
        htmlContent: html,
      }),
    })
    if (!res.ok) {
      console.error('[email] Brevo API error', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (e) {
    console.error('[email] Brevo API fetch failed:', e)
    return false
  }
}
