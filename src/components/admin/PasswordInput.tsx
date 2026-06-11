'use client'

import { useState } from 'react'

// パスワード入力欄＋右端の表示/非表示トグル（目アイコン）。
// type 以外の input 属性（value/onChange/required/autoComplete 等）はそのまま透過する。
type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

export default function PasswordInput({ className = '', ...props }: Props) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        className={`w-full rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-4 py-2.5 pr-11 text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none focus:ring-1 focus:ring-[#d9b86b]/40 ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'パスワードを隠す' : 'パスワードを表示'}
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-[#6b6b78] transition-colors hover:text-[#d9b86b]"
      >
        {show ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" x2="22" y1="2" y2="22" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  )
}
