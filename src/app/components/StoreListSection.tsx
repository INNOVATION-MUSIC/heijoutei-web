"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import PageHeader from "./PageHeader";
import OutlineButton from "./OutlineButton";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";
const sans = "'Noto Sans JP', sans-serif";

/* ━━━ 店舗データ ━━━ */
type Store = {
  enLabel: string;
  name: string;
  address: string;
  phone: string;
  access: string;
  hours: ReactNode;
  closed: string;
  img?: string; // 未指定は Coming Soon
};

const STORES: Store[] = [
  {
    enLabel: "HEIJOHTEI  KAMEOKA",
    name: "平壌亭  亀岡店",
    address: "京都府亀岡市篠町浄法寺中村３５-５",
    phone: "0771-23-8410",
    access: "30台駐車場完備/8名様よりマイクロバス送迎あり",
    hours: (
      <>
        <p style={{ lineHeight: "22px" }}>月、水〜日、祝日、祝前日: 11:30〜14:30（料理L.O. 14:00 ドリンクL.O. 14:00）</p>
        <p style={{ lineHeight: "22px" }}>16:00〜22:30（料理L.O. 22:00 ドリンクL.O. 22:00）</p>
      </>
    ),
    closed: "定休日 火曜",
    img: "/images/storelist_kameoka.webp",
  },
  {
    enLabel: "HEIJOHTEI  SONOBE",
    name: "平壌亭  園部店",
    address: "京都府南丹市園部町上木崎町坪ノ内26-5",
    phone: "0771-68-1760",
    access: "20台駐車場完備/8名様よりマイクロバス送迎あり",
    hours: <p style={{ lineHeight: "22px" }}>月、水〜日、祝日、祝前日: 16:00〜22:30</p>,
    closed: "定休日 火曜",
    img: "/images/storelist_sonobe.webp",
  },
  {
    enLabel: "HEIJOHTEI  FUKUCHIYAMA",
    name: "平壌亭  福知山店",
    address: "京都府福知山市字堀2303の２",
    phone: "0773-24-2322",
    access: "15台駐車場完備/8名様よりマイクロバス送迎あり",
    hours: <p style={{ lineHeight: "22px" }}>月、水〜日、祝日、祝前日: 16:00〜22:30</p>,
    closed: "定休日 火曜",
    img: "/images/storelist_fukuchiyama.webp",
  },
  {
    enLabel: "YAKINIKU  YURANO",
    name: "焼肉ゆらの",
    address: "京都府福知山堀今岡６番地ゆらのガーデン内",
    phone: "0773-45-8429",
    access: "JR福知山駅より徒歩10分/駐車場有",
    hours: <p style={{ lineHeight: "22px" }}>11:30〜14:30(LO14:00) / 17:00〜22:00(LO21:30)</p>,
    closed: "定休日 火曜",
    img: "/images/storelist_yurano.webp",
  },
  {
    enLabel: "HEIJOHTEI",
    name: "ヘイジョウテイ",
    address: "京都府亀岡市篠町浄法寺中村34-6",
    phone: "0771-20-1960",
    access: "JR嵯峨野線「亀岡」駅から徒歩15分",
    hours: <p style={{ lineHeight: "22px" }}>月、水〜日、祝日、祝前日: 16:00〜22:30</p>,
    closed: "定休日 火曜",
    // img なし → Coming Soon
  },
];

const detailText = {
  fontFamily: sans,
  fontWeight: 300,
  fontSize: 12,
  lineHeight: "22px",
  letterSpacing: "0.5px",
  color: "#fff",
} as const;

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

/** 店舗詳細ボタン（119×40・右下配置）。詳細ページ未実装のため href="#"。 */
function DetailButton() {
  return <OutlineButton jp="店舗詳細" href="#" width={119} height={40} />;
}

/** 店舗カード（1340×350）。左=写真742×350 / 右=情報パネル。 */
function StoreCard({ store }: { store: Store }) {
  return (
    <div style={{ display: "flex", width: 1340, height: 350 }}>
      {/* 写真 or Coming Soon */}
      {store.img ? (
        <div style={{ width: 742, height: 350, position: "relative", overflow: "hidden", background: "#1c110a", flexShrink: 0 }}>
          <Image src={store.img} alt={store.name} fill className="object-cover" sizes="742px" />
        </div>
      ) : (
        <div style={{ width: 742, height: 350, background: "#2b2b2b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <p style={{ fontFamily: display, fontSize: 28, color: "rgba(255,255,255,0.5)", letterSpacing: "1px" }}>Coming Soon</p>
        </div>
      )}

      {/* 情報パネル */}
      <div style={{ flex: 1, background: "#171717", paddingLeft: 60, paddingTop: 48, paddingRight: 36, paddingBottom: 31, display: "flex", flexDirection: "column" }}>
        {/* 英字ラベル・金線・店名 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 10, letterSpacing: "3px", color: "rgba(217,184,107,0.6)", lineHeight: "normal", whiteSpace: "pre" }}>{store.enLabel}</p>
          <div style={{ width: 32, height: 1, background: "rgba(217,184,107,0.45)" }} />
          <p style={{ fontFamily: mincho, fontWeight: 800, fontSize: 26, letterSpacing: "2px", color: "#fff", lineHeight: "normal", whiteSpace: "pre" }}>{store.name}</p>
        </div>
        {/* 詳細情報 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <p style={detailText}>{store.address}</p>
            <MapBadge address={store.address} />
          </div>
          <p style={detailText}>{store.phone}</p>
          <p style={detailText}>{store.access}</p>
          <div style={{ ...detailText }}>{store.hours}</div>
          <p style={detailText}>{store.closed}</p>
        </div>
        {/* 店舗詳細ボタン（右下） */}
        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
          <DetailButton />
        </div>
      </div>
    </div>
  );
}

type Props = {
  onOpenModal: () => void;
  height: number;
};

/**
 * /store 店舗一覧ページのメインコンテンツ（PageHeader 含む）。
 * Figma 設計幅 1440・「店舗一覧」161:504 準拠。
 * 見出しは /news・/about と同構成。本体は全幅カード（1340×350）を 5 件縦に並べる。
 */
export default function StoreListSection({ onOpenModal, height }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height, background: "#0a0a0a", overflow: "hidden" }}>
      {/* 共通ヘッダー */}
      <PageHeader onOpenModal={onOpenModal} />

      {/* StoreInfo 見出し + ヒーロー画像（Hero 上端 y=297） */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingLeft: 57, paddingRight: 40, paddingTop: 144 }}>
        {/* 左: ラベル + StoreInfo */}
        <div style={{ display: "flex", gap: 49, alignItems: "flex-start", paddingTop: 48 }}>
          {/* 縦書きラベル「店舗」（タイトルより 10px 低い位置） */}
          <div style={{ paddingTop: 10, flexShrink: 0 }}>
            <div style={{ width: 44, height: 85, border: "1px solid rgba(255,255,255,0.3)", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <span style={{ writingMode: "vertical-rl" as const, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff", lineHeight: 1 }}>店舗</span>
            </div>
          </div>
          <p style={{ fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0 }}>StoreInfo</p>
        </div>
        {/* 右: ヒーロー画像 820×320 */}
        <div style={{ width: 820, height: 320, position: "relative", overflow: "hidden", flexShrink: 0 }}>
          <Image src="/images/storelist_hero.webp" alt="焼肉平壌亭 店舗一覧" fill className="object-cover" sizes="820px" />
        </div>
      </div>

      {/* 店舗カード群（先頭カード上端 y=803） */}
      <div style={{ paddingTop: 186, paddingLeft: 50, paddingRight: 50, paddingBottom: 257, display: "flex", flexDirection: "column", gap: 60 }}>
        {STORES.map((store) => (
          <StoreCard key={store.name} store={store} />
        ))}
      </div>
    </div>
  );
}
