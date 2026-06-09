"use client";

import { useState } from "react";
import Image from "next/image";
import { MENU_CATEGORIES, type MenuCategory, type MenuPromo } from "@/app/lib/menuData";
import { SECTION_LINKS } from "@/app/lib/navLinks";
import { MenuHeading, StoreTabs, useStoreParam, withStore, mincho, sans, display, PANEL, GOLD } from "./MenuShared";

// カテゴリページ下部の3バナー（ランチ/テイクアウト/コース）。写真は既存アセットを流用。
const PROMOS: MenuPromo[] = [
  {
    en: "Lunch",
    title: "ランチメニュー",
    desc: "ランチタイムから、気軽に本格焼肉をお楽しみいただけます。ご友人同士でのランチはもちろん、お仕事の合間のお食事やご家族でのお集まり、学生グループでのご利用まで、幅広いシーンでご好評いただいております。",
    photo: "/images/lunch_main.webp",
    href: SECTION_LINKS.lunch,
  },
  {
    en: "Take Out",
    title: "テイクアウトメニュー",
    desc: "ご自宅で手軽に本格焼肉をお楽しみいただけます。お弁当やオードブルなど、ご家族でのお食事やお集まりに合わせてお選びいただけます。お電話・オンラインでのご予約も承っております。",
    photo: "/images/takeout_steak.webp",
    href: "/menu/takeout",
  },
  {
    en: "Course",
    title: "コースメニュー",
    desc: "ご宴会やご接待、ご家族のお祝いに最適なコースをご用意しております。厳選したお肉と一品料理を心ゆくまでご堪能ください。ご予算やご人数に合わせてご相談も承ります。",
    photo: "/images/course1.webp",
    href: SECTION_LINKS.course,
  },
];

/* ─────────── カテゴリカード（420×200・クリックで /menu/[slug]） ─────────── */
function CategoryCard({ category, storeId }: { category: MenuCategory; storeId: string }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={withStore(`/menu/${category.slug}`, storeId)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        width: 420,
        height: 200,
        background: PANEL,
        textDecoration: "none",
        outline: hover ? `1px solid ${GOLD}` : "1px solid transparent",
        transition: "outline-color 0.3s ease",
      }}
    >
      <div style={{ position: "relative", width: 200, height: 200, overflow: "hidden", background: "#22140c", flexShrink: 0 }}>
        <Image
          src={category.cardPhoto}
          alt={category.name}
          fill
          className="object-cover"
          sizes="200px"
          style={{ transform: hover ? "scale(1.06)" : "scale(1)", transition: "transform 0.4s ease" }}
        />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", paddingLeft: 38, paddingRight: 16 }}>
        <span style={{ fontFamily: mincho, fontSize: 24, fontWeight: 600, letterSpacing: "2px", color: "#fff", lineHeight: 1.4 }}>
          {category.name}
        </span>
      </div>
    </a>
  );
}

/* ─────────── プロモバナー（1340×320・写真420 + テキスト） ─────────── */
function PromoBanner({ promo }: { promo: MenuPromo }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={promo.href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: "flex", width: 1340, height: 320, background: PANEL, textDecoration: "none" }}
    >
      <div style={{ position: "relative", width: 420, height: 320, overflow: "hidden", background: "#22140c", flexShrink: 0 }}>
        <Image
          src={promo.photo}
          alt={promo.title}
          fill
          className="object-cover"
          sizes="420px"
          style={{ transform: hover ? "scale(1.05)" : "scale(1)", transition: "transform 0.4s ease" }}
        />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: 60, paddingRight: 60, paddingTop: 50 }}>
        <span style={{ fontFamily: display, fontSize: 16, letterSpacing: "0.1em", color: GOLD }}>{promo.en}</span>
        <div style={{ width: 32, height: 1, background: GOLD, marginTop: 12 }} />
        <span style={{ fontFamily: mincho, fontSize: 26, letterSpacing: "0.06em", color: "#ebe5db", marginTop: 14 }}>{promo.title}</span>
        <p style={{ fontFamily: sans, fontSize: 14, lineHeight: "28px", letterSpacing: "0.04em", color: "#99948c", width: 800, marginTop: 22 }}>
          {promo.desc}
        </p>
      </div>
    </a>
  );
}

/**
 * /menu カテゴリページのメインコンテンツ（PC のみ・全高 3346px・フッターは別 ScaledSection）。
 * 共有コンポーネント（PageHeader/Footer/OutlineButton）は変更せず再利用。
 */
export default function MenuCategorySection({ onOpenModal }: { onOpenModal: () => void }) {
  const [storeId, setStore] = useStoreParam();
  return (
    <section style={{ display: "flex", flexDirection: "column", width: 1440, height: 3346, background: "#0a0a0a" }}>
      <MenuHeading onOpenModal={onOpenModal} />
      <StoreTabs activeId={storeId} onSelect={setStore} />

      {/* カテゴリカードグリッド（3列×4行・gap40） */}
      <div style={{ display: "flex", flexWrap: "wrap", columnGap: 40, rowGap: 40, paddingLeft: 50, paddingRight: 50, paddingTop: 62 }}>
        {MENU_CATEGORIES.map((c) => (
          <CategoryCard key={c.slug} category={c} storeId={storeId} />
        ))}
      </div>

      {/* プロモバナー（ランチ/テイクアウト/コース） */}
      <div style={{ display: "flex", flexDirection: "column", gap: 68, paddingLeft: 50, paddingRight: 50, paddingTop: 76 }}>
        {PROMOS.map((p) => (
          <PromoBanner key={p.en} promo={p} />
        ))}
      </div>

      <div style={{ flex: 1 }} />
    </section>
  );
}
