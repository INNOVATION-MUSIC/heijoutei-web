"use client";

import { useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";

import ContactForm from "./contact/ContactForm";
import ContactConfirm from "./contact/ContactConfirm";
import ContactComplete from "./contact/ContactComplete";

import { CONTACT_STORES, INQUIRY_TYPES } from "@/app/lib/contactData";
import type { ContactPayload } from "@/app/lib/contactMail";

const DESIGN_PC = 1440;
const CONTACT_HEIGHT = 2008; // Figma: フッター開始 y=2008（各ステップ共通）

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

const EMPTY_FORM: ContactForm = {
  name: "",
  kana: "",
  email: "",
  emailConfirm: "",
  phone: "",
  inquiryType: INQUIRY_TYPES[0],
  store: CONTACT_STORES[0].name,
  message: "",
  agreed: false,
};

/**
 * /contact お問い合わせフロー（PC専用）。
 * 3 ステップ（入力→確認→完了）の状態を一元管理し、ステップ間で入力内容を引き継ぐ。
 * SP はデザイン未確定のため未実装（PC 設計を ScaledSection で縮小表示）。
 * 予約モーダルは ScaledSection 外で一元管理。
 */
export default function ContactClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);

  const goStep = (n: number) => {
    setStep(n);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 送信
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  const selectedStore = CONTACT_STORES.find((s) => s.name === form.store) ?? CONTACT_STORES[0];

  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const payload: ContactPayload = {
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
