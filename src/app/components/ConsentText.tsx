"use client";

import Link from "next/link";

// 同意チェックの文言「利用規約およびプライバシーポリシーに同意する」。各語を新しいタブで開くリンクにする
// （入力途中のフォームを失わないため）。label 内のリンククリックではチェックは切り替わらない。
// 上下 12px の透明 padding でタップ領域を広げ、相殺 margin で行の高さは変えない。
function DocLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "inline-block", padding: "12px 0", margin: "-12px 0", color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}
    >
      {children}
    </Link>
  );
}

export default function ConsentText() {
  return (
    <>
      <DocLink href="/terms">利用規約</DocLink>および<DocLink href="/privacy">プライバシーポリシー</DocLink>に同意する
    </>
  );
}
