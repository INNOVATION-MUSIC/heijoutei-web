"use client";

import { TakeoutHeader, TakeoutStepper, RedButton, OutlineButton, mincho, sans } from "./TakeoutShared";
import type { TakeoutForm } from "./TakeoutClient";

const FIELD_BG = "#171717";
const FIELD_BORDER = "1px solid rgba(235,229,219,0.12)";
const LABEL = "#ebe5db";
const RED = "#b0322d";

type Props = {
  height: number;
  onOpenModal: () => void;
  form: TakeoutForm;
  onChange: (f: TakeoutForm) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function Step3Form(p: Props) {
  const f = p.form;
  const set = (k: keyof TakeoutForm, v: string | boolean) => p.onChange({ ...f, [k]: v });

  const emailMatch = f.email.length > 0 && f.email === f.emailConfirm;
  const valid = f.name.trim() !== "" && f.kana.trim() !== "" && f.email.trim() !== "" && emailMatch && f.agreed;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height: p.height, background: "#0a0a0a", overflow: "hidden" }}>
      <TakeoutHeader onOpenModal={p.onOpenModal} />

      <div style={{ paddingTop: 130 }}>
        <TakeoutStepper current={3} />
      </div>

      {/* フォーム */}
      <div style={{ paddingLeft: 304, paddingTop: 126, display: "flex", flexDirection: "column", gap: 32 }}>
        <Field label="お名前" required>
          <Input value={f.name} onChange={(v) => set("name", v)} placeholder="平壌　太郎" />
        </Field>
        <Field label="フリガナ" required>
          <Input value={f.kana} onChange={(v) => set("kana", v)} placeholder="ヘイジョウ　タロウ" />
        </Field>
        <Field label="メールアドレス" required>
          <Input value={f.email} onChange={(v) => set("email", v)} placeholder="info@example.com" type="email" />
        </Field>
        <Field label="メールアドレス確認" required>
          <Input value={f.emailConfirm} onChange={(v) => set("emailConfirm", v)} placeholder="info@example.com" type="email" />
          {f.emailConfirm.length > 0 && !emailMatch && (
            <span style={{ fontFamily: sans, fontSize: 12, color: RED, paddingTop: 2 }}>メールアドレスが一致しません</span>
          )}
        </Field>
        <Field label="電話番号">
          <Input value={f.phone} onChange={(v) => set("phone", v)} placeholder="075-000-0000" width={242} type="tel" />
        </Field>
        <Field label="連絡事項">
          <textarea
            value={f.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder="ご自由にご入力ください。"
            style={{ width: 880, height: 168, background: FIELD_BG, border: FIELD_BORDER, borderRadius: 4, padding: "16px", fontFamily: sans, fontSize: 14, color: "#ebe5db", resize: "none", outline: "none", lineHeight: "24px" }}
          />
        </Field>
      </div>

      {/* 同意チェック */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 46 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
          <input type="checkbox" checked={f.agreed} onChange={(e) => set("agreed", e.target.checked)} style={{ width: 18, height: 18, accentColor: RED, cursor: "pointer" }} />
          <span style={{ fontFamily: sans, fontSize: 14, color: "#ebe5db" }}>プライバシーポリシーに同意する</span>
        </label>
      </div>

      {/* ボタン */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, paddingTop: 38 }}>
        <RedButton label="確認画面へ進む" onClick={p.onNext} disabled={!valid} width={210} />
        <OutlineButton label="メニューへ戻る" onClick={p.onBack} width={210} />
      </div>

      <div style={{ flex: 1 }} />
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontFamily: mincho, fontSize: 15, letterSpacing: "0.04em", color: LABEL }}>{label}</span>
        {required && <span style={{ fontFamily: sans, fontSize: 14, color: RED }}>※</span>}
      </div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, width = 880, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; width?: number; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width, height: 52, background: FIELD_BG, border: FIELD_BORDER, borderRadius: 4, padding: "0 16px", fontFamily: sans, fontSize: 14, color: "#ebe5db", outline: "none" }}
    />
  );
}
