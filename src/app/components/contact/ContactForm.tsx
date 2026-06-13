"use client";

import { ContactHeader, OutlineButton, mincho, sans } from "./ContactShared";
import { INQUIRY_TYPES } from "@/app/lib/contactData";
import type { ContactForm as ContactFormData } from "../ContactClient";

const FIELD_BG = "#171717";
const FIELD_BORDER = "1px solid rgba(235,229,219,0.12)";
const LABEL = "#ebe5db";
const RED = "#b0322d";

type Props = {
  height: number;
  onOpenModal: () => void;
  form: ContactFormData;
  onChange: (f: ContactFormData) => void;
  onNext: () => void;
  storeNames: string[];
};

export default function ContactForm(p: Props) {
  const f = p.form;
  const set = (k: keyof ContactFormData, v: string | boolean) => p.onChange({ ...f, [k]: v });

  const emailMatch = f.email.length > 0 && f.email === f.emailConfirm;
  const valid = f.name.trim() !== "" && f.kana.trim() !== "" && f.email.trim() !== "" && emailMatch && f.agreed;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height: p.height, background: "#0a0a0a", overflow: "hidden" }}>
      <ContactHeader onOpenModal={p.onOpenModal} />

      {/* フォーム（先頭ラベル y=742 ＝ ヒーロー下端 617 + 125） */}
      <div style={{ paddingLeft: 284, paddingTop: 125, display: "flex", flexDirection: "column", gap: 32 }}>
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
        <Field label="お問い合わせ種別">
          <Select value={f.inquiryType} onChange={(v) => set("inquiryType", v)} options={[...INQUIRY_TYPES]} />
        </Field>
        <Field label="ご利用予定店舗">
          <Select value={f.store} onChange={(v) => set("store", v)} options={p.storeNames} />
        </Field>
        <Field label="お問合せ内容">
          <textarea
            value={f.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="ご自由にご入力ください。"
            style={{ width: 880, height: 168, background: FIELD_BG, border: FIELD_BORDER, borderRadius: 4, padding: "16px", fontFamily: sans, fontSize: 14, color: "#ebe5db", resize: "none", outline: "none", lineHeight: "24px" }}
          />
        </Field>
      </div>

      {/* 同意チェック */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 47 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
          <input type="checkbox" checked={f.agreed} onChange={(e) => set("agreed", e.target.checked)} style={{ width: 18, height: 18, accentColor: RED, cursor: "pointer" }} />
          <span style={{ fontFamily: sans, fontSize: 14, color: "#ebe5db" }}>プライバシーポリシーに同意する</span>
        </label>
      </div>

      {/* 確認画面へ */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 43 }}>
        <OutlineButton label="確認画面へ" onClick={p.onNext} disabled={!valid} width={200} />
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

function Select({ value, onChange, options, width = 242 }: { value: string; onChange: (v: string) => void; options: string[]; width?: number }) {
  return (
    <div style={{ position: "relative", width }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: 52,
          background: FIELD_BG,
          border: FIELD_BORDER,
          borderRadius: 4,
          padding: "0 36px 0 16px",
          fontFamily: sans,
          fontSize: 14,
          color: "#ebe5db",
          outline: "none",
          appearance: "none",
          WebkitAppearance: "none",
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o} style={{ background: "#171717", color: "#ebe5db" }}>{o}</option>
        ))}
      </select>
      {/* ▼ */}
      <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 10, color: "rgba(235,229,219,0.7)" }}>▼</span>
    </div>
  );
}
