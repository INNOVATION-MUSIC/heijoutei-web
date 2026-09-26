import Image from "next/image";
import SpButton from "./SpButton";
import { SECTION_LINKS } from "@/app/lib/navLinks";
import { type StoreImageMap, type StoreNameMap } from "@/app/lib/storeDb";
import { layoutStoreName } from "@/app/lib/storeName";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";
const sans = "'Noto Sans JP', sans-serif";

function PhoneIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z"
        fill="#d9b86b"
      />
    </svg>
  );
}

// 小カードの店名: 長い店名は2行にし、そのカードだけ高さを伸ばす（セクション下部の余白内に収まる）
function smallStoreName(name: string) {
  const layout = layoutStoreName(name, "　", 190, 18, 2, 15);
  return { ...layout, cardHeight: layout.lines.length > 1 ? 145 : 120 };
}

function SmallStoreName({ lines, fontSize }: { lines: string[]; fontSize: number }) {
  return (
    <p style={{ fontFamily: mincho, fontSize, fontWeight: 800, letterSpacing: "2px", color: "#fff", marginBottom: 8, whiteSpace: "nowrap", lineHeight: lines.length > 1 ? 1.35 : undefined }}>
      {lines.map((line, i) => (
        <span key={i} style={{ display: "block" }}>{line}</span>
      ))}
    </p>
  );
}

export default function StoreSectionSP({ images, names }: { images?: StoreImageMap; names?: StoreNameMap }) {
  const kameoka = layoutStoreName(names?.kameoka ?? "平壌亭 亀岡店", "　", 230, 26, 2, 20);
  const kopu = smallStoreName(names?.heijohtei ?? "KOPU29");
  const kopuAlt = names?.heijohtei ?? "KOPU29";
  return (
    <section
      style={{
        width: 390,
        height: 1899,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        paddingTop: 33,
        paddingBottom: 50,
      }}
    >
      {/* ラベル + タイトル */}
      <div style={{ display: "flex", alignItems: "flex-start", paddingLeft: 40, gap: 28, flexShrink: 0 }}>
        <div
          style={{
            boxSizing: "border-box",
            width: 44, height: 94,
            padding: "8px 7px",
            border: "1px solid rgba(255,255,255,0.3)",
            overflow: "hidden", flexShrink: 0,
            display: "flex", justifyContent: "center", alignItems: "center",
          }}
        >
          <p style={{ margin: 0, fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", writingMode: "vertical-rl" as const, whiteSpace: "nowrap", transform: "translateY(4px)" }}>
            店舗
          </p>
        </div>
        <p style={{ fontFamily: display, fontSize: 48, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", paddingTop: 20 }}>
          StoreInfo
        </p>
      </div>

      {/* gap: 159 - (33+85) = 41px */}
      <div style={{ height: 41, flexShrink: 0 }} />

      {/* イントロテキスト */}
      <p
        style={{
          paddingLeft: 40, paddingRight: 40,
          fontFamily: mincho, fontSize: 12,
          letterSpacing: "0.1em", color: "rgba(235,229,219,0.85)",
          lineHeight: "32px", flexShrink: 0,
        }}
      >
        各店くつろげるお席をご用意して、各種ご宴会・記念日・ご接待などのご利用にも対応させていただきます。
        <br />
        亀岡・園部・福知山での焼肉はぜひ焼肉平壌亭へ焼肉宴会で楽しいひと時をお過ごしください。
      </p>

      {/* gap */}
      <div style={{ height: 30, flexShrink: 0 }} />

      {/* ━━━ 亀岡店 (大カード) ━━━ */}
      <div style={{ marginLeft: 20, marginRight: 20, background: "#171717", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "relative", width: 350, height: 320, overflow: "hidden", background: "#1c110a" }}>
          <Image src={images?.kameoka ?? "/images/store_kameoka.webp"} alt="平壌亭 亀岡店" fill className="object-cover" sizes="350px" />
        </div>
        <div style={{ padding: "28px 27px 24px" }}>
          <p style={{ fontFamily: sans, fontSize: 10, fontWeight: 300, letterSpacing: "3px", color: "rgba(217,184,107,0.6)", marginBottom: 14 }}>
            HEIJOHTEI　KAMEOKA
          </p>
          <div style={{ width: 32, height: 1, backgroundColor: "rgba(217,184,107,0.45)", marginBottom: 12 }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
            <p style={{ fontFamily: mincho, fontSize: kameoka.fontSize, fontWeight: 800, letterSpacing: "2px", color: "#fff", whiteSpace: "nowrap", lineHeight: kameoka.lines.length > 1 ? 1.35 : undefined }}>
              {kameoka.lines.map((line, i) => (
                <span key={i} style={{ display: "block" }}>{line}</span>
              ))}
            </p>
            <a
              href="https://maps.google.com/?q=京都府亀岡市篠町浄法寺中村３５-５"
              target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 50, height: 20, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", textDecoration: "none", flexShrink: 0 }}
            >
              <span style={{ fontFamily: sans, fontSize: 10, color: "#fff", letterSpacing: "1px" }}>MAP</span>
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <PhoneIcon size={26} />
            <a href="tel:0771-23-8410" style={{ fontFamily: sans, fontSize: 22, fontWeight: 700, color: "#d9b86b", textDecoration: "none", letterSpacing: "0.5px" }}>
              0771-23-8410
            </a>
          </div>
          <p style={{ fontFamily: sans, fontSize: 12, fontWeight: 300, color: "#fff", lineHeight: "22px", letterSpacing: "0.5px", marginBottom: 8 }}>
            京都府亀岡市篠町浄法寺中村３５-５
          </p>
          <p style={{ fontFamily: sans, fontSize: 12, fontWeight: 300, color: "#fff", lineHeight: "22px", letterSpacing: "0.5px", marginBottom: 8 }}>
            30台駐車場完備/8名様よりマイクロバス送迎あり
          </p>
          <p style={{ fontFamily: sans, fontSize: 12, fontWeight: 300, color: "#fff", lineHeight: "22px", letterSpacing: "0.5px", marginBottom: 8 }}>
            月、水〜日、祝日、祝前日: 11:30〜14:30（料理L.O. 14:00 ドリンクL.O. 14:00）
            <br />16:00〜22:30（料理L.O. 22:00 ドリンクL.O. 22:00）
          </p>
          <p style={{ fontFamily: sans, fontSize: 12, fontWeight: 300, color: "#fff", lineHeight: "22px", letterSpacing: "0.5px" }}>
            定休日 火曜
          </p>
        </div>
      </div>

      {/* gap */}
      <div style={{ height: 30, flexShrink: 0 }} />

      {/* ━━━ 小カード共通 ━━━ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingLeft: 20, paddingRight: 20, flexShrink: 0 }}>
        {[
          { mapImg: images?.sonobe ?? "/images/store_sonobe_map.webp",     subEn: "HEIJOHTEI　SONOBE",     name: smallStoreName(names?.sonobe ?? "平壌亭 園部店"), alt: names?.sonobe ?? "平壌亭 園部店",   tel: "0771-68-1760" },
          { mapImg: images?.fukuchiyama ?? "/images/store_fukuchiyama_map.webp", subEn: "HEIJOHTEI　FUKUCHIYAMA", name: smallStoreName(names?.fukuchiyama ?? "平壌亭 福知山店"), alt: names?.fukuchiyama ?? "平壌亭 福知山店", tel: "0773-24-2322" },
          { mapImg: images?.yurano ?? "/images/store_yurano_map.webp",     subEn: "YAKINIKU YURANO",         name: smallStoreName(names?.yurano ?? "焼肉 ゆらの"), alt: names?.yurano ?? "焼肉ゆらの",    tel: "0773-45-8429" },
        ].map((s) => (
          <div key={s.tel} style={{ height: s.name.cardHeight, background: "#171717", display: "flex", overflow: "hidden" }}>
            <div style={{ width: 130, height: s.name.cardHeight, overflow: "hidden", background: "#1c110a", flexShrink: 0, position: "relative" }}>
              <Image src={s.mapImg} alt={s.alt} fill className="object-cover" sizes="130px" />
            </div>
            <div style={{ padding: "17px 0 0 20px", flex: 1 }}>
              <p style={{ fontFamily: sans, fontSize: 10, fontWeight: 300, letterSpacing: "3px", color: "rgba(217,184,107,0.6)", marginBottom: 6 }}>
                {s.subEn}
              </p>
              <div style={{ width: 32, height: 1, backgroundColor: "rgba(217,184,107,0.45)", marginBottom: 8 }} />
              <SmallStoreName lines={s.name.lines} fontSize={s.name.fontSize} />
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <PhoneIcon size={20} />
                <a href={`tel:${s.tel}`} style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: "#d9b86b", textDecoration: "none", letterSpacing: "0.5px" }}>
                  {s.tel}
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* KOPU29 */}
        <div style={{ height: kopu.cardHeight, background: "#171717", display: "flex", overflow: "hidden" }}>
          {/* 管理画面で店舗写真（hero_image_url）が登録されていれば写真、無ければ白背景にロゴ */}
          {images?.heijohtei ? (
            <div style={{ width: 130, height: kopu.cardHeight, overflow: "hidden", background: "#1c110a", flexShrink: 0, position: "relative" }}>
              <Image src={images.heijohtei} alt={kopuAlt} fill className="object-cover" sizes="130px" />
            </div>
          ) : (
            <div style={{ width: 130, height: kopu.cardHeight, background: "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 96, height: 96, position: "relative", flexShrink: 0 }}>
                <Image src="/images/store_kopu29.webp" alt={kopuAlt} fill className="object-contain" sizes="96px" />
              </div>
            </div>
          )}
          <div style={{ padding: "17px 0 0 20px", flex: 1 }}>
            <p style={{ fontFamily: sans, fontSize: 10, fontWeight: 300, letterSpacing: "3px", color: "rgba(217,184,107,0.6)", marginBottom: 6 }}>
              KOPUNIKU
            </p>
            <div style={{ width: 32, height: 1, backgroundColor: "rgba(217,184,107,0.45)", marginBottom: 8 }} />
            <SmallStoreName lines={kopu.lines} fontSize={kopu.fontSize} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <PhoneIcon size={20} />
              <a href="tel:0771-20-1960" style={{ fontFamily: sans, fontSize: 18, fontWeight: 700, color: "#d9b86b", textDecoration: "none", letterSpacing: "0.5px" }}>
                0771-20-1960
              </a>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 50, flexShrink: 0 }} />

      <SpButton href={SECTION_LINKS.store} label="店舗一覧" />
    </section>
  );
}
