"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import OutlineButton from "../OutlineButton";
import Turnstile, { turnstileEnabled } from "../Turnstile";
import { INQUIRY_TYPES } from "@/app/lib/contactData";
import type { ContactForm as ContactFormData } from "../ContactClient";

// /contact お問い合わせフロー SP 版（Figma「お問い合わせ_sp」node 2224:851 / 設計幅 390）。
// PC 版 contact/* と同じ状態・データ層を使い、見た目（レイアウト）のみ SP 向けに作り直したもの。
// ヘッダーは SpStickyHeader が固定表示するため各セクション先頭に 153px spacer のみ置き、
// それ以降（ヒーロー〜）を ResizeObserver で実測してセクション全高を確定する。
// 縦位置は paddingTop（gap）で制御し marginTop / 配置 absolute は不使用。

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";
const display = "'Cormorant Garamond', serif";

const PANEL = "#171717";
const FIELD_BG = "#171717";
const FIELD_BORDER = "1px solid rgba(235,229,219,0.12)";
const LABEL = "#ebe5db";
const RED = "#b0322d";
const HR = "rgba(235,229,219,0.12)";
const GOLD_BAR = "rgba(217,184,107,0.8)";

const COMPLETE_MESSAGE = [
  "内容を確認のうえ、",
  "担当者より改めてご連絡いたします。",
  "なお、お問い合わせ内容によっては、",
  "ご返信までにお時間をいただく場合がございます。",
  "何卒よろしくお願いいたします。",
  "",
  "ご予約の変更やキャンセルなどお急ぎの場合は、",
  "お手数ではございますがお電話にてお願いいたします。",
];

/* ─────────── 153px ヘッダースペーサー + ResizeObserver で実測する外枠 ─────────── */
function SectionShell({
  height,
  onMeasured,
  children,
}: {
  height: number;
  onMeasured?: (h: number) => void;
  children: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !onMeasured) return;
    const report = () => onMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 390, height, background: "#0a0a0a", overflow: "hidden" }}>
      <div style={{ height: 153, flexShrink: 0 }} />
      <div ref={contentRef} style={{ display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

/* ─────────── ヒーロー(351×130) + 「お問合せ / Contact」見出し（全ステップ共通） ─────────── */
function ContactHeadingSP() {
  return (
    <>
      {/* ヒーロー画像ストリップ（351×130・左21pxインセット） */}
      <div style={{ paddingLeft: 19 }}>
        <div style={{ position: "relative", width: 351, height: 130, overflow: "hidden", background: "#472914" }}>
          <Image src="/images/contact_hero.webp" alt="焼肉平壌亭 お問い合わせ" fill className="object-cover" sizes="351px" preload />
        </div>
      </div>

      {/* Contact 見出し（縦書きラベル「お問合せ」+ Contact・/news・/store・/menu SP と統一） */}
      <div style={{ display: "flex", alignItems: "flex-start", paddingLeft: 19, paddingTop: 73, gap: 28 }}>
        <div style={{ boxSizing: "border-box", width: 44, height: 94, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <span style={{ margin: 0, writingMode: "vertical-rl" as const, whiteSpace: "nowrap", fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", transform: "translateY(4px)" }}>
            お問合せ
          </span>
        </div>
        <p style={{ paddingTop: 36, fontFamily: display, fontSize: 56, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0 }}>Contact</p>
      </div>
    </>
  );
}

/* ─────────── ステップ1: 入力フォーム ─────────── */
export function ContactFormSP({
  height,
  form,
  onChange,
  onNext,
  storeNames,
  onMeasured,
}: {
  height: number;
  form: ContactFormData;
  onChange: (f: ContactFormData) => void;
  onNext: () => void;
  storeNames: string[];
  onMeasured?: (h: number) => void;
}) {
  const f = form;
  const set = (k: keyof ContactFormData, v: string | boolean) => onChange({ ...f, [k]: v });

  const emailMatch = f.email.length > 0 && f.email === f.emailConfirm;
  const valid = f.name.trim() !== "" && f.kana.trim() !== "" && f.email.trim() !== "" && emailMatch && f.agreed;

  return (
    <SectionShell height={height} onMeasured={onMeasured}>
      <ContactHeadingSP />

      {/* フォーム（先頭ラベル ≒ ヒーロー下端 + 64） */}
      <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 64, display: "flex", flexDirection: "column", gap: 28 }}>
        <Field label="お名前" required>
          <SpInput value={f.name} onChange={(v) => set("name", v)} placeholder="平壌　太郎" />
        </Field>
        <Field label="フリガナ" required>
          <SpInput value={f.kana} onChange={(v) => set("kana", v)} placeholder="ヘイジョウ　タロウ" />
        </Field>
        <Field label="メールアドレス" required>
          <SpInput value={f.email} onChange={(v) => set("email", v)} placeholder="info@example.com" type="email" />
        </Field>
        <Field label="メールアドレス確認" required>
          <SpInput value={f.emailConfirm} onChange={(v) => set("emailConfirm", v)} placeholder="info@example.com" type="email" />
          {f.emailConfirm.length > 0 && !emailMatch && (
            <span style={{ fontFamily: sans, fontSize: 12, color: RED, paddingTop: 4 }}>メールアドレスが一致しません</span>
          )}
        </Field>
        <Field label="電話番号">
          <SpInput value={f.phone} onChange={(v) => set("phone", v)} placeholder="075-000-0000" type="tel" />
        </Field>
        <Field label="お問い合わせ種別">
          <SpSelect value={f.inquiryType} onChange={(v) => set("inquiryType", v)} options={[...INQUIRY_TYPES]} />
        </Field>
        <Field label="ご利用予定店舗">
          <SpSelect value={f.store} onChange={(v) => set("store", v)} options={storeNames} />
        </Field>
        <Field label="お問合せ内容">
          <textarea
            value={f.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="ご自由にご入力ください。"
            style={{ boxSizing: "border-box", width: "100%", height: 140, background: FIELD_BG, border: FIELD_BORDER, borderRadius: 4, padding: 16, fontFamily: sans, fontSize: 16, color: "#ebe5db", resize: "none", outline: "none", lineHeight: "24px" }}
          />
        </Field>
      </div>

      {/* 同意チェック（中央寄せ） */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 30 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
          <input type="checkbox" checked={f.agreed} onChange={(e) => set("agreed", e.target.checked)} style={{ width: 18, height: 18, accentColor: RED, cursor: "pointer", flexShrink: 0 }} />
          <span style={{ fontFamily: sans, fontSize: 14, color: "#ebe5db" }}>プライバシーポリシーに同意する</span>
        </label>
      </div>

      {/* 確認画面へ進む */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 30 }}>
        <OutlineButton jp="確認画面へ進む" onClick={onNext} disabled={!valid} width={200} align="center" />
      </div>

      <div style={{ height: 80 }} />
    </SectionShell>
  );
}

/* ─────────── ステップ2: 入力内容の確認 ─────────── */
export function ContactConfirmSP({
  height,
  form,
  onBack,
  onConfirm,
  submitting,
  submitError,
  onVerify,
  turnstileReady,
  onMeasured,
}: {
  height: number;
  form: ContactFormData;
  onBack: () => void;
  onConfirm: () => void;
  submitting: boolean;
  submitError: string | null;
  onVerify: (token: string) => void;
  turnstileReady: boolean;
  onMeasured?: (h: number) => void;
}) {
  const f = form;
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
    <SectionShell height={height} onMeasured={onMeasured}>
      <ContactHeadingSP />

      {/* 確認見出し + カード */}
      <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 64 }}>
        <p style={{ margin: 0, paddingBottom: 24, textAlign: "center", fontFamily: mincho, fontSize: 20, letterSpacing: "0.08em", color: "#ebe5db" }}>
          ご入力内容のご確認
        </p>
        <div style={{ background: PANEL, padding: "10px 22px" }}>
          {rows.map((r, i) => (
            <div key={r.label}>
              {i > 0 && <div style={{ height: 1, background: HR }} />}
              <ConfirmRow label={r.label} value={r.value} multiline={r.multiline} />
            </div>
          ))}
        </div>
      </div>

      {/* ボタン */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 40 }}>
        {submitError && (
          <p style={{ margin: 0, fontFamily: sans, fontSize: 13, color: "#e0726a", textAlign: "center", paddingLeft: 20, paddingRight: 20 }}>{submitError}</p>
        )}
        {turnstileEnabled && <Turnstile onVerify={onVerify} />}
        <OutlineButton jp={submitting ? "送信中..." : "送信する"} onClick={onConfirm} disabled={submitting || (turnstileEnabled && !turnstileReady)} width={200} align="center" />
        <OutlineButton jp="入力画面へ戻る" onClick={onBack} width={200} align="center" />
      </div>

      <div style={{ height: 80 }} />
    </SectionShell>
  );
}

/* ─────────── ステップ3: 送信完了 ─────────── */
export function ContactCompleteSP({
  height,
  tel,
  onMeasured,
}: {
  height: number;
  tel: string;
  onMeasured?: (h: number) => void;
}) {
  return (
    <SectionShell height={height} onMeasured={onMeasured}>
      <ContactHeadingSP />

      {/* 完了カード */}
      <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 64 }}>
        <div style={{ background: PANEL, overflow: "hidden" }}>
          <div style={{ height: 2, background: GOLD_BAR }} />
          <div style={{ padding: "40px 20px 44px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ margin: 0, fontFamily: mincho, fontSize: 20, letterSpacing: "0.06em", color: "#ebe5db", textAlign: "center" }}>お問合せありがとうございました</p>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingTop: 34 }}>
              {COMPLETE_MESSAGE.map((line, i) => (
                <p key={i} style={{ margin: 0, fontFamily: mincho, fontSize: 13, letterSpacing: "0.05em", color: "rgba(235,229,219,0.75)", lineHeight: "24px", textAlign: "center", minHeight: line === "" ? 10 : undefined }}>{line}</p>
              ))}
            </div>

            <a href={`tel:${tel.replace(/[^0-9]/g, "")}`} style={{ margin: 0, paddingTop: 34, fontFamily: mincho, fontSize: 26, letterSpacing: "0.06em", color: "#d9b86b", textDecoration: "none", whiteSpace: "nowrap" }}>{tel}</a>
            <p style={{ margin: 0, paddingTop: 10, fontFamily: sans, fontSize: 13, color: "rgba(235,229,219,0.65)" }}>受付時間　10:00〜21:30</p>
          </div>
        </div>
      </div>

      {/* トップページへ */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
        <OutlineButton jp="トップページへ" href="/" width={200} align="center" />
      </div>

      <div style={{ height: 80 }} />
    </SectionShell>
  );
}

/* ─────────── フォーム部品（SP） ─────────── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontFamily: mincho, fontSize: 15, letterSpacing: "0.04em", color: LABEL }}>{label}</span>
        {required && <span style={{ fontFamily: sans, fontSize: 14, color: RED }}>※</span>}
      </div>
      {children}
    </div>
  );
}

// fontSize 16 は iOS のフォーカス時自動ズームを防ぐため（SP のタップ操作性確保）。
function SpInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ boxSizing: "border-box", width: "100%", height: 48, background: FIELD_BG, border: FIELD_BORDER, borderRadius: 4, padding: "0 16px", fontFamily: sans, fontSize: 16, color: "#ebe5db", outline: "none" }}
    />
  );
}

function SpSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const selectStyle: CSSProperties = {
    boxSizing: "border-box",
    width: "100%",
    height: 48,
    background: FIELD_BG,
    border: FIELD_BORDER,
    borderRadius: 4,
    padding: "0 36px 0 16px",
    fontFamily: sans,
    fontSize: 16,
    color: "#ebe5db",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    cursor: "pointer",
  };
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
        {options.map((o) => (
          <option key={o} value={o} style={{ background: "#171717", color: "#ebe5db" }}>{o}</option>
        ))}
      </select>
      <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 10, color: "rgba(235,229,219,0.7)" }}>▼</span>
    </div>
  );
}

function ConfirmRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "16px 0" }}>
      <span style={{ fontFamily: mincho, fontSize: 13, letterSpacing: "0.04em", color: "rgba(235,229,219,0.7)" }}>{label}</span>
      <span style={{ fontFamily: mincho, fontSize: 15, color: "#ebe5db", lineHeight: multiline ? "24px" : "normal", whiteSpace: multiline ? "pre-wrap" : "normal", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}
