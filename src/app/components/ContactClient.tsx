"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";

import ContactForm from "./contact/ContactForm";
import ContactConfirm from "./contact/ContactConfirm";
import ContactComplete from "./contact/ContactComplete";

// SP
import { ContactFormSP, ContactConfirmSP, ContactCompleteSP } from "./sp/ContactSP";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

import { CONTACT_STORES, INQUIRY_TYPES } from "@/app/lib/contactData";
import type { PublicStore } from "@/app/lib/storesDb";
import type { ContactPayload } from "@/app/lib/contactMail";

// API へ送るのは最小ペイロード（storeTel/storeHours/storeClosedDays はサーバー側で解決するため不要）
type ContactRequestPayload = Omit<ContactPayload, "storeHours" | "storeClosedDays">;

const DESIGN_PC = 1440;
const DESIGN_SP = 390;
const CONTACT_HEIGHT = 2008; // Figma(PC): フッター開始 y=2008（各ステップ共通）

// SP: ヘッダースペーサー(153)を除いたコンテンツの初期推定（実測前の初回描画用・ResizeObserver で確定）
const SP_HEADER = 153;
const SP_EST_FORM = 1480;
const SP_EST_CONFIRM = 1180;
const SP_EST_COMPLETE = 1030;

export type ContactForm = {
  name: string;
  kana: string;
  email: string;
  emailConfirm: string;
  phone: string;
  inquiryType: string;
  store: string;
  message: string;
  agreed: boolean;
};

function emptyForm(defaultStore: string): ContactForm {
  return {
    name: "",
    kana: "",
    email: "",
    emailConfirm: "",
    phone: "",
    inquiryType: INQUIRY_TYPES[0],
    store: defaultStore,
    message: "",
    agreed: false,
  };
}

/**
 * /contact お問い合わせフロー。
 * useIsMobile で PC（1440）/ SP（390）を切り替える。データ層（form 状態）は共通。
 * 3 ステップ（入力→確認→完了）の状態を一元管理し、ステップ間で入力内容を引き継ぐ。
 * SP は本文量で高さが変わるため ResizeObserver で実測してセクション全高を確定する。
 * 予約モーダル・ハンバーガーは ScaledSection 外で一元管理。
 */
export default function ContactClient({ stores }: { stores?: PublicStore[] }) {
  const storeList = stores && stores.length > 0 ? stores : CONTACT_STORES;
  const isMobile = useIsMobile();

  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ContactForm>(() => emptyForm(storeList[0].name));
  const [measured, setMeasured] = useState<number | null>(null);

  const goStep = (n: number) => {
    setStep(n);
    setMeasured(null); // ステップ毎にコンテンツ高さが変わるため実測値をリセット
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 送信
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  const selectedStore = storeList.find((s) => s.name === form.store) ?? storeList[0];

  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const payload: ContactRequestPayload = {
      name: form.name,
      kana: form.kana,
      email: form.email,
      phone: form.phone,
      inquiryType: form.inquiryType,
      store: selectedStore.name,
      storeTel: selectedStore.tel,
      message: form.message,
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, turnstileToken }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "送信に失敗しました。");
      goStep(3);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "送信に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  const onMeasured = (h: number) => setMeasured((p) => (p === h ? p : h));

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    const est = step === 1 ? SP_EST_FORM : step === 2 ? SP_EST_CONFIRM : SP_EST_COMPLETE;
    const height = SP_HEADER + (measured ?? est);
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={height}>
          {step === 1 && (
            <ContactFormSP
              height={height}
              form={form}
              onChange={setForm}
              onNext={() => goStep(2)}
              storeNames={storeList.map((s) => s.name)}
              onMeasured={onMeasured}
            />
          )}
          {step === 2 && (
            <ContactConfirmSP
              height={height}
              form={form}
              onBack={() => goStep(1)}
              onConfirm={handleConfirm}
              submitting={submitting}
              submitError={submitError}
              onVerify={setTurnstileToken}
              turnstileReady={!!turnstileToken}
              onMeasured={onMeasured}
            />
          )}
          {step === 3 && <ContactCompleteSP height={height} tel={selectedStore.tel} onMeasured={onMeasured} />}
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
      <ScaledSection designWidth={DESIGN_PC} height={CONTACT_HEIGHT}>
        {step === 1 && (
          <ContactForm
            height={CONTACT_HEIGHT}
            onOpenModal={openModal}
            form={form}
            onChange={setForm}
            onNext={() => goStep(2)}
            storeNames={storeList.map((s) => s.name)}
          />
        )}
        {step === 2 && (
          <ContactConfirm
            height={CONTACT_HEIGHT}
            onOpenModal={openModal}
            form={form}
            onBack={() => goStep(1)}
            onConfirm={handleConfirm}
            submitting={submitting}
            submitError={submitError}
            onVerify={setTurnstileToken}
            turnstileReady={!!turnstileToken}
          />
        )}
        {step === 3 && <ContactComplete height={CONTACT_HEIGHT} onOpenModal={openModal} tel={selectedStore.tel} />}
      </ScaledSection>

      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}
