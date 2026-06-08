"use client";

import { ContactHeader, OutlineButton, mincho, sans } from "./ContactShared";

const PANEL = "#171717";
const GOLD_BAR = "rgba(217,184,107,0.8)";

const MESSAGE = [
  "内容を確認のうえ、",
  "担当者より改めてご連絡いたします。",
  "なお、お問い合わせ内容によっては、",
  "ご返信までにお時間をいただく場合がございます。",
  "何卒よろしくお願いいたします。",
  "",
  "ご予約の変更やキャンセルなどお急ぎの場合は、",
  "お手数ではございますがお電話にてお願いいたします。",
];

export default function ContactComplete({ height, onOpenModal, tel }: { height: number; onOpenModal: () => void; tel: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height, background: "#0a0a0a", overflow: "hidden" }}>
      <ContactHeader onOpenModal={onOpenModal} />

      {/* 完了カード（カード上端 y=729 ＝ ヒーロー下端 617 + 112） */}
      <div style={{ paddingLeft: 280, paddingTop: 112 }}>
        <div style={{ width: 880, background: PANEL, overflow: "hidden" }}>
          <div style={{ height: 2, background: GOLD_BAR }} />
          <div style={{ padding: "42px 50px 50px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ margin: 0, fontFamily: mincho, fontSize: 26, letterSpacing: "0.08em", color: "#ebe5db" }}>お問い合せありがとうございます</p>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingTop: 40 }}>
              {MESSAGE.map((line, i) => (
                <p key={i} style={{ margin: 0, fontFamily: mincho, fontSize: 15, letterSpacing: "0.05em", color: "rgba(235,229,219,0.75)", lineHeight: "26px", minHeight: line === "" ? 12 : undefined }}>{line}</p>
              ))}
            </div>

            <p style={{ margin: 0, paddingTop: 36, fontFamily: mincho, fontSize: 28, letterSpacing: "0.06em", color: "#d9b86b" }}>{tel}</p>
            <p style={{ margin: 0, paddingTop: 10, fontFamily: sans, fontSize: 14, color: "rgba(235,229,219,0.65)" }}>受付時間　10:00〜21:30</p>
          </div>
        </div>
      </div>

      {/* トップページへ */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 50 }}>
        <OutlineButton label="トップページへ" href="/" width={200} />
      </div>

      <div style={{ flex: 1 }} />
    </div>
  );
}
