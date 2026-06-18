"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import OutlineButton from "../OutlineButton";
import { type RecruitJob } from "@/app/lib/recruitData";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";
const display = "'Cormorant Garamond', serif";

const CARD_W = 350;

/** 求人カード（SP・350幅）。写真350×200 上 → 日付/金線/タイトル/タグ/説明 → 詳細ボタンを縦並び。 */
function RecruitCardSP({ job }: { job: RecruitJob }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: CARD_W, background: "#171717", overflow: "hidden" }}>
      {/* 写真（350×200） */}
      <div style={{ position: "relative", width: CARD_W, height: 200, flexShrink: 0, background: "#1c110a" }}>
        <Image src={job.img} alt={job.title} fill className="object-cover" sizes="350px" />
      </div>

      {/* 内容 */}
      <div style={{ display: "flex", flexDirection: "column", paddingLeft: 20, paddingRight: 20, paddingTop: 20, paddingBottom: 28 }}>
        <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 300, letterSpacing: "1px", color: "rgba(217,184,107,0.6)" }}>{job.date}</span>
        <div style={{ height: 10 }} />
        <div style={{ width: 32, height: 1, background: "rgba(217,184,107,0.45)" }} />
        <div style={{ height: 11 }} />
        <p style={{ fontFamily: mincho, fontSize: 18, fontWeight: 800, letterSpacing: "1.5px", color: "#fff", lineHeight: "26px", margin: 0 }}>{job.title}</p>
        <div style={{ height: 14 }} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {job.tags.map((tag, i) => (
            <span
              key={i}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 20, paddingLeft: 9, paddingRight: 9, background: tag.color, fontFamily: mincho, fontSize: 10, fontWeight: 500, letterSpacing: "1px", color: "#fff", whiteSpace: "nowrap" }}
            >
              {tag.label}
            </span>
          ))}
        </div>
        <div style={{ height: 18 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {job.summary.map((line, i) => (
            <p key={i} style={{ fontFamily: sans, fontSize: 12, fontWeight: 300, letterSpacing: "0.5px", color: "#fff", lineHeight: "20px", margin: 0 }}>{line}</p>
          ))}
        </div>

        {/* 詳細ボタン（全幅・/recruit/[id] へ遷移） */}
        <div style={{ paddingTop: 22 }}>
          <OutlineButton jp="詳細を見る" href={`/recruit/${job.id}`} width={CARD_W - 40} height={48} align="center" />
        </div>
      </div>
    </div>
  );
}

/** 0 件の店舗タブに表示する空状態（PC RecruitListSection と同テイスト・SP 幅）。 */
function EmptyStateSP({ store }: { store: string }) {
  return (
    <div style={{ width: CARD_W, paddingTop: 64, paddingBottom: 64, background: "#171717", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, border: "1px solid rgba(234,229,219,0.08)" }}>
      <div style={{ width: 48, height: 1, background: "rgba(217,184,107,0.6)" }} />
      <p style={{ fontFamily: mincho, fontSize: 18, fontWeight: 400, letterSpacing: "2px", color: "#ebe5db", textAlign: "center", margin: 0, paddingLeft: 20, paddingRight: 20 }}>
        現在、{store}の<br />募集はございません
      </p>
      <p style={{ fontFamily: sans, fontSize: 12, fontWeight: 300, letterSpacing: "1px", lineHeight: "22px", color: "#99948c", textAlign: "center", margin: 0 }}>
        採用情報は随時更新しております。
        <br />
        ぜひ他の店舗の募集もご覧ください。
      </p>
    </div>
  );
}

type Props = {
  jobs: RecruitJob[];
  storeTabs: string[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  height: number;
  /** ヘッダースペーサーを除いたコンテンツ実測高さ（design 390 幅でのpx）を親へ通知 */
  onMeasured?: (h: number) => void;
};

/**
 * /recruit 採用情報一覧ページ SP 版メインコンテンツ。Figma 設計幅 390（node 2149:204）。
 * ヘッダーは SpStickyHeader が固定表示するため先頭に 153px spacer のみ置く。
 * 縦並び: ヒーロー(351×130) → Recruitment 見出し → 店舗タブ（横スクロール・金下線）→ 求人カード（1列）。
 * 求人量・タブ切替でコンテンツ高さが可変なため ResizeObserver で実測し全高（height）算出に使う。
 * 縦位置は paddingTop（gap）で制御し marginTop / 配置 absolute は不使用。
 */
export default function RecruitListSectionSP({ jobs, storeTabs, activeTab, onSelectTab, height, onMeasured }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !onMeasured) return;
    const report = () => onMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onMeasured, jobs, activeTab]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 390, height, background: "#0a0a0a", overflow: "hidden" }}>

      {/* ヘッダー高さ分のスペーサー（SpStickyHeader が上に固定表示） */}
      <div style={{ height: 153, flexShrink: 0 }} />

      <div ref={contentRef} style={{ display: "flex", flexDirection: "column" }}>
        {/* ヒーロー画像ストリップ（351×130・左右21pxインセット・黒オーバーレイ0.3） */}
        <div style={{ paddingLeft: 19 }}>
          <div style={{ position: "relative", width: 351, height: 130, overflow: "hidden", background: "#472914" }}>
            <Image src="/images/recruit_hero_hd.webp" alt="焼肉平壌亭で働くスタッフ" fill className="object-cover" sizes="351px" priority />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
          </div>
        </div>

        {/* Recruitment 見出し（縦書きラベル「採用情報」+ Recruitment・/news・/store SP と統一） */}
        <div style={{ display: "flex", alignItems: "flex-start", paddingLeft: 19, paddingTop: 73, gap: 28 }}>
          <div style={{ boxSizing: "border-box", width: 44, height: 94, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <span style={{ margin: 0, writingMode: "vertical-rl" as const, whiteSpace: "nowrap", fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", transform: "translateY(4px)" }}>
              採用情報
            </span>
          </div>
          <p style={{ paddingTop: 40, fontFamily: display, fontSize: 48, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0 }}>Recruitment</p>
        </div>

        {/* 店舗タブ（横スクロール・アクティブは金下線） */}
        <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 56, overflowX: "auto" }}>
          <div style={{ display: "inline-flex", gap: 30, borderBottom: "1px solid rgba(234,229,219,0.15)", minWidth: 350 }}>
            {storeTabs.map((tab) => {
              const active = tab === activeTab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onSelectTab(tab)}
                  style={{ background: "transparent", border: "none", borderBottom: active ? "2px solid rgba(217,184,107,0.8)" : "2px solid transparent", marginBottom: -1, padding: 0, paddingBottom: 14, cursor: "pointer", fontFamily: mincho, fontSize: 16, fontWeight: active ? 600 : 400, letterSpacing: "0.06em", color: active ? "#ebe5db" : "#99948c", whiteSpace: "nowrap", transition: "color 0.3s ease" }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* 求人カード（1列・gap40）／0件は空状態 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40, paddingLeft: 20, paddingRight: 20, paddingTop: 50, paddingBottom: 120 }}>
          {jobs.length > 0 ? (
            jobs.map((job) => <RecruitCardSP key={job.id} job={job} />)
          ) : (
            <EmptyStateSP store={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
}
