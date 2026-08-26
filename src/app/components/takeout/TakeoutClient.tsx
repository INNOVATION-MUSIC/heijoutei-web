"use client";

import { useMemo, useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "../ScaledSection";
import ReserveModal from "../ReserveModal";
import StickyButton from "../StickyButton";
import Footer from "../Footer";

import Step1DateTime from "./Step1DateTime";
import Step2Menu from "./Step2Menu";
import Step3Form from "./Step3Form";
import Step4Confirm from "./Step4Confirm";
import Step5Complete from "./Step5Complete";

// SP
import { Step1DateTimeSP, Step2MenuSP, Step3FormSP, Step4ConfirmSP, Step5CompleteSP } from "../sp/TakeoutSP";
import FooterSP from "../sp/FooterSP";
import SpStickyHeader from "../sp/SpStickyHeader";
import HamburgerMenuSP from "../sp/HamburgerMenuSP";

import { TAKEOUT_CATEGORIES, TAKEOUT_MENU, TAKEOUT_STORES, buildCalendar, buildTimeSlotViews, getMinLeadDays, type TakeoutStore, type TakeoutMenuItem, type DaySlotMap } from "@/app/lib/takeoutData";
import type { TakeoutMenuData } from "@/app/lib/takeoutOrderDb";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;

// SP: ヘッダースペーサー(153)を除いたコンテンツの初期推定（実測前の初回描画用・ResizeObserver で確定）
const SP_HEADER = 153;
const SP_EST = [3300, 3700, 2300, 2800, 2000]; // step1〜5

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
 * /takeout テイクアウト注文フロー。
 * 5 ステップ（日時選択→メニュー→情報入力→注文確認→完了）の状態を一元管理し、
 * 受取店舗・受取日時・カート・入力フォームをステップ間で引き継ぐ。
 * useIsMobile で PC（1440）/ SP（390）を切り替え、状態と送信ロジックは共通化する。
 * SP は ResizeObserver で各ステップの高さを実測し、予約モーダル等は ScaledSection 外で一元管理する。
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
  const ALL_STORES = stores && stores.length > 0 ? stores : TAKEOUT_STORES;
  const MENU_BY_STORE = menuByStore ?? {};
  const SLOTS = slotsByStore ?? {};
  // テイクアウトメニューが登録されている店舗のみ選択肢に出す（未登録店舗は非表示）。
  // menuByStore が空（DB 取得失敗/未設定）のときは静的フォールバックのため全店表示に戻す。
  const storesWithMenu = ALL_STORES.filter((s) => (MENU_BY_STORE[s.id]?.items?.length ?? 0) > 0);
  const STORES = storesWithMenu.length > 0 ? storesWithMenu : ALL_STORES;

  const isMobile = useIsMobile();

  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  const [step, setStep] = useState(1);
  // SP: ステップ毎にコンテンツ高さが変わるため ResizeObserver で実測（PC は未使用）
  const [measured, setMeasured] = useState<number | null>(null);
  const onMeasured = (h: number) => setMeasured((prev) => (prev === h ? prev : h));

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
  const calendar = useMemo(
    () => buildCalendar(view.year, view.month, today, storeSlots, getMinLeadDays(store.id)),
    [view, today, storeSlots, store.id]
  );
  const weeks = calendar.length / 7;

  // 選択中受取日の受取時間枠ビュー（DB枠の満枠・受付締切〔当日60分前〕を反映して disabled/reason を付与）
  const timeSlotViews = useMemo(() => buildTimeSlotViews(dateIso, storeSlots, new Date()), [dateIso, storeSlots]);

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

  // 受取日の選択（新しい日の時間枠に選択中の時間が「選択可能」として残っていれば維持、満枠/締切なら解除）
  const onSelectDate = (iso: string) => {
    setDateIso(iso);
    const views = buildTimeSlotViews(iso, storeSlots, new Date());
    setTime((prev) => (prev && views.some((v) => v.label === prev && !v.disabled) ? prev : null));
  };

  const goPrevMonth = () => setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }));
  const goNextMonth = () => setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }));

  const goStep = (n: number) => {
    setStep(n);
    setMeasured(null); // SP: ステップ毎にコンテンツ高さが変わるため実測値をリセット
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

  // step2 の高さは説明文の長さでカード高さが可変のため ResizeObserver で実測する。
  // 実測前の初回描画用に、固定高想定の概算をフォールバックとして用意する。
  const step2Est = useMemo(() => {
    const GRID_TOP = 1021;
    const menuRows = Math.max(1, Math.ceil(ITEMS.filter((m) => m.category === activeCategory).length / 2));
    const menuBottom = GRID_TOP + menuRows * 240 - 40;
    const cartHeight = 296 + Math.max(20, cartLines.length * 32);
    const cartBottom = GRID_TOP + cartHeight + 162; // カート + 赤ボタン + 戻るボタン
    return Math.max(menuBottom, cartBottom) + 130;
  }, [activeCategory, cartLines.length, ITEMS]);

  const [step2Measured, setStep2Measured] = useState<number | null>(null);

  // ステップ別の高さ
  const heights = [
    2300 + (weeks - 5) * 52, // step1（カレンダー週数で可変）
    step2Measured ?? step2Est, // step2（実測・未測定時は概算）
    2060, // step3
    2060, // step4
    2060, // step5
  ];
  const height = heights[step - 1];

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    const spHeight = SP_HEADER + (measured ?? SP_EST[step - 1]);
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={spHeight}>
          {step === 1 && (
            <Step1DateTimeSP
              height={spHeight}
              onMeasured={onMeasured}
              stores={STORES}
              store={store}
              onSelectStore={(s) => {
                setStore(s);
                setDateIso(null);
                setTime(null);
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
              onSelectDate={onSelectDate}
              time={time}
              onSelectTime={setTime}
              timeSlots={timeSlotViews}
              onNext={() => goStep(2)}
            />
          )}
          {step === 2 && (
            <Step2MenuSP
              height={spHeight}
              onMeasured={onMeasured}
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
            <Step3FormSP
              height={spHeight}
              onMeasured={onMeasured}
              form={form}
              onChange={setForm}
              onBack={() => goStep(2)}
              onNext={() => goStep(4)}
            />
          )}
          {step === 4 && (
            <Step4ConfirmSP
              height={spHeight}
              onMeasured={onMeasured}
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
          {step === 5 && <Step5CompleteSP height={spHeight} onMeasured={onMeasured} store={store} />}
        </ScaledSection>

        <ScaledSection designWidth={DESIGN_SP} height={973}>
          <FooterSP onOpenModal={openModal} />
        </ScaledSection>

        <SpStickyHeader onOpenMenu={openMenu} />
        <HamburgerMenuSP open={menuOpen} onClose={closeMenu} onOpenModal={openModal} />
        <ReserveModal open={modalOpen} onClose={closeModal} isMobile />
      </>
    );
  }

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
            onSelectDate={onSelectDate}
            time={time}
            onSelectTime={setTime}
            timeSlots={timeSlotViews}
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
            onSelectCategory={(c) => {
              // カテゴリ切替で品目（=高さ）が変わるため実測値を破棄して再計測させる
              setActiveCategory(c);
              setStep2Measured(null);
            }}
            cart={cart}
            onSetQty={setQty}
            cartLines={cartLines}
            subtotal={subtotal}
            cartCount={cartCount}
            onBack={() => goStep(1)}
            onNext={() => goStep(3)}
            onMeasured={(h) => setStep2Measured((prev) => (prev === h ? prev : h))}
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
