"use client";

import Image from "next/image";
import { TakeoutHeader, TakeoutStepper, RedButton, OutlineButton, mincho, sans } from "./TakeoutShared";
import { type TakeoutMenuItem } from "@/app/lib/takeoutData";
import type { CartLine } from "./TakeoutClient";

const PANEL = "#171717";
const GOLD = "#d9b86b";
const GOLD_BAR = "rgba(217,184,107,0.8)";
const GOLD_BORDER = "rgba(221,168,63,0.6)";

type Props = {
  height: number;
  onOpenModal: () => void;
  menuItems: TakeoutMenuItem[];
  categories: string[];
  activeCategory: string;
  onSelectCategory: (c: string) => void;
  cart: Record<string, number>;
  onSetQty: (id: string, qty: number) => void;
  cartLines: CartLine[];
  subtotal: number;
  cartCount: number;
  onBack: () => void;
  onNext: () => void;
};

export default function Step2Menu(p: Props) {
  const items = p.menuItems.filter((m) => m.category === p.activeCategory);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height: p.height, background: "#0a0a0a", overflow: "hidden" }}>
      <TakeoutHeader onOpenModal={p.onOpenModal} />

      {/* ステッパー */}
      <div style={{ paddingTop: 130 }}>
        <TakeoutStepper current={2} />
      </div>

      {/* カテゴリタブ */}
      <div style={{ paddingLeft: 50, paddingRight: 50, paddingTop: 64 }}>
        <div style={{ width: 1340 }}>
          <div style={{ display: "flex" }}>
            {p.categories.map((c) => {
              const active = c === p.activeCategory;
              return (
                <button
                  key={c}
                  onClick={() => p.onSelectCategory(c)}
                  style={{ flex: 1, height: 80, background: "transparent", border: "none", cursor: "pointer", fontFamily: mincho, fontSize: 17, letterSpacing: "0.04em", color: active ? "#ebe5db" : "rgba(235,229,219,0.45)", whiteSpace: "nowrap" }}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <div style={{ position: "relative", width: 1340, height: 2, background: "rgba(235,229,219,0.15)" }}>
            <div style={{ position: "absolute", top: 0, left: `${(p.categories.indexOf(p.activeCategory) * 100) / p.categories.length}%`, width: `${100 / p.categories.length}%`, height: 2, background: GOLD_BAR, transition: "left 0.25s ease" }} />
          </div>
        </div>
      </div>

      {/* 税込注記 */}
      <div style={{ paddingLeft: 50, paddingTop: 28 }}>
        <span style={{ fontFamily: sans, fontSize: 13, color: "rgba(235,229,219,0.6)" }}>※ 価格はすべて税込表示です</span>
      </div>

      {/* メニューグリッド + カート */}
      <div style={{ display: "flex", gap: 40, paddingLeft: 50, paddingRight: 50, paddingTop: 18 }}>
        {/* 左: メニューカード（2列） */}
        <div style={{ width: 880, display: "flex", flexWrap: "wrap", gap: 40, alignContent: "flex-start" }}>
          {items.map((item) => (
            <MenuCard key={item.id} item={item} qty={p.cart[item.id] ?? 0} onSetQty={p.onSetQty} />
          ))}
        </div>

        {/* 右: ご注文内容 */}
        <div style={{ width: 420, display: "flex", flexDirection: "column", gap: 30 }}>
          <CartPanel lines={p.cartLines} subtotal={p.subtotal} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <RedButton label="購入者情報入力へ進む" onClick={p.onNext} disabled={p.cartCount === 0} width={250} />
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <OutlineButton label="日時選択へ戻る" onClick={p.onBack} width={172} />
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />
    </div>
  );
}

/* ─────────── メニューカード ─────────── */
function MenuCard({ item, qty, onSetQty }: { item: TakeoutMenuItem; qty: number; onSetQty: (id: string, qty: number) => void }) {
  return (
    <div style={{ width: 420, height: 200, background: PANEL, display: "flex", overflow: "hidden" }}>
      <div style={{ position: "relative", width: 200, height: 200, flexShrink: 0 }}>
        <Image src={item.img} alt={item.name} fill className="object-cover" sizes="200px" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "22px 24px 18px 28px" }}>
        <p style={{ margin: 0, fontFamily: mincho, fontSize: 24, letterSpacing: "0.04em", color: "#ebe5db", lineHeight: 1.1 }}>{item.name}</p>
        <p style={{ margin: 0, paddingTop: 10, fontFamily: sans, fontSize: 12, color: "rgba(235,229,219,0.55)", lineHeight: "19px", whiteSpace: "pre-line" }}>{item.desc}</p>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <span style={{ fontFamily: mincho, fontSize: 24, color: "#ebe5db", lineHeight: 1 }}>{item.price.toLocaleString()}</span>
            <span style={{ fontFamily: mincho, fontSize: 14, color: "#ebe5db" }}>円</span>
          </div>
          <QtyStepper qty={qty} onChange={(q) => onSetQty(item.id, q)} />
        </div>
      </div>
    </div>
  );
}

function QtyStepper({ qty, onChange }: { qty: number; onChange: (q: number) => void }) {
  const btn: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "#ebe5db", fontSize: 16, lineHeight: 1, width: 22, display: "flex", alignItems: "center", justifyContent: "center" };
  return (
    <div style={{ display: "flex", alignItems: "center", width: 80, height: 30, borderRadius: 15, border: `1px solid ${GOLD_BORDER}`, justifyContent: "space-between", padding: "0 8px" }}>
      <button onClick={() => onChange(Math.max(0, qty - 1))} style={btn} aria-label="減らす">−</button>
      <span style={{ fontFamily: mincho, fontSize: 14, color: "#ebe5db", minWidth: 12, textAlign: "center" }}>{qty}</span>
      <button onClick={() => onChange(qty + 1)} style={btn} aria-label="増やす">+</button>
    </div>
  );
}

/* ─────────── ご注文内容（カート） ─────────── */
function CartPanel({ lines, subtotal }: { lines: CartLine[]; subtotal: number }) {
  return (
    <div style={{ width: 420, background: PANEL, overflow: "hidden" }}>
      <div style={{ height: 2, background: GOLD_BAR }} />
      <div style={{ padding: "28px 28px 32px", display: "flex", flexDirection: "column" }}>
        {/* タイトル */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BasketIcon />
          <span style={{ fontFamily: mincho, fontSize: 24, letterSpacing: "0.04em", color: "#ebe5db" }}>ご注文内容</span>
        </div>

        {/* 明細 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 28 }}>
          {lines.length === 0 ? (
            <span style={{ fontFamily: sans, fontSize: 13, color: "rgba(235,229,219,0.5)" }}>商品が選択されていません。</span>
          ) : (
            lines.map((l) => (
              <div key={l.item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: mincho, fontSize: 16, color: "#ebe5db" }}>{l.item.name}</span>
                <span style={{ fontFamily: mincho, fontSize: 14, color: "#ebe5db", display: "flex", alignItems: "baseline", gap: 4 }}>
                  {l.item.price.toLocaleString()}<span style={{ fontSize: 11 }}>円</span>
                  <span style={{ color: "rgba(235,229,219,0.6)" }}>×</span>
                  <span style={{ color: GOLD }}>{l.qty}</span>
                  <span style={{ fontSize: 11 }}>点</span>
                </span>
              </div>
            ))
          )}
        </div>

        {/* 小計 */}
        <div style={{ height: 1, background: "rgba(235,229,219,0.15)", margin: "22px 0 18px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: mincho, fontSize: 16, color: "#ebe5db" }}>小計<span style={{ fontSize: 11, color: "rgba(235,229,219,0.6)" }}>（消費税8%含む）</span></span>
          <span style={{ fontFamily: mincho, fontSize: 16, color: "#ebe5db" }}>{subtotal.toLocaleString()}<span style={{ fontSize: 11 }}>円</span></span>
        </div>
        <p style={{ margin: "10px 0 0", fontFamily: sans, fontSize: 11, color: "rgba(235,229,219,0.45)", lineHeight: "17px" }}>
          ※軽減税率（8%）対象。<br />お支払い代金は店頭・受け取り時にお支払いいただけます。
        </p>

        {/* 合計 */}
        <div style={{ height: 1, background: "rgba(235,229,219,0.15)", margin: "20px 0 18px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: mincho, fontSize: 20, color: "#ebe5db" }}>合計</span>
          <span style={{ fontFamily: mincho, fontSize: 22, color: "#ebe5db" }}>{subtotal.toLocaleString()}<span style={{ fontSize: 12 }}>円</span></span>
        </div>
      </div>
    </div>
  );
}

function BasketIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ebe5db" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9h14l-1.2 9.5a2 2 0 0 1-2 1.5H8.2a2 2 0 0 1-2-1.5L5 9z" />
      <path d="M9 9 12 3l3 6" />
    </svg>
  );
}
