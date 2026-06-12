// メール送信（Brevo Transactional Email の HTTP API）。
// Cloudflare Workers では nodemailer/SMTP（生TCP）が動かないため fetch ベースに統一。
// BREVO_API_KEY 未設定時は送信せず false を返す（best-effort：呼び出し側は受付を成立させる）。

type Mail = {
  to: string
  subject: string
  text: string
  html: string
  replyTo?: string
}

// "焼肉平壌亭 <addr@example.com>" / "addr@example.com" を {name?, email} に分解
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
        to: [{ email: mail.to }],
        ...(mail.replyTo ? { replyTo: { email: mail.replyTo } } : {}),
        subject: mail.subject,
        textContent: mail.text,
        htmlContent: mail.html,
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
