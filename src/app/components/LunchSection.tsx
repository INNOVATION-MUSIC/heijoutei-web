"use client";
import Image from "next/image";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";

export default function LunchSection() {
  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden" style={{ width: 1440, height: 1000 }}>
      {/* メイン写真 */}
      <div className="absolute overflow-hidden bg-[#2e1c12]" style={{ left: 739, top: 81, width: 700, height: 450 }}>
        <Image src="/images/lunch_main.jpg" alt="ランチ" fill className="object-cover" sizes="700px" />
      </div>
      {/* サブ写真 1 */}
      <div className="absolute overflow-hidden bg-[#241a14]" style={{ left: 739, top: 550, width: 384, height: 276 }}>
        <Image src="/images/lunch_sub1.jpg" alt="" fill className="object-cover" sizes="384px" />
      </div>
      {/* サブ写真 2 */}
      <div className="absolute overflow-hidden bg-[#241a14]" style={{ left: 1143, top: 550, width: 297, height: 276 }}>
        <Image src="/images/lunch_sub2.jpg" alt="" fill className="object-cover" sizes="297px" />
      </div>

      {/* ラベル */}
      <div className="absolute flex items-center justify-center" style={{ left: 93, top: 125, width: 44, height: 85, border: "1px solid rgba(255,255,255,0.3)" }}>
        <p style={{ fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff", writingMode: "vertical-rl" as const }}>ランチ</p>
      </div>

      {/* Lunch タイトル */}
      <p className="absolute" style={{ left: 206, top: 115, fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>Lunch</p>

      {/* 説明文 */}
      <p className="absolute" style={{ left: 206, top: 256, width: 495, fontFamily: mincho, fontSize: 15, fontWeight: 400, letterSpacing: "0.1em", color: "rgba(235,229,219,0.85)", lineHeight: "40px" }}>
        ランチタイムから、気軽に本格焼肉をお楽しみいただけます。<br />
        ご友人同士でのランチはもちろん、お仕事の合間のお食事や<br />
        ご家族でのお集まり、学生グループでのご利用まで、<br />
        幅広いシーンでご好評いただいております。
      </p>

      {/* ランチメニューボタン */}
      <a href="#" className="absolute flex items-center overflow-hidden" style={{ left: 206, top: 615, width: 172, height: 50, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", textDecoration: "none" }}>
        <span className="absolute" style={{ left: 32, top: 11, fontFamily: "sans-serif", fontSize: 16, color: "#fff" }}>·</span>
        <span className="absolute" style={{ left: 45, top: 15, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff" }}>ランチメニュー</span>
      </a>
    </section>
  );
}
