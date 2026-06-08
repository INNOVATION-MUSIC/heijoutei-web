"use client";
import Image from "next/image";
import OutlineButton from "./OutlineButton";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";

export default function OnlineSection() {
  return (
    <section className="relative overflow-hidden" style={{ width: 1440, height: 700, background: "#0d0a0a" }}>

      {/* 右側 写真 */}
      <div className="absolute overflow-hidden" style={{ left: 740, top: 0, width: 700, height: 750, background: "#2e1c12" }}>
        <Image src="/images/online_main.webp" alt="オンラインショップ" fill className="object-cover" sizes="700px" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #0d0a0a 0%, rgba(13,10,10,0.5) 30%, transparent 65%)" }} />
      </div>

      {/* ラベル 通販 */}
      <div className="absolute" style={{ left: 66, top: 160, width: 44, height: 85, border: "1px solid rgba(255,255,255,0.3)", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 13 }}>
          {["通", "販"].map(char => (
            <span key={char} style={{ fontFamily: mincho, fontSize: 12, color: "#fff", lineHeight: 1 }}>{char}</span>
          ))}
        </div>
      </div>

      {/* OnlineShop タイトル */}
      <p className="absolute" style={{ left: 179, top: 150, fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>OnlineShop</p>

      {/* 説明文 */}
      <p className="absolute" style={{ left: 179, top: 302, width: 495, fontFamily: mincho, fontSize: 15, fontWeight: 400, letterSpacing: "1.5px", color: "rgba(235,229,219,0.85)", lineHeight: "40px" }}>
        焼肉専門店の本格的な味わいを、そのままご家庭へ。<br />
        お中元やお歳暮はもちろん、誕生日や記念日などの贈り物、<br />
        感謝を伝えるお返しやご自宅での特別な食卓にもおすすめです。
      </p>

      {/* ボタン */}
      <div className="absolute" style={{ left: 179, top: 480 }}>
        <OutlineButton jp="オンラインショップ" href="#" width={199} align="center" />
      </div>

    </section>
  );
}
