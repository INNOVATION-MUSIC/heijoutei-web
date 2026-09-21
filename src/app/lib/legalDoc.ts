// 利用規約・プライバシーポリシー共通の文書データ型（表示は LegalBody / LegalSection が担当）。

export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "sub"; title: string; text: string };

export type LegalArticle = { heading: string; blocks: LegalBlock[] };

export type LegalDoc = {
  title: string;      // 文書名（h1 の読み上げ・メタ情報用）
  label: string;      // 縦書きラベル（4文字程度）
  en: string;         // 英字見出し
  preamble: string;
  articles: LegalArticle[];
  enacted: string;    // 制定日。空文字なら行ごと非表示
  company: string;
};
