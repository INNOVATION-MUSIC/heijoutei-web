const sans = "'Noto Sans JP', sans-serif";

// 平壌亭の姉妹店（焼肉ゆらの・KOPU29）の slug
const SISTER_STORE_SLUGS = ["yurano", "heijohtei"];

export function isSisterStore(slug: string): boolean {
  return SISTER_STORE_SLUGS.includes(slug);
}

// 姉妹店に付けるタグ
export default function SisterStoreTag({ compact = false }: { compact?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 18,
        padding: compact ? "0 5px" : "0 8px",
        border: "1px solid rgba(221,168,63,0.6)",
        borderRadius: 2,
        fontFamily: sans,
        fontSize: 10,
        fontWeight: 400,
        letterSpacing: compact ? "0.5px" : "1px",
        color: "#d9b86b",
        lineHeight: 1,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      姉妹店
    </span>
  );
}
