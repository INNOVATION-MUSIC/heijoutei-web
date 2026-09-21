"use client";

import type { LegalDoc } from "@/app/lib/legalDoc";

const mincho = "'Shippori Mincho', serif";
const GOLD = "#d9b86b";
const TEXT = "rgba(235,229,219,0.82)";

/** 規約・ポリシー類の本文（前文・各条・制定日・事業者名）。PC/SP 共通、寸法だけ sp で切り替える。 */
export default function LegalBody({ doc, sp = false }: { doc: LegalDoc; sp?: boolean }) {
  const body = { margin: 0, fontFamily: mincho, fontSize: sp ? 13.5 : 15, lineHeight: sp ? "25px" : "29px", letterSpacing: "0.04em", color: TEXT } as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: sp ? 34 : 46 }}>
      <p style={body}>{doc.preamble}</p>

      {doc.articles.map((a) => (
        <section key={a.heading} style={{ display: "flex", flexDirection: "column", gap: sp ? 12 : 16 }}>
          <h2 style={{ margin: 0, fontFamily: mincho, fontSize: sp ? 16 : 18, fontWeight: 500, letterSpacing: "0.06em", color: GOLD, lineHeight: 1.6 }}>
            {a.heading}
          </h2>
          {a.blocks.map((b, i) => {
            if (b.kind === "p") return <p key={i} style={body}>{b.text}</p>;
            if (b.kind === "sub") {
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <p style={{ ...body, color: "#ebe5db", fontWeight: 500 }}>{b.title}</p>
                  <p style={body}>{b.text}</p>
                </div>
              );
            }
            return (
              <ul key={i} style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {b.items.map((t) => (
                  <li key={t} style={{ display: "flex", gap: 8 }}>
                    <span style={{ ...body, flexShrink: 0 }}>・</span>
                    <span style={body}>{t}</span>
                  </li>
                ))}
              </ul>
            );
          })}
        </section>
      ))}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, paddingTop: sp ? 4 : 10 }}>
        {doc.enacted && <p style={{ ...body, fontSize: sp ? 12.5 : 14 }}>制定日：{doc.enacted}</p>}
        <p style={{ ...body, fontSize: sp ? 12.5 : 14 }}>事業者名：{doc.company}</p>
      </div>
    </div>
  );
}
