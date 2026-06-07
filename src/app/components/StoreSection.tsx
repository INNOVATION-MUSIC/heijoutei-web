"use client";
import { type ReactNode } from "react";
import Image from "next/image";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";
const sans = "'Noto Sans JP', sans-serif";

function MapBadge({ address }: { address: string }) {
  const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 50,
        height: 20,
        border: "1px solid rgba(221,168,63,0.6)",
        borderRadius: 25,
        fontFamily: sans,
        fontSize: 10,
        color: "#fff",
        textDecoration: "none",
        letterSpacing: "1px",
        flexShrink: 0,
      }}
    >
      MAP
    </a>
  );
}

interface InfoPanelProps {
  enLabel: string;
  name: string;
  address: string;
  phone: string;
  access: string;
  hours: ReactNode;
  closed: string;
  paddingLeft: number;
  paddingTop: number;
}

function InfoPanel({ enLabel, name, address, phone, access, hours, closed, paddingLeft, paddingTop }: InfoPanelProps) {
  const detailText = {
    fontFamily: sans,
    fontWeight: 300,
    fontSize: 12,
    lineHeight: "22px",
    letterSpacing: "0.5px",
    color: "#fff",
  } as const;

  return (
    <div style={{ flex: 1, background: "#171717", paddingLeft, paddingTop, display: "flex", flexDirection: "column" }}>
      {/* ラベル・区切り線・店名 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 10, letterSpacing: "3px", color: "rgba(217,184,107,0.6)", lineHeight: "normal", whiteSpace: "pre" }}>{enLabel}</p>
        <div style={{ width: 32, height: 1, background: "rgba(217,184,107,0.45)" }} />
        <p style={{ fontFamily: mincho, fontWeight: 800, fontSize: 26, letterSpacing: "2px", color: "#fff", lineHeight: "normal", whiteSpace: "pre" }}>{name}</p>
      </div>
      {/* 詳細情報 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 18 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <p style={detailText}>{address}</p>
          <MapBadge address={address} />
        </div>
        <p style={detailText}>{phone}</p>
        <p style={detailText}>{access}</p>
        <div style={{ ...detailText }}>{hours}</div>
        <p style={detailText}>{closed}</p>
      </div>
    </div>
  );
}

export default function StoreSection() {
  return (
    <section style={{ width: 1440, background: "#0d0a0a", display: "flex", flexDirection: "column", paddingTop: 41 }}>

      {/* ━━━ ヘッダー ━━━ */}
      <div style={{ paddingLeft: 66, display: "flex", flexDirection: "column", gap: 24, paddingBottom: 70 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 69 }}>
          {/* 店舗ラベルボックス（タイトルより10px低い位置） */}
          <div style={{ paddingTop: 10, flexShrink: 0 }}>
            <div style={{ width: 44, height: 85, border: "1px solid rgba(255,255,255,0.3)", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <p style={{ fontFamily: mincho, fontSize: 12, letterSpacing: "1px", color: "#fff", writingMode: "vertical-rl" as const, lineHeight: "22px" }}>店舗</p>
            </div>
          </div>
          <p style={{ fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>StoreInfo</p>
        </div>
        <p style={{ paddingLeft: 113, width: 850, fontFamily: mincho, fontSize: 15, lineHeight: "40px", letterSpacing: "1.5px", color: "rgba(235,229,219,0.85)" }}>
          各店くつろげるお席をご用意して、各種ご宴会・記念日・ご接待などのご利用にも対応させていただきます。<br />
          亀岡・園部・福知山での焼肉はぜひ焼肉平壌亭へ焼肉宴会で楽しいひと時をお過ごしください。
        </p>
      </div>

      {/* ━━━ 店舗カード群 ━━━ */}
      <div style={{ paddingLeft: 50, paddingRight: 50, display: "flex", flexDirection: "column", gap: 40 }}>

        {/* 亀岡店（全幅大カード） */}
        <div style={{ display: "flex", height: 350 }}>
          <div style={{ width: 742, height: 350, position: "relative", overflow: "hidden", background: "#1c110a", flexShrink: 0 }}>
            <Image src="/images/store_kameoka.webp" alt="平壌亭 亀岡店" fill className="object-cover" sizes="742px" />
          </div>
          <InfoPanel
            enLabel={"HEIJOHTEI  KAMEOKA"}
            name={"平壌亭  亀岡店"}
            address="京都府亀岡市篠町浄法寺中村３５-５"
            phone="0771-23-8410"
            access="30台駐車場完備/8名様よりマイクロバス送迎あり"
            hours={
              <>
                <p style={{ lineHeight: "22px" }}>月、水〜日、祝日、祝前日: 11:30〜14:30（料理L.O. 14:00 ドリンクL.O. 14:00）</p>
                <p style={{ lineHeight: "22px" }}>16:00〜22:30（料理L.O. 22:00 ドリンクL.O. 22:00）</p>
              </>
            }
            closed="定休日 火曜"
            paddingLeft={56}
            paddingTop={44}
          />
        </div>

        {/* 園部店 + 福知山店 */}
        <div style={{ display: "flex", gap: 40, height: 280 }}>
          <div style={{ width: 650, display: "flex", flexShrink: 0 }}>
            <div style={{ width: 280, height: 280, position: "relative", overflow: "hidden", background: "#1c110a", flexShrink: 0 }}>
              <Image src="/images/store_sonobe_map.webp" alt="平壌亭 園部店" fill className="object-cover" sizes="280px" />
            </div>
            <InfoPanel
              enLabel={"HEIJOHTEI  SONOBE"}
              name={"平壌亭  園部店"}
              address="京都府南丹市園部町上木崎町坪ノ内26-5"
              phone="0771-68-1760"
              access="20台駐車場完備/8名様よりマイクロバス送迎あり"
              hours={<p style={{ lineHeight: "22px" }}>月、水〜日、祝日、祝前日: 16:00〜22:30</p>}
              closed="定休日 火曜"
              paddingLeft={40}
              paddingTop={29}
            />
          </div>
          <div style={{ width: 650, display: "flex", flexShrink: 0 }}>
            <div style={{ width: 280, height: 280, position: "relative", overflow: "hidden", background: "#1c110a", flexShrink: 0 }}>
              <Image src="/images/store_fukuchiyama_map.webp" alt="平壌亭 福知山店" fill className="object-cover" sizes="280px" />
            </div>
            <InfoPanel
              enLabel={"HEIJOHTEI  FUKUCHIYAMA"}
              name={"平壌亭  福知山店"}
              address="京都府福知山市字堀2303の２"
              phone="0773-24-2322"
              access="15台駐車場完備/8名様よりマイクロバス送迎あり"
              hours={<p style={{ lineHeight: "22px" }}>月、水〜日、祝日、祝前日: 16:00〜22:30</p>}
              closed="定休日 火曜"
              paddingLeft={40}
              paddingTop={29}
            />
          </div>
        </div>

        {/* 焼肉ゆらの + ヘイジョウテイ */}
        <div style={{ display: "flex", gap: 40, height: 280 }}>
          <div style={{ width: 650, display: "flex", flexShrink: 0 }}>
            <div style={{ width: 280, height: 280, position: "relative", overflow: "hidden", background: "#1c110a", flexShrink: 0 }}>
              <Image src="/images/store_yurano.webp" alt="焼肉ゆらの" fill className="object-cover" sizes="280px" />
            </div>
            <InfoPanel
              enLabel="YAKINIKU YURANO"
              name="焼肉ゆらの"
              address="京都府福知山堀今岡６番地ゆらのガーデン内"
              phone="0773-45-8429"
              access="JR福知山駅より徒歩10分/駐車場有"
              hours={<p style={{ lineHeight: "22px" }}>11:30〜14:30(LO14:00) / 17:00〜22:00(LO21:30)</p>}
              closed="定休日 火曜"
              paddingLeft={40}
              paddingTop={29}
            />
          </div>
          <div style={{ width: 650, display: "flex", flexShrink: 0 }}>
            <div style={{ width: 280, height: 280, background: "#2b2b2b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 14, color: "rgba(255,255,255,0.8)", letterSpacing: "1px" }}>Coming Soon</p>
            </div>
            <InfoPanel
              enLabel={"HEIJOHTEI "}
              name="ヘイジョウテイ"
              address="京都府亀岡市篠町浄法寺中村34-6"
              phone="0771-20-1960"
              access="JR嵯峨野線「亀岡」駅から徒歩15分"
              hours={<p style={{ lineHeight: "22px" }}>月、水〜日、祝日、祝前日: 16:00〜22:30</p>}
              closed="定休日 火曜"
              paddingLeft={40}
              paddingTop={29}
            />
          </div>
        </div>
      </div>

      {/* ━━━ 店舗一覧ボタン ━━━ */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 63, paddingBottom: 206 }}>
        <a
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: 142,
            height: 50,
            borderRadius: 25,
            border: "1px solid rgba(221,168,63,0.6)",
            textDecoration: "none",
          }}
        >
          <span style={{ fontFamily: sans, fontSize: 16, color: "#fff" }}>·</span>
          <span style={{ fontFamily: mincho, fontSize: 12, letterSpacing: "1px", color: "#fff" }}>店舗一覧</span>
        </a>
      </div>
    </section>
  );
}
