import Image from "next/image";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

export default function CtaSectionSP() {
  return (
    <section className="relative overflow-hidden" style={{ width: 390, height: 671 }}>
      {/* 背景写真 */}
      <div className="absolute inset-0 overflow-hidden bg-[#1a0c05]">
        <Image src="/images/cta.jpg" alt="" fill className="object-cover" sizes="390px" />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      {/* 上半分: お電話でのご予約 */}
      <div className="absolute" style={{ left: 0, top: 110, width: 390, textAlign: "center" as const }}>
        <p style={{ fontFamily: sans, fontSize: 9, fontWeight: 300, letterSpacing: "0.45em", color: "rgba(235,229,219,0.4)", marginBottom: 16, textTransform: "uppercase" as const }}>Reservation by phone</p>
        <p style={{ fontFamily: mincho, fontSize: 16, fontWeight: 400, letterSpacing: "0.25em", color: "#ebe5db", marginBottom: 20 }}>お電話でのご予約</p>
        <a href="tel:0771-00-0000" style={{ display: "block", fontFamily: mincho, fontSize: 42, fontWeight: 400, letterSpacing: "0.05em", color: "#d9b86b", textDecoration: "none", marginBottom: 18 }}>
          0771-00-0000
        </a>
        <p style={{ fontFamily: mincho, fontSize: 11, fontWeight: 300, letterSpacing: "0.1em", color: "rgba(235,229,219,0.65)" }}>受付時間：11:00〜21:00　※火曜定休</p>
      </div>

      {/* 中央区切り線 */}
      <div className="absolute" style={{ left: 40, top: 335, width: 310, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />

      {/* 下半分: テイクアウトのご注文 */}
      <div className="absolute" style={{ left: 0, top: 360, width: 390, textAlign: "center" as const }}>
        <p style={{ fontFamily: sans, fontSize: 9, fontWeight: 300, letterSpacing: "0.45em", color: "rgba(235,229,219,0.4)", marginBottom: 16, textTransform: "uppercase" as const }}>Takeout order</p>
        <p style={{ fontFamily: mincho, fontSize: 16, fontWeight: 400, letterSpacing: "0.25em", color: "#ebe5db", marginBottom: 24 }}>テイクアウトのご注文</p>
      </div>

      {/* テイクアウトボタン */}
      <a href="#" className="absolute flex items-center overflow-hidden" style={{ left: 109, top: 438, width: 171, height: 50, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", textDecoration: "none" }}>
        <span className="absolute" style={{ left: 22, top: 11, fontFamily: "sans-serif", fontSize: 16, color: "#ffffff" }}>·</span>
        <span className="absolute" style={{ left: 35, top: 15, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#ffffff" }}>ご注文</span>
        <span className="absolute" style={{ left: 95, top: 15, fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.125em", color: "#ebe5db" }}>Takeout</span>
      </a>

      <p className="absolute" style={{ left: 0, top: 508, width: 390, textAlign: "center" as const, fontFamily: mincho, fontSize: 11, fontWeight: 300, letterSpacing: "0.1em", color: "rgba(235,229,219,0.65)" }}>
        24時間予約受付中
      </p>
    </section>
  );
}
