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

import { TAKEOUT_CATEGORIES, TAKEOUT_MENU, TAKEOUT_STORES, TAKEOUT_TIME_SLOTS, buildCalendar, type TakeoutStore, type TakeoutMenuItem, type DaySlotMap } from "@/app/lib/takeoutData";
import type { TakeoutMenuData } from "@/app/lib/takeoutOrderDb";

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
export default function TakeoutClient({
  stores,
  menuByStore,
  slotsByStore,
}: {
  stores?: TakeoutStore[];
  menuByStore?: Record<string, TakeoutMenuData>;
  slotsByStore?: Record<string, DaySlotMap>;
} = {}) {
  // DB 連携データ（無ければ静的フォールバック）
  const STORES = stores && stores.length > 0 ? stores : TAKEOUT_STORES;
  const MENU_BY_STORE = menuByStore ?? {};
  const SLOTS = slotsByStore ?? {};

  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const [step, setStep] = useState(1);

  // 受取情報
  const [store, setStore] = useState<TakeoutStore>(STORES[0]);

  // 選択中店舗のメニュー（DB 店舗別 → 無ければ静的フォールバック）
  const storeMenu = MENU_BY_STORE[store.id];
  const CATS = storeMenu && storeMenu.categories.length > 0 ? storeMenu.categories : [...TAKEOUT_CATEGORIES];
  const ITEMS = storeMenu && storeMenu.items.length > 0 ? storeMenu.items : TAKEOUT_MENU;
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [dateIso, setDateIso] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  // メニューカテゴリ
  const [activeCategory, setActiveCategory] = useState<string>(CATS[0]);

  // カート（itemId → 数量）
  const [cart, setCart] = useState<Record<string, number>>({});

  // 入力フォーム
  const [form, setForm] = useState<TakeoutForm>(EMPTY_FORM);

  // 選択中店舗のDB受付枠（未投入なら undefined → buildCalendar はアルゴリズム既定）
  const storeSlots = SLOTS[store.id];
  const calendar = useMemo(() => buildCalendar(view.year, view.month, today, storeSlots), [view, today, storeSlots]);
  const weeks = calendar.length / 7;

  // 選択中受取日の受付時間枠（DB枠がある日はその受付可能枠・無ければ既定の全枠）
  const timeSlots = useMemo(() => {
    const slot = dateIso ? storeSlots?.[dateIso] : undefined;
    return slot ? slot.timeLabels : TAKEOUT_TIME_SLOTS;
  }, [dateIso, storeSlots]);

  // カート計算
  const cartLines = useMemo(
    () =>
      ITEMS.filter((m) => (cart[m.id] ?? 0) > 0).map((m) => ({ item: m, qty: cart[m.id] })),
    [cart, ITEMS]
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
  const [turnstileToken, setTurnstileToken] = useState("");

  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError(null);
    // 価格・合計・商品名はサーバーが店舗メニューから再計算するため送らない（改ざん防止）。
    // クライアントは「どの店舗で・いつ・どの商品を何個」だけを送る。
    const payload = {
      storeSlug: store.id,
      pickupDate: dateIso ?? "",
      pickupTime: time ? time.replace(/ /g, "") : "",
      items: cartLines.map((l) => ({ id: l.item.id, qty: l.qty })),
      customer: { name: form.name, kana: form.kana, email: form.email, phone: form.phone, note: form.note },
    };
    try {
      const res = await fetch("/api/takeout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, turnstileToken }),
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
    const menuRows = Math.max(1, Math.ceil(ITEMS.filter((m) => m.category === activeCategory).length / 2));
    const menuBottom = GRID_TOP + menuRows * 240 - 40;
    const cartHeight = 296 + Math.max(20, cartLines.length * 32);
    const cartBottom = GRID_TOP + cartHeight + 162; // カート + 赤ボタン + 戻るボタン
    return Math.max(menuBottom, cartBottom) + 130;
  }, [activeCategory, cartLines.length, ITEMS]);

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
            stores={STORES}
            store={store}
            onSelectStore={(s) => {
              setStore(s);
              // 店舗で受付枠が異なるため受取日時をリセット
              setDateIso(null);
              setTime(null);
              // 店舗で品目(itemId)が異なるためカートをリセットし、カテゴリも新店舗の先頭へ
              setCart({});
              const m = MENU_BY_STORE[s.id];
              const newCats = m && m.categories.length > 0 ? m.categories : [...TAKEOUT_CATEGORIES];
              setActiveCategory(newCats[0]);
            }}
            calendar={calendar}
            view={view}
            onPrevMonth={goPrevMonth}
            onNextMonth={goNextMonth}
            dateIso={dateIso}
            onSelectDate={(iso) => {
              setDateIso(iso);
              // 受取日を変えても、新しい日の受付時間枠に選択中の時間が含まれていれば維持する。
              // 含まれない場合のみクリア。日付の再クリックや微調整で時間選択が黙って消え、
              // 「メニュー選択へ進む」が押せなくなるのを防ぐ（DB枠で時間が異なる日のみリセット）。
              const slot = storeSlots?.[iso];
              const nextSlots = slot ? slot.timeLabels : TAKEOUT_TIME_SLOTS;
              setTime((prev) => (prev && nextSlots.includes(prev) ? prev : null));
            }}
            time={time}
            onSelectTime={setTime}
            timeSlots={timeSlots}
            onNext={() => goStep(2)}
          />
        )}
        {step === 2 && (
          <Step2Menu
            height={height}
            onOpenModal={openModal}
            menuItems={ITEMS}
            categories={CATS}
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
            onVerify={setTurnstileToken}
            turnstileReady={!!turnstileToken}
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

export type CartLine = { item: TakeoutMenuItem; qty: number };
