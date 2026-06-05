import Image from "next/image";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";

export default function LunchSectionSP() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a]" style={{ width: 390, height: 1204 }}>
      {/* ラベル */}
      <div className="absolute overflow-hidden" style={{ left: 22, top: 56, width: 44, height: 65, border: "1px solid rgba(255,255,255,0.3)" }}>
        <p className="absolute" style={{ left: 15, top: 14, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff", writingMode: "vertical-rl" as const }}>ランチ</p>
      </div>
      {/* Lunch タイトル */}
      <p className="absolute" style={{ left: 74, top: 46, fontFamily: display, fontSize: 60, fontStyle: "italic", letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>Lunch</p>

      {/* メイン写真 */}
      <div className="absolute overflow-hidden bg-[#2e1c12]" style={{ left: 0, top: 140, width: 390, height: 260 }}>
        <Image src="/images/lunch_main.jpg" alt="ランチ" fill className="object-cover" sizes="390px" />
      </div>

      {/* 説明文 */}
      <p className="absolute" style={{ left: 22, top: 422, width: 346, fontFamily: mincho, fontSize: 13, fontWeight: 400, letterSpacing: "0.1em", color: "rgba(235,229,219,0.85)", lineHeight: "36px" }}>
        ランチタイムから、気軽に本格焼肉をお楽しみいただけます。<br />
        ご友人同士でのランチはもちろん、お仕事の合間のお食事や<br />
        ご家族でのお集まり、学生グループでのご利用まで、<br />
        幅広いシーンでご好評いただいております。
      </p>

      {/* ランチメニューボタン */}
      <a href="#" className="absolute flex items-center overflow-hidden" style={{ left: 109, top: 582, width: 172, height: 50, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", textDecoration: "none" }}>
        <span className="absolute" style={{ left: 22, top: 11, fontFamily: "sans-serif", fontSize: 16, color: "#fff" }}>·</span>
        <span className="absolute" style={{ left: 35, top: 15, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff" }}>ランチメニュー</span>
      </a>

      {/* サブ写真 1 */}
      <div className="absolute overflow-hidden bg-[#241a14]" style={{ left: 0, top: 676, width: 390, height: 262 }}>
        <Image src="/images/lunch_sub1.jpg" alt="" fill className="object-cover" sizes="390px" />
      </div>

      {/* サブ写真 2 */}
      <div className="absolute overflow-hidden bg-[#241a14]" style={{ left: 0, top: 958, width: 390, height: 246 }}>
        <Image src="/images/lunch_sub2.jpg" alt="" fill className="object-cover" sizes="390px" />
      </div>
    </section>
  );
}
