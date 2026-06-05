import Image from "next/image";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";

export default function OnlineSectionSP() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a]" style={{ width: 390, height: 973 }}>
      {/* 下半分 写真 */}
      <div className="absolute overflow-hidden bg-[#2e1c12]" style={{ left: 0, top: 410, width: 390, height: 563 }}>
        <Image src="/images/online_main.jpg" alt="オンラインショップ" fill className="object-cover" sizes="390px" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #0a0a0a 0%, rgba(10,10,10,0.1) 25%, transparent 55%, rgba(10,10,10,0.85) 90%)" }} />
      </div>

      {/* ラベル 通販 */}
      <div className="absolute overflow-hidden" style={{ left: 22, top: 62, width: 44, height: 65, border: "1px solid rgba(255,255,255,0.3)" }}>
        <p className="absolute" style={{ left: 15, top: 8, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff", writingMode: "vertical-rl" as const }}>通販</p>
      </div>

      {/* OnlineShop タイトル */}
      <p className="absolute" style={{ left: 72, top: 52, fontFamily: display, fontSize: 60, fontStyle: "italic", letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>OnlineShop</p>

      {/* 説明文 */}
      <p className="absolute" style={{ left: 22, top: 178, width: 346, fontFamily: mincho, fontSize: 14, fontWeight: 400, letterSpacing: "0.1em", color: "rgba(235,229,219,0.85)", lineHeight: "38px" }}>
        焼肉専門店の本格的な味わいを、そのままご家庭へ。<br />
        お中元やお歳暮はもちろん、誕生日や記念日などの<br />
        贈り物、感謝を伝えるお返しやご自宅での<br />
        特別な食卓におすすめです。
      </p>

      {/* ボタン */}
      <a href="#" className="absolute flex items-center overflow-hidden" style={{ left: 93, top: 804, width: 204, height: 50, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", textDecoration: "none" }}>
        <span className="absolute" style={{ left: 22, top: 11, fontFamily: "sans-serif", fontSize: 16, color: "#ffffff" }}>·</span>
        <span className="absolute" style={{ left: 35, top: 15, fontFamily: mincho, fontSize: 12, fontWeight: 400, letterSpacing: "0.083em", color: "#ffffff" }}>オンラインショップ</span>
      </a>
    </section>
  );
}
