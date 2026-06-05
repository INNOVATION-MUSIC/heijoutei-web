"use client";

import Image from "next/image";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ReserveModal({ open, onClose }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80" />
      <div
        className="relative bg-[#0f0c0a] border border-[rgba(234,229,219,0.15)] max-w-2xl w-full mx-4 p-12 flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#59544f] hover:text-[#eae5db] text-2xl leading-none"
          aria-label="閉じる"
        >
          ×
        </button>

        <div className="relative w-[160px] h-[84px] mb-8">
          <Image src="/images/logo.jpg" alt="焼肉平壌亭" fill className="object-contain" />
        </div>

        <p className="font-mincho text-[22px] tracking-[0.3em] text-[#eae5db] leading-[44px]">本格炭火焼肉で、</p>
        <p className="font-mincho text-[22px] tracking-[0.3em] text-[#eae5db] leading-[44px] mb-4">特別なひとときを。</p>
        <p className="text-[10px] font-light tracking-[0.2em] text-[#99938c] mb-10">
          Savor unforgettable moments<br />over authentic charcoal-grilled yakiniku.
        </p>

        <div className="flex flex-col gap-4 w-full">
          <a href="#" className="btn-white justify-center text-center w-full py-4">
            <span className="font-mincho text-[13px] tracking-[0.15em]">ご予約</span>
            <span className="text-[#59544f] mx-2">·</span>
            <span className="text-[11px] font-bold">Reserve</span>
          </a>
          <a href="#" className="btn-outline justify-center text-center w-full py-4">
            <span className="font-mincho text-[13px] tracking-[0.15em]">テイクアウトのご注文</span>
            <span className="text-[#59544f] mx-2">·</span>
            <span className="text-[11px] font-bold">Takeout</span>
          </a>
        </div>
      </div>
    </div>
  );
}
