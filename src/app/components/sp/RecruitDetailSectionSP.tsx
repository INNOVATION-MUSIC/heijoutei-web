"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import OutlineButton from "../OutlineButton";
import { recruitHero, type RecruitJob, type RecruitTag } from "@/app/lib/recruitData";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

/** 矩形タグ（一覧カードと共通デザイン） */
function TagPill({ tag }: { tag: RecruitTag }) {
  return (
    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 20, paddingLeft: 9, paddingRight: 9, background: tag.color, fontFamily: mincho, fontSize: 10, fontWeight: 500, letterSpacing: "1px", color: "#fff", whiteSpace: "nowrap", flexShrink: 0 }}>
      {tag.label}
    </span>
  );
}

type Props = {
  job: RecruitJob;
  height: number;
  /** ヘッダースペーサーを除いたコンテンツ実測高さ（design 390 幅でのpx）を親へ通知 */
  onMeasured?: (h: number) => void;
};

/**
 * /recruit/[id] 採用情報詳細ページ SP 版メインコンテンツ。Figma 設計幅 390（node 2149:489）。
 * ヘッダーは SpStickyHeader が固定表示するため先頭に 153px spacer のみ置く。
 * 縦並び: ヒーロー(350×300) → タイトル → 日付+タグ → 導入文 → 募集要項テーブル → 応募方法カード。
 * 導入文/テーブル値の折返しで高さ可変なため ResizeObserver で実測し全高（height）算出に使う。
 * 縦位置は paddingTop（gap）で制御し marginTop / 配置 absolute は不使用。
 */
export default function RecruitDetailSectionSP({ job, height, onMeasured }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !onMeasured) return;
    const report = () => onMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onMeasured, job]);

  const last = job.detail.length - 1;
  const tel = job.applyTel.replace(/[^0-9]/g, "");

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 390, height, background: "#0a0a0a", overflow: "hidden" }}>

      {/* ヘッダー高さ分のスペーサー（SpStickyHeader が上に固定表示） */}
      <div style={{ height: 153, flexShrink: 0 }} />

      <div ref={contentRef} style={{ display: "flex", flexDirection: "column" }}>
        {/* ヒーロー画像（350×300・左右20pxインセット） */}
        <div style={{ paddingLeft: 20 }}>
          <div style={{ position: "relative", width: 350, height: 300, overflow: "hidden", background: "#472914" }}>
            <Image src={recruitHero(job)} alt={job.title} fill className="object-cover" sizes="350px" preload />
          </div>
        </div>

        {/* タイトル */}
        <h1 style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 28, fontFamily: mincho, fontSize: 20, fontWeight: 400, letterSpacing: "1.5px", color: "#fff", lineHeight: "32px", margin: 0 }}>
          {job.title}
        </h1>

        {/* 日付 + タグ（同一行） */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", paddingLeft: 20, paddingRight: 20, paddingTop: 18 }}>
          <span style={{ fontFamily: sans, fontSize: 16, fontWeight: 300, letterSpacing: "1.5px", color: "rgba(217,184,107,0.6)", whiteSpace: "nowrap" }}>{job.date}</span>
          {job.tags.map((tag, i) => (
            <TagPill key={i} tag={tag} />
          ))}
        </div>

        {/* 導入文 */}
        <p style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 30, fontFamily: mincho, fontSize: 14, fontWeight: 400, letterSpacing: "1px", lineHeight: "28px", color: "#fff", whiteSpace: "pre-wrap", margin: 0 }}>
          {job.lead}
        </p>

        {/* 募集要項テーブル（全幅・ラベル左 + 値右・行下に区切り線） */}
        <div style={{ paddingTop: 40 }}>
          {job.detail.map((row, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingLeft: 17, paddingRight: 20, paddingTop: 22, paddingBottom: 22, borderTop: "1px solid rgba(255,255,255,0.3)", borderBottom: i === last ? "1px solid rgba(255,255,255,0.3)" : "none" }}
            >
              <span style={{ width: 75, flexShrink: 0, fontFamily: mincho, fontSize: 14, fontWeight: 400, letterSpacing: "1px", color: "#fff", lineHeight: "24px" }}>{row.label}</span>
              <p style={{ flex: 1, fontFamily: mincho, fontSize: 14, fontWeight: 400, letterSpacing: "1px", color: "#fff", lineHeight: "24px", whiteSpace: "pre-wrap", margin: 0 }}>{row.value}</p>
            </div>
          ))}
        </div>

        {/* 応募方法カード */}
        <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 50, paddingBottom: 60 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 350, background: "#171717", borderTop: "2px solid rgba(217,184,107,0.8)", paddingTop: 50, paddingBottom: 50 }}>
            <span style={{ fontFamily: mincho, fontSize: 24, fontWeight: 600, letterSpacing: "2px", color: "#fff" }}>応募方法</span>
            <div style={{ height: 30 }} />
            <p style={{ fontFamily: mincho, fontSize: 14, fontWeight: 400, letterSpacing: "1.5px", color: "#fff", lineHeight: "26px", textAlign: "center", margin: 0, paddingLeft: 16, paddingRight: 16 }}>
              「応募する」ボタンをご利用下さい。
              <br />
              こちらより折り返しご連絡をさせて頂きます。
              <br />
              お電話でのご応募もお待ちしております。
            </p>
            <div style={{ height: 50 }} />

            {/* お電話で応募 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontFamily: mincho, fontSize: 18, fontWeight: 800, letterSpacing: "2px", color: "#fff" }}>お電話で応募</span>
              <div style={{ height: 18 }} />
              <a href={`tel:${tel}`} style={{ fontFamily: mincho, fontSize: 26, fontWeight: 800, letterSpacing: "1px", color: "#d9b86b", textDecoration: "none", whiteSpace: "nowrap" }}>{job.applyTel}</a>
              <div style={{ height: 10 }} />
              <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 300, letterSpacing: "1.5px", color: "#fff", whiteSpace: "nowrap" }}>受付時間 10:00～21:30　採用係まで</span>
            </div>

            <div style={{ height: 44 }} />

            {/* WEBで応募 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontFamily: mincho, fontSize: 18, fontWeight: 800, letterSpacing: "2px", color: "#ebe5db" }}>WEBで応募</span>
              <div style={{ height: 18 }} />
              <OutlineButton jp="この求人に応募する" href="/contact" width={209} align="center" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
