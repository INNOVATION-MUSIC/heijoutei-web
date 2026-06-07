"use client";

import { useMemo, useState } from "react";
import ScaledSection from "../ScaledSection";
import ReserveModal from "../ReserveModal";
import StickyButton from "../StickyButton";
import Footer from "../Footer";

import Step1DateTime from "./Step1DateTime";
import Step2Menu from "./Step2Menu";
import Step3Form from "./Step3Form";
import Step4Confirm from "./Step4Confirm";
import Step5Complete from "./Step5Complete";

import { TAKEOUT_CATEGORIES, TAKEOUT_MENU, TAKEOUT_STORES, buildCalendar, formatJpDate, type TakeoutCategory, type TakeoutStore } from "@/app/lib/takeoutData";
import type { OrderPayload } from "@/app/lib/takeoutMail";

const DESIGN_PC = 1440;

export type TakeoutForm = {
  name: string;
  kana: string;
  email: string;
  emailConfirm: string;
  phone: string;
  note: string;
  agreed: boolean;
};

const EMPTY_FORM: TakeoutForm = { name: "", kana: "", email: "", emailConfirm: "", phone: "", note: "", agreed: false };

/**
 * /takeout テイクアウト注文フロー（PC専用）。
 * 5 ステップ（日時選択→メニュー→情報入力→注文確認→完了）の状態を一元管理し、
 * 受取店舗・受取日時・カート・入力フォームをステップ間で引き継ぐ。
 * SP はデザイン未確定のため未実装（PC 設計を ScaledSection で縮小表示）。
 * 予約モーダルは ScaledSection 外で一元管理。
 */
export default function TakeoutClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const [step, setStep] = useState(1);

  // 受取情報
  const [store, setStore] = useState<TakeoutStore>(TAKEOUT_STORES[0]);
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [dateIso, setDateIso] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  // メニューカテゴリ
  const [activeCategory, setActiveCategory] = useState<TakeoutCategory>(TAKEOUT_CATEGORIES[0]);

  // カート（itemId → 数量）
  const [cart, setCart] = useState<Record<string, number>>({});

  // 入力フォーム
  const [form, setForm] = useState<TakeoutForm>(EMPTY_FORM);

  const calendar = useMemo(() => buildCalendar(view.year, view.month, today), [view, today]);
  const weeks = calendar.length / 7;

  // カート計算
  const cartLines = useMemo(
    () =>
      TAKEOUT_MENU.filter((m) => (cart[m.id] ?? 0) > 0).map((m) => ({ item: m, qty: cart[m.id] })),
    [cart]
  );
  const subtotal = useMemo(() => cartLines.reduce((s, l) => s + l.item.price * l.qty, 0), [cartLines]);
  const cartCount = useMemo(() => cartLines.reduce((s, l) => s + l.qty, 0), [cartLines]);

  const setQty = (id: string, qty: number) =>
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(qty, 99);
      return next;
    });

  const goPrevMonth = () => setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }));
  const goNextMonth = () => setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }));

  const goStep = (n: number) => {
    setStep(n);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 注文確定（メール送信）
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const payload: OrderPayload = {
      store: store.name,
      storeTel: store.tel,
      dateLabel: dateIso ? `${formatJpDate(dateIso)} ${time ? time.replace(/ /g, "") : ""}`.trim() : "",
      items: cartLines.map((l) => ({ name: l.item.name, price: l.item.price, qty: l.qty })),
      total: subtotal,
      customer: { name: form.name, kana: form.kana, email: form.email, phone: form.phone, note: form.note },
    };
    try {
      const res = await fetch("/api/takeout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "送信に失敗しました。");
      goStep(5);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "送信に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  // step2 の高さは「メニュー列」「カート列」の高い方に合わせて可変
  const step2Height = useMemo(() => {
    const GRID_TOP = 1021;
    const menuRows = Math.max(1, Math.ceil(TAKEOUT_MENU.filter((m) => m.category === activeCategory).length / 2));
    const menuBottom = GRID_TOP + menuRows * 240 - 40;
    const cartHeight = 296 + Math.max(20, cartLines.length * 32);
    const cartBottom = GRID_TOP + cartHeight + 162; // カート + 赤ボタン + 戻るボタン
    return Math.max(menuBottom, cartBottom) + 130;
  }, [activeCategory, cartLines.length]);

  // ステップ別の高さ
  const heights = [
    2300 + (weeks - 5) * 52, // step1（カレンダー週数で可変）
    step2Height, // step2
    2060, // step3
    2060, // step4
    2060, // step5
  ];
  const height = heights[step - 1];

  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={height}>
        {step === 1 && (
          <Step1DateTime
            height={height}
            onOpenModal={openModal}
            stores={TAKEOUT_STORES}
            store={store}
            onSelectStore={setStore}
            calendar={calendar}
            view={view}
            onPrevMonth={goPrevMonth}
            onNextMonth={goNextMonth}
            dateIso={dateIso}
            onSelectDate={setDateIso}
            time={time}
            onSelectTime={setTime}
            onNext={() => goStep(2)}
          />
        )}
        {step === 2 && (
          <Step2Menu
            height={height}
            onOpenModal={openModal}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            cart={cart}
            onSetQty={setQty}
            cartLines={cartLines}
            subtotal={subtotal}
            cartCount={cartCount}
            onBack={() => goStep(1)}
            onNext={() => goStep(3)}
          />
        )}
        {step === 3 && (
          <Step3Form
            height={height}
            onOpenModal={openModal}
            form={form}
            onChange={setForm}
            onBack={() => goStep(2)}
            onNext={() => goStep(4)}
          />
        )}
        {step === 4 && (
          <Step4Confirm
            height={height}
            onOpenModal={openModal}
            store={store}
            dateIso={dateIso}
            time={time}
            cartLines={cartLines}
            subtotal={subtotal}
            form={form}
            onBack={() => goStep(3)}
            onConfirm={handleConfirm}
            submitting={submitting}
            submitError={submitError}
          />
        )}
        {step === 5 && <Step5Complete height={height} onOpenModal={openModal} store={store} />}
      </ScaledSection>

      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}

export type CartLine = { item: (typeof TAKEOUT_MENU)[number]; qty: number };
