// Cloudflare Turnstile のサーバー側トークン検証。
// TURNSTILE_SECRET_KEY 未設定時: 開発は true（検証スキップ）、本番は false（Secret 登録漏れでフォームを無防備にしない）。
export async function verifyTurnstile(token: string | undefined, ip?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV !== "production") return true;
    console.error("[turnstile] TURNSTILE_SECRET_KEY is not set in production; rejecting request");
    return false;
  }
  if (!token) return false;

  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (ip) form.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (e) {
    console.error("[turnstile] verify failed:", e);
    return false;
  }
}
