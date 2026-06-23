"use client";

import Image from "next/image";
import PageHeader from "./PageHeader";
import OutlineButton from "./OutlineButton";
import { recruitHero, type RecruitJob, type RecruitTag } from "@/app/lib/recruitData";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

/** 矩形タグ（一覧カードと共通デザイン・Figma 2021:1501） */
function TagPill({ tag }: { tag: RecruitTag }) {
  return (
    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 20, paddingLeft: 9, paddingRight: 9, background: tag.color, fontFamily: mincho, fontSize: 10, fontWeight: 500, letterSpacing: "1px", color: "#fff", whiteSpace: "nowrap", flexShrink: 0 }}>
      {tag.label}
    </span>
  );
}

/**
 * /recruit/[id] 採用情報詳細ページのメインコンテンツ（PageHeader 含む）。
 * Figma 設計幅 1440・「採用情報2」(2021:1354) 準拠。
 * 上: 左にタイトル＋日付＋タグ / 右に 500×500 ヒーロー画像。
 * 続けて導入文 → 募集要項テーブル → 応募方法カードを縦に並べる。
 * セクション全高（height）は本文量から算出した値を RecruitDetailClient から受け取る。
 */
export default function RecruitDetailSection({
  job,
  onOpenModal,
  height,
}: {
  job: RecruitJob;
  onOpenModal: () => void;
  height: number;
}) {
  const last = job.detail.length - 1;
  const tel = job.applyTel.replace(/[^0-9]/g, "");

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height, background: "#0a0a0a", overflow: "hidden" }}>

      {/* 共通ヘッダー */}
      <PageHeader onOpenModal={onOpenModal} />

      {/* 見出し帯: 左=タイトル+日付+タグ / 右=500×500 ヒーロー（Hero 上端 y=287） */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingLeft: 157, paddingRight: 163, paddingTop: 134 }}>
        {/* 左ブロック（タイトルはヒーローより 149px 下から始まる） */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 600 }}>
          <div style={{ height: 149 }} />
          <h1 style={{ fontFamily: mincho, fontSize: 32, fontWeight: 400, letterSpacing: "1.5px", color: "#fff", lineHeight: "48px", margin: 0 }}>{job.title}</h1>
          <div style={{ height: 22 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: sans, fontSize: 20, fontWeight: 300, letterSpacing: "1.5px", color: "rgba(217,184,107,0.6)", whiteSpace: "nowrap" }}>{job.date}</span>
            {job.tags.map((tag, i) => (
              <TagPill key={i} tag={tag} />
            ))}
          </div>
        </div>

        {/* 右: ヒーロー画像（500×500） */}
        <div style={{ position: "relative", width: 500, height: 500, overflow: "hidden", flexShrink: 0, background: "#472914" }}>
          <Image src={recruitHero(job)} alt={job.title} fill className="object-cover" sizes="500px" preload />
        </div>
      </div>

      {/* 導入文 */}
      <p style={{ paddingLeft: 181, paddingTop: 60, width: 1120, fontFamily: mincho, fontSize: 16, fontWeight: 400, letterSpacing: "1.5px", lineHeight: "34px", color: "#fff", whiteSpace: "pre-wrap", margin: 0 }}>
        {job.lead}
      </p>

      {/* 募集要項テーブル（内容領域 x244 / 幅946） */}
      <div style={{ paddingLeft: 244, paddingRight: 250, paddingTop: 62 }}>
        <div style={{ paddingTop: 49 }}>
          {job.detail.map((row, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "flex-start", paddingTop: 22, paddingBottom: 22, borderBottom: i < last ? "1px solid rgba(255,255,255,0.3)" : "none" }}
            >
              <span style={{ width: 177, flexShrink: 0, fontFamily: mincho, fontSize: 14, fontWeight: 400, letterSpacing: "1.5px", color: "#fff", lineHeight: "26px" }}>{row.label}</span>
              <p style={{ flex: 1, fontFamily: mincho, fontSize: 14, fontWeight: 400, letterSpacing: "1.5px", color: "#fff", lineHeight: "26px", whiteSpace: "pre-wrap", margin: 0 }}>{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 応募方法カード */}
      <div style={{ paddingLeft: 160, paddingRight: 160, paddingTop: 53 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 1120, height: 482, background: "#171717", borderTop: "2px solid rgba(217,184,107,0.8)" }}>
          <div style={{ height: 41 }} />
          <span style={{ fontFamily: mincho, fontSize: 24, fontWeight: 600, letterSpacing: "2px", color: "#fff" }}>応募方法</span>
          <div style={{ height: 37 }} />
          <p style={{ fontFamily: mincho, fontSize: 16, fontWeight: 400, letterSpacing: "2px", color: "#fff", lineHeight: "30px", textAlign: "center", margin: 0 }}>
            「応募する」ボタンをご利用下さい。
            <br />
            こちらより折り返しご連絡をさせて頂きます。
            <br />
            お電話でのご応募もお待ちしております。
          </p>
          <div style={{ height: 91 }} />

          {/* 2 カラム（お電話 / WEB） */}
          <div style={{ display: "flex", justifyContent: "center", gap: 140 }}>
            {/* お電話で応募 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontFamily: mincho, fontSize: 22, fontWeight: 800, letterSpacing: "2px", color: "#fff" }}>お電話で応募</span>
              <div style={{ height: 28 }} />
              <a href={`tel:${tel}`} style={{ fontFamily: mincho, fontSize: 26, fontWeight: 800, letterSpacing: "1px", color: "#d9b86b", textDecoration: "none", whiteSpace: "nowrap" }}>{job.applyTel}</a>
              <div style={{ height: 8 }} />
              <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 300, letterSpacing: "2px", color: "#fff", whiteSpace: "nowrap" }}>受付時間 10:00～21:30　採用係まで</span>
            </div>

            {/* WEBで応募 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontFamily: mincho, fontSize: 22, fontWeight: 800, letterSpacing: "2px", color: "#ebe5db" }}>WEBで応募</span>
              <div style={{ height: 28 }} />
              <OutlineButton jp="この求人に応募する" href="/contact" width={209} align="center" />
            </div>
          </div>
        </div>
      </div>

      {/* 残余スペーサー（全高まで） */}
      <div style={{ flex: 1 }} />
    </div>
  );
}
