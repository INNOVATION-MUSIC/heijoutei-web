"use client";

import { TakeoutHeader, TakeoutStepper, RedButton, OutlineButton, mincho, sans } from "./TakeoutShared";
import { formatJpDate, type TakeoutStore } from "@/app/lib/takeoutData";
import type { CartLine, TakeoutForm } from "./TakeoutClient";
import Turnstile, { turnstileEnabled } from "../Turnstile";

const PANEL = "#171717";
const GOLD_BAR = "rgba(217,184,107,0.8)";
const HR = "rgba(235,229,219,0.15)";

type Props = {
  height: number;
  onOpenModal: () => void;
  store: TakeoutStore;
  dateIso: string | null;
  time: string | null;
  cartLines: CartLine[];
  subtotal: number;
  form: TakeoutForm;
  onBack: () => void;
  onConfirm: () => void;
  submitting: boolean;
  submitError: string | null;
  onVerify: (token: string) => void;
  turnstileReady: boolean;
};

export default function Step4Confirm(p: Props) {
  const dateLabel = p.dateIso ? `${formatJpDate(p.dateIso)} ${p.time ? p.time.replace(/ /g, "") : ""}` : "未選択";

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height: p.height, background: "#0a0a0a", overflow: "hidden" }}>
      <TakeoutHeader onOpenModal={p.onOpenModal} />

      <div style={{ paddingTop: 130 }}>
        <TakeoutStepper current={4} />
      </div>

      {/* 確認カード */}
      <div style={{ paddingLeft: 280, paddingTop: 58 }}>
        <div style={{ width: 880, background: PANEL, overflow: "hidden" }}>
          <div style={{ height: 2, background: GOLD_BAR }} />
          <div style={{ padding: "42px 50px 50px", display: "flex", flexDirection: "column" }}>
            <p style={{ margin: 0, textAlign: "center", fontFamily: mincho, fontSize: 24, letterSpacing: "0.08em", color: "#ebe5db" }}>ご予約内容の最終確認</p>

            {/* お受取予定 */}
            <p style={{ margin: 0, paddingTop: 44, fontFamily: mincho, fontSize: 18, letterSpacing: "0.05em", color: "#d9b86b" }}>お受取予定</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 18 }}>
              <Row label="受取店舗" value={p.store.name} />
              <Row label="受取日時" value={dateLabel} />
            </div>

            <Divider top={26} bottom={0} />

            {/* ご注文メニュー */}
            <p style={{ margin: 0, paddingTop: 26, fontFamily: mincho, fontSize: 18, letterSpacing: "0.05em", color: "#d9b86b" }}>ご注文メニュー</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 20 }}>
              {p.cartLines.map((l) => (
                <div key={l.item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: mincho, fontSize: 16, color: "#ebe5db" }}>{l.item.name}</span>
                  <span style={{ fontFamily: mincho, fontSize: 15, color: "#ebe5db", display: "flex", alignItems: "baseline", gap: 4 }}>
                    {l.item.price.toLocaleString()}<span style={{ fontSize: 11 }}>円</span>
                    <span style={{ color: "rgba(235,229,219,0.6)" }}>×</span>
                    <span style={{ color: "#d9b86b" }}>{l.qty}</span>
                    <span style={{ fontSize: 11 }}>点</span>
                  </span>
                </div>
              ))}
            </div>
            <Divider top={20} bottom={18} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: mincho, fontSize: 20, color: "#ebe5db" }}>合計</span>
              <span style={{ fontFamily: mincho, fontSize: 22, color: "#ebe5db" }}>{p.subtotal.toLocaleString()}<span style={{ fontSize: 12 }}>円</span></span>
            </div>

            <Divider top={28} bottom={0} />

            {/* 購入者情報 */}
            <p style={{ margin: 0, paddingTop: 26, fontFamily: mincho, fontSize: 18, letterSpacing: "0.05em", color: "#d9b86b" }}>購入者情報</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 20 }}>
              <Row label="お名前" value={p.form.name || "—"} />
              <Row label="フリガナ" value={p.form.kana || "—"} />
              <Row label="メールアドレス" value={p.form.email || "—"} />
              <Row label="電話番号" value={p.form.phone || "—"} />
              <Row label="連絡事項" value={p.form.note || "—"} multiline />
            </div>
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 40 }}>
        {p.submitError && (
          <p style={{ margin: 0, fontFamily: sans, fontSize: 13, color: "#e0726a", textAlign: "center" }}>{p.submitError}</p>
        )}
        {turnstileEnabled && <Turnstile onVerify={p.onVerify} />}
        <RedButton label={p.submitting ? "送信中..." : "予約を確定する"} onClick={p.onConfirm} disabled={p.submitting || (turnstileEnabled && !p.turnstileReady)} width={210} />
        <OutlineButton label="情報入力へ戻る" onClick={p.onBack} width={172} />
      </div>

      <div style={{ flex: 1 }} />
    </div>
  );
}

function Row({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
      <span style={{ width: 160, flexShrink: 0, fontFamily: sans, fontSize: 14, color: "rgba(235,229,219,0.6)" }}>{label}</span>
      <span style={{ flex: 1, fontFamily: mincho, fontSize: 15, color: "#ebe5db", lineHeight: multiline ? "26px" : "normal", whiteSpace: multiline ? "pre-wrap" : "normal", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}

function Divider({ top, bottom }: { top: number; bottom: number }) {
  return <div style={{ height: 1, background: HR, marginTop: top, marginBottom: bottom }} />;
}
