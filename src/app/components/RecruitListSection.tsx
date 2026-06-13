"use client";

import Image from "next/image";
import PageHeader from "./PageHeader";
import { type RecruitJob } from "@/app/lib/recruitData";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";
const display = "'Cormorant Garamond', serif";

const CARD_W = 1340;
const IMG_W = 340;
const IMG_H = 240;

/** 求人カード 1 枚（写真 340×240 左 ＋ 内容右）。クリックで詳細 /recruit/[id] へ。 */
function RecruitCard({ job }: { job: RecruitJob }) {
  return (
    <a
      href={`/recruit/${job.id}`}
      style={{ display: "flex", width: CARD_W, height: IMG_H, background: "#171717", textDecoration: "none", overflow: "hidden" }}
    >
      {/* 写真 */}
      <div style={{ position: "relative", width: IMG_W, height: IMG_H, flexShrink: 0, background: "#1c110a" }}>
        <Image src={job.img} alt={job.title} fill className="object-cover" sizes="340px" />
      </div>

      {/* 内容（content x=390 → 画像右端340 + gap50） */}
      <div style={{ display: "flex", flexDirection: "column", paddingLeft: 50, paddingTop: 29, paddingRight: 40 }}>
        <span style={{ fontFamily: sans, fontSize: 10, fontWeight: 300, letterSpacing: "1px", color: "rgba(217,184,107,0.6)" }}>{job.date}</span>
        <div style={{ height: 10 }} />
        <div style={{ width: 32, height: 1, background: "rgba(217,184,107,0.45)" }} />
        <div style={{ height: 11 }} />
        <p style={{ fontFamily: mincho, fontSize: 22, fontWeight: 800, letterSpacing: "2px", color: "#fff", lineHeight: 1.3, margin: 0 }}>{job.title}</p>
        <div style={{ height: 14 }} />
        <div style={{ display: "flex", gap: 10 }}>
          {job.tags.map((tag, i) => (
            <span
              key={i}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 20, paddingLeft: 9, paddingRight: 9, background: tag.color, fontFamily: mincho, fontSize: 10, fontWeight: 500, letterSpacing: "1px", color: "#fff", whiteSpace: "nowrap" }}
            >
              {tag.label}
            </span>
          ))}
        </div>
        <div style={{ height: 14 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {job.summary.map((line, i) => (
            <p key={i} style={{ fontFamily: sans, fontSize: 12, fontWeight: 300, letterSpacing: "0.5px", color: "#fff", lineHeight: "24px", margin: 0 }}>{line}</p>
          ))}
        </div>
      </div>
    </a>
  );
}

/** 求人が 0 件の店舗タブに表示する空状態（サイトのデザインテイストに合わせたパネル）。 */
function EmptyState({ store, height }: { store: string; height: number }) {
  return (
    <div style={{ paddingLeft: 50, paddingRight: 50, paddingTop: 80 }}>
      <div style={{ width: CARD_W, height, background: "#171717", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, border: "1px solid rgba(234,229,219,0.08)" }}>
        {/* ゴールドの細線 */}
        <div style={{ width: 48, height: 1, background: "rgba(217,184,107,0.6)" }} />
        <p style={{ fontFamily: mincho, fontSize: 22, fontWeight: 400, letterSpacing: "2px", color: "#ebe5db", margin: 0 }}>
          現在、{store}の募集はございません
        </p>
        <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 300, letterSpacing: "1px", lineHeight: "26px", color: "#99948c", textAlign: "center", margin: 0 }}>
          採用情報は随時更新しております。
          <br />
          ぜひ他の店舗の募集もあわせてご覧ください。
        </p>
      </div>
    </div>
  );
}

/**
 * /recruit 採用情報一覧ページのメインコンテンツ（PageHeader 含む）。
 * Figma 設計幅 1440・「採用情報1」(2021:1059) 準拠。
 * 見出しは /news と同構成（ラベル＋Recruitment＋ヒーロー 820×320）。
 * その下に店舗タブ（クリックで絞り込み）→ 求人カード。0件の店舗は空状態を表示。
 */
export default function RecruitListSection({
  onOpenModal,
  height,
  jobs,
  storeTabs,
  activeTab,
  onSelectTab,
  emptyHeight,
}: {
  onOpenModal: () => void;
  height: number;
  jobs: RecruitJob[];
  storeTabs: string[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  emptyHeight: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height, background: "#0a0a0a", overflow: "hidden" }}>

      {/* 共通ヘッダー */}
      <PageHeader onOpenModal={onOpenModal} />

      {/* Recruitment 見出し + ヒーロー画像（Hero 上端 y=297） */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingLeft: 57, paddingRight: 40, paddingTop: 144 }}>
        <div style={{ display: "flex", gap: 31, alignItems: "flex-start", paddingTop: 48 }}>
          {/* 縦書きラベル「採用情報」 */}
          <div style={{ boxSizing: "border-box", width: 44, height: 94, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
            <span style={{ margin: 0, writingMode: "vertical-rl" as const, fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", whiteSpace: "nowrap", transform: "translateY(4px)" }}>採用情報</span>
          </div>
          {/* Recruitment タイトル */}
          <p style={{ fontFamily: display, fontSize: 75, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0 }}>Recruitment</p>
        </div>

        {/* 右: ヒーロー画像（820×320・薄い黒オーバーレイ） */}
        <div style={{ position: "relative", width: 820, height: 320, overflow: "hidden", flexShrink: 0, background: "#472914" }}>
          <Image src="/images/recruit_hero_hd.webp" alt="焼肉平壌亭で働くスタッフ" fill className="object-cover" sizes="820px" priority />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
        </div>
      </div>

      {/* 店舗タブ（クリックで絞り込み・y=795） */}
      <div style={{ paddingLeft: 50, paddingRight: 50, paddingTop: 178 }}>
        <div style={{ display: "flex" }}>
          {storeTabs.map((tab) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => onSelectTab(tab)}
                style={{ flex: 1, minWidth: 0, height: 80, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", cursor: "pointer", padding: 0, borderLeft: "none", borderRight: "none", borderTop: "none", borderBottom: active ? "2px solid rgba(217,184,107,0.8)" : "2px solid rgba(234,229,219,0.15)", transition: "border-color 0.25s ease, color 0.25s ease" }}
              >
                <span style={{ fontFamily: mincho, fontSize: 20, fontWeight: active ? 600 : 400, letterSpacing: "2px", color: active ? "#ebe5db" : "rgba(235,229,219,0.45)", whiteSpace: "nowrap" }}>{tab}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 求人カード（y=957・gap40）／0件は空状態 */}
      {jobs.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 40, paddingLeft: 50, paddingRight: 50, paddingTop: 80 }}>
          {jobs.map((job) => (
            <RecruitCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState store={activeTab} height={emptyHeight} />
      )}

      {/* 残余スペーサー（全高まで） */}
      <div style={{ flex: 1 }} />
    </div>
  );
}
