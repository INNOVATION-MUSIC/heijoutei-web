// 管理者ユーザーを作成し role=admin に設定、ログインを検証するワンオフスクリプト。
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/create-admin.ts
// 認証情報は env で渡す（ファイルに残さない）。
import { readFileSync } from "node:fs";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";

// @ts-expect-error Node 20 に global WebSocket が無いため供給
globalThis.WebSocket = globalThis.WebSocket ?? WebSocket;

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL!;
const password = process.env.ADMIN_PASSWORD!;
const fullName = process.env.ADMIN_NAME || "管理者";

const admin = createClient(URL_, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  if (!email || !password) throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD が未指定です");

  // 既存ユーザーがいれば取得、いなければ作成
  let userId: string | undefined;
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (createErr) {
    if (/already|registered|exists/i.test(createErr.message)) {
      // 既存 → 一覧から探してパスワードを更新
      const { data: list } = await admin.auth.admin.listUsers();
      const existing = list?.users.find((u) => u.email === email);
      if (!existing) throw new Error(`既存ユーザーが見つかりません: ${createErr.message}`);
      userId = existing.id;
      await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
      console.log("既存ユーザーのパスワードを更新しました:", email);
    } else {
      throw new Error(`createUser: ${createErr.message}`);
    }
  } else {
    userId = created.user?.id;
    console.log("ユーザーを作成しました:", email);
  }
  if (!userId) throw new Error("userId を取得できませんでした");

  // role=admin に設定（handle_new_user トリガーで profiles 行は作成済み想定。無ければ upsert）
  const { error: roleErr } = await admin
    .from("profiles")
    .upsert({ id: userId, role: "admin", full_name: fullName }, { onConflict: "id" });
  if (roleErr) throw new Error(`profiles role: ${roleErr.message}`);
  console.log("profiles.role = admin に設定しました");

  // ログイン検証（anon クライアントで signInWithPassword）
  const anon = createClient(URL_, ANON, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: signIn, error: signErr } = await anon.auth.signInWithPassword({ email, password });
  if (signErr || !signIn.session) throw new Error(`ログイン検証 失敗: ${signErr?.message}`);
  console.log("ログイン検証 OK: session を取得（access_token 長さ", signIn.session.access_token.length, "）");

  // role 再確認
  const { data: prof } = await admin.from("profiles").select("role, full_name").eq("id", userId).single();
  console.log("確認: profiles =", prof);
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
