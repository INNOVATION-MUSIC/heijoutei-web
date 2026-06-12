// Cloudflare Turnstile のサーバー側トークン検証。
// TURNSTILE_SECRET_KEY 未設定時は true（検証スキップ＝鍵導入前もフォームを止めない）。
export async function verifyTurnstile(token: string | undefined, ip?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // 未設定＝無効化（鍵を入れた時点で有効になる）
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
