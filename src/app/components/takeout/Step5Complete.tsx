"use client";

import { TakeoutHeader, TakeoutStepper, OutlineButton, mincho, sans } from "./TakeoutShared";
import type { TakeoutStore } from "@/app/lib/takeoutData";

const PANEL = "#171717";
const GOLD_BAR = "rgba(217,184,107,0.8)";

const MESSAGE = [
  "ご注文内容を受け付けました。",
  "店舗より確認のお電話をさせていただく場合がございます。",
  "商品のお受け取り日時に、お気をつけてご来店ください。",
  "スタッフ一同、ご来店を心よりお待ちしております。",
  "",
  "キャンセルや注文内容に変更がある場合は、",
  "お手数ではございますがお電話にてお願いいたします。",
];

export default function Step5Complete({ height, onOpenModal, store }: { height: number; onOpenModal: () => void; store: TakeoutStore }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height, background: "#0a0a0a", overflow: "hidden" }}>
      <TakeoutHeader onOpenModal={onOpenModal} />

      <div style={{ paddingTop: 130 }}>
        <TakeoutStepper current={5} />
      </div>

      {/* 完了カード */}
      <div style={{ paddingLeft: 280, paddingTop: 58 }}>
        <div style={{ width: 880, background: PANEL, overflow: "hidden" }}>
          <div style={{ height: 2, background: GOLD_BAR }} />
          <div style={{ padding: "42px 50px 50px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ margin: 0, fontFamily: mincho, fontSize: 24, letterSpacing: "0.08em", color: "#ebe5db" }}>ご注文ありがとうございました</p>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingTop: 40 }}>
              {MESSAGE.map((line, i) => (
                <p key={i} style={{ margin: 0, fontFamily: mincho, fontSize: 15, letterSpacing: "0.05em", color: "rgba(235,229,219,0.75)", lineHeight: "26px", minHeight: line === "" ? 12 : undefined }}>{line}</p>
              ))}
            </div>

            <p style={{ margin: 0, paddingTop: 36, fontFamily: mincho, fontSize: 28, letterSpacing: "0.06em", color: "#d9b86b" }}>{store.tel}</p>
            <p style={{ margin: 0, paddingTop: 10, fontFamily: sans, fontSize: 14, color: "rgba(235,229,219,0.65)" }}>受付時間　10:00〜21:30</p>
          </div>
        </div>
      </div>

      {/* トップページへ */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 50 }}>
        <OutlineButton label="トップページへ" href="/" width={172} />
      </div>

      <div style={{ flex: 1 }} />
    </div>
  );
}
