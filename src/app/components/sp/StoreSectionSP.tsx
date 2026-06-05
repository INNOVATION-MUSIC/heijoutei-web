import Image from "next/image";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";
const sans = "'Noto Sans JP', sans-serif";

function MapBadge({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ display: "inline-block", padding: "2px 8px", border: "1px solid rgba(255,255,255,0.28)", fontFamily: sans, fontSize: 9, color: "rgba(235,229,219,0.7)", textDecoration: "none", letterSpacing: "0.1em", flexShrink: 0 }}>
      MAP
    </a>
  );
}

export default function StoreSectionSP() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a]" style={{ width: 390, height: 1899 }}>
      {/* ラベル 店舗 */}
      <div className="absolute overflow-hidden" style={{ left: 22, top: 46, width: 44, height: 65, border: "1px solid rgba(255,255,255,0.3)" }}>
        <p className="absolute" style={{ left: 15, top: 8, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff", writingMode: "vertical-rl" as const }}>店舗</p>
      </div>
      <p className="absolute" style={{ left: 74, top: 36, fontFamily: display, fontSize: 60, fontStyle: "italic", letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>StoreInfo</p>

      {/* イントロテキスト */}
      <p className="absolute" style={{ left: 22, top: 148, width: 346, fontFamily: mincho, fontSize: 12, letterSpacing: "0.1em", color: "rgba(235,229,219,0.65)", lineHeight: "28px" }}>
        各店にてランチからご夕食まで、各種宴会・記念日・ご接待などご特別なお席にも対応していただきます。亀岡・園部・福知山での観光はぜひ焼肉平壌亭へ、焼肉宴会で楽しいひと時をお過ごしください。
      </p>

      {/* ━━━━ 亀岡店 ━━━━ */}
      <div className="absolute overflow-hidden bg-[#2e1c12]" style={{ left: 0, top: 266, width: 390, height: 220 }}>
        <Image src="/images/store_kameoka.jpg" alt="平壌亭 亀岡店" fill className="object-cover" sizes="390px" />
      </div>
      <div className="absolute bg-[#131210]" style={{ left: 0, top: 486, width: 390, padding: "24px 22px 28px" }}>
        <p style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.5em", color: "rgba(235,229,219,0.3)", marginBottom: 8, textTransform: "uppercase" as const }}>Heijohtei / Kameoka</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
          <p style={{ fontFamily: mincho, fontSize: 18, color: "#ebe5db" }}>平壌亭　亀岡店</p>
          <MapBadge href="https://maps.google.com/?q=京都府亀岡市篠町浄法寺中村３５-５" />
        </div>
        <a href="tel:0771-23-8410" style={{ display: "block", fontFamily: mincho, fontSize: 20, color: "#d9b86b", textDecoration: "none", marginBottom: 10, letterSpacing: "0.05em" }}>
          0771-23-8410
        </a>
        <p style={{ fontFamily: mincho, fontSize: 11, color: "rgba(235,229,219,0.6)", lineHeight: "22px", marginBottom: 6 }}>
          京都府亀岡市篠町浄法寺中村３５-５<br />
          30台駐車場完備！山陰本線亀岡駅よりマイクロバス送迎あり
        </p>
        <p style={{ fontFamily: mincho, fontSize: 11, color: "rgba(235,229,219,0.6)", lineHeight: "22px", marginBottom: 6 }}>
          月〜日　11:30〜14:30（料理L.O. 14:00）<br />
          　　　　16:00〜22:30（料理L.O. 22:00）
        </p>
        <p style={{ fontFamily: mincho, fontSize: 11, color: "rgba(235,229,219,0.45)" }}>定休日　火曜</p>
      </div>

      {/* ━━━━ 園部店 ━━━━ */}
      <div className="absolute overflow-hidden bg-[#2e1c12]" style={{ left: 0, top: 784, width: 390, height: 160 }}>
        <Image src="/images/store_sonobe.jpg" alt="平壌亭 園部店" fill className="object-cover" sizes="390px" />
      </div>
      <div className="absolute bg-[#131210]" style={{ left: 0, top: 944, width: 390, padding: "20px 22px 24px" }}>
        <p style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.5em", color: "rgba(235,229,219,0.3)", marginBottom: 6, textTransform: "uppercase" as const }}>Heijohtei / Sonobe</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <p style={{ fontFamily: mincho, fontSize: 16, color: "#ebe5db" }}>平壌亭　園部店</p>
          <MapBadge href="https://maps.google.com/?q=京都府南丹市園部町上木崎町坪ノ内26-5" />
        </div>
        <a href="tel:0771-68-1760" style={{ display: "block", fontFamily: mincho, fontSize: 18, color: "#d9b86b", textDecoration: "none", marginBottom: 8 }}>0771-68-1760</a>
        <p style={{ fontFamily: mincho, fontSize: 11, color: "rgba(235,229,219,0.55)", lineHeight: "22px" }}>
          京都府南丹市園部町上木崎町坪ノ内26-5　定休日 火曜
        </p>
      </div>

      {/* ━━━━ 福知山店 ━━━━ */}
      <div className="absolute overflow-hidden bg-[#2e1c12]" style={{ left: 0, top: 1124, width: 390, height: 160 }}>
        <Image src="/images/store_fukuchiyama.jpg" alt="平壌亭 福知山店" fill className="object-cover" sizes="390px" />
      </div>
      <div className="absolute bg-[#131210]" style={{ left: 0, top: 1284, width: 390, padding: "20px 22px 24px" }}>
        <p style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.5em", color: "rgba(235,229,219,0.3)", marginBottom: 6, textTransform: "uppercase" as const }}>Heijohtei / Fukuchiyama</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <p style={{ fontFamily: mincho, fontSize: 16, color: "#ebe5db" }}>平壌亭　福知山店</p>
          <MapBadge href="https://maps.google.com/?q=京都府福知山市字堀2303の２" />
        </div>
        <a href="tel:0773-24-2322" style={{ display: "block", fontFamily: mincho, fontSize: 18, color: "#d9b86b", textDecoration: "none", marginBottom: 8 }}>0773-24-2322</a>
        <p style={{ fontFamily: mincho, fontSize: 11, color: "rgba(235,229,219,0.55)", lineHeight: "22px" }}>
          京都府福知山市字堀2303の２　定休日 火曜
        </p>
      </div>

      {/* ━━━━ 焼肉ゆらの ━━━━ */}
      <div className="absolute overflow-hidden bg-[#2e1c12]" style={{ left: 0, top: 1464, width: 390, height: 160 }}>
        <Image src="/images/store_yurano.jpg" alt="焼肉ゆらの" fill className="object-cover" sizes="390px" />
      </div>
      <div className="absolute bg-[#131210]" style={{ left: 0, top: 1624, width: 390, padding: "20px 22px 24px" }}>
        <p style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.5em", color: "rgba(235,229,219,0.3)", marginBottom: 6, textTransform: "uppercase" as const }}>Yakiniku / Yurano</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <p style={{ fontFamily: mincho, fontSize: 16, color: "#ebe5db" }}>焼肉ゆらの</p>
          <MapBadge href="https://maps.google.com/?q=京都府福知山堀今岡６番地ゆらのガーデン内" />
        </div>
        <a href="tel:0773-45-8429" style={{ display: "block", fontFamily: mincho, fontSize: 18, color: "#d9b86b", textDecoration: "none", marginBottom: 8 }}>0773-45-8429</a>
        <p style={{ fontFamily: mincho, fontSize: 11, color: "rgba(235,229,219,0.55)", lineHeight: "22px" }}>
          京都府福知山堀今岡６番地ゆらのガーデン内　定休日 火曜
        </p>
      </div>

      {/* ━━━━ ヘイジョウテイ（Coming Soon） ━━━━ */}
      <div className="absolute bg-[#0f0e0c] flex items-center justify-center" style={{ left: 0, top: 1744, width: 390, height: 80 }}>
        <p style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.5em", color: "rgba(235,229,219,0.25)", textTransform: "uppercase" as const, marginRight: 18 }}>Heijohtei</p>
        <p style={{ fontFamily: mincho, fontSize: 15, color: "rgba(235,229,219,0.45)", marginRight: 18 }}>ヘイジョウテイ</p>
        <p style={{ fontFamily: display, fontSize: 13, fontStyle: "italic", color: "rgba(217,184,107,0.45)" }}>Coming Soon</p>
      </div>

      {/* 店舗一覧ボタン */}
      <a href="#" className="absolute flex items-center overflow-hidden" style={{ left: 132, top: 1846, width: 126, height: 50, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", textDecoration: "none" }}>
        <span className="absolute" style={{ left: 18, top: 11, fontFamily: "sans-serif", fontSize: 16, color: "#ffffff" }}>·</span>
        <span className="absolute" style={{ left: 30, top: 15, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#ffffff" }}>店舗一覧</span>
      </a>
    </section>
  );
}
