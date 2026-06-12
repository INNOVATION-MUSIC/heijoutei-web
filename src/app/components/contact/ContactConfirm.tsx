"use client";

import { ContactHeader, OutlineButton, mincho, sans } from "./ContactShared";
import type { ContactForm as ContactFormData } from "../ContactClient";
import Turnstile, { turnstileEnabled } from "../Turnstile";

const PANEL = "#171717";
const HR = "rgba(235,229,219,0.12)";

type Props = {
  height: number;
  onOpenModal: () => void;
  form: ContactFormData;
  onBack: () => void;
  onConfirm: () => void;
  submitting: boolean;
  submitError: string | null;
  onVerify: (token: string) => void;
  turnstileReady: boolean;
};

export default function ContactConfirm(p: Props) {
  const f = p.form;
  const rows: { label: string; value: string; multiline?: boolean }[] = [
    { label: "お名前", value: f.name || "—" },
    { label: "フリガナ", value: f.kana || "—" },
    { label: "メールアドレス", value: f.email || "—" },
    { label: "電話番号", value: f.phone || "—" },
    { label: "お問い合わせ種別", value: f.inquiryType },
    { label: "ご利用予定店舗", value: f.store },
    { label: "お問合せ内容", value: f.message || "—", multiline: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height: p.height, background: "#0a0a0a", overflow: "hidden" }}>
      <ContactHeader onOpenModal={p.onOpenModal} />

      {/* 確認見出し + カード */}
      <div style={{ paddingLeft: 280, paddingTop: 100 }}>
        {/* 表の上の見出し（カード幅880に対して中央寄せ） */}
        <p style={{ width: 880, margin: 0, paddingBottom: 28, textAlign: "center", fontFamily: mincho, fontSize: 24, letterSpacing: "0.08em", color: "#ebe5db" }}>
          ご入力内容のご確認
        </p>
        <div style={{ width: 880, background: PANEL, padding: "46px 46px" }}>
          {rows.map((r, i) => (
            <div key={r.label}>
              {i > 0 && <div style={{ height: 1, background: HR }} />}
              <Row label={r.label} value={r.value} multiline={r.multiline} />
            </div>
          ))}
        </div>
      </div>

      {/* ボタン */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 50 }}>
        {p.submitError && (
          <p style={{ margin: 0, fontFamily: sans, fontSize: 13, color: "#e0726a", textAlign: "center" }}>{p.submitError}</p>
        )}
        {turnstileEnabled && <Turnstile onVerify={p.onVerify} />}
        <OutlineButton label={p.submitting ? "送信中..." : "送信する"} onClick={p.onConfirm} disabled={p.submitting || (turnstileEnabled && !p.turnstileReady)} width={200} />
        <OutlineButton label="入力画面へ戻る" onClick={p.onBack} width={200} />
      </div>

      <div style={{ flex: 1 }} />
    </div>
  );
}

function Row({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 24, padding: "22px 0" }}>
      <span style={{ width: 200, flexShrink: 0, fontFamily: mincho, fontSize: 15, letterSpacing: "0.04em", color: "rgba(235,229,219,0.7)" }}>{label}</span>
      <span style={{ flex: 1, fontFamily: mincho, fontSize: 15, color: "#ebe5db", lineHeight: multiline ? "26px" : "normal", whiteSpace: multiline ? "pre-wrap" : "normal", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}
