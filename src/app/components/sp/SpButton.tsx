const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

interface Props {
  href: string;
  label: string;
  en?: string;
}

export default function SpButton({ href, label, en }: Props) {
  return (
    <div style={{ display: "flex", justifyContent: "center", flexShrink: 0 }}>
      <a
        href={href}
        style={{
          height: 50,
          borderRadius: 25,
          border: "1px solid rgba(221,168,63,0.6)",
          background: "transparent",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          paddingLeft: 22,
          paddingRight: 22,
          gap: 8,
        }}
      >
        <span style={{ fontFamily: "sans-serif", fontSize: 16, color: "#fff", lineHeight: 1 }}>·</span>
        <span style={{ fontFamily: mincho, fontSize: 14, letterSpacing: "1px", color: "#fff" }}>{label}</span>
        {en && (
          <span style={{ fontFamily: sans, fontSize: 14, fontWeight: 700, letterSpacing: "1.5px", color: "#ebe5db" }}>{en}</span>
        )}
      </a>
    </div>
  );
}
