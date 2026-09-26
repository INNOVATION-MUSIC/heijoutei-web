// トップ StoreInfo の店名表示用。管理画面で店名を長くしてもカードが崩れないよう、
// 1行に収まる文字サイズまで縮め、縮みすぎる場合は最後の空白で2行に分ける
// （SSRで決まるよう実測ではなく字幅の概算で計算）。

// 店名の区切りの空白を、デザインの字間（PC=半角2つ・SP=全角1つ）に揃える
export function spacedStoreName(name: string, gap: string): string {
  return name.trim().replace(/[\s　]+/g, gap);
}

function charEm(ch: string): number {
  if (ch === " ") return 0.3;
  if (/[\x21-\x7e]/.test(ch)) return 0.62;
  return 1;
}

export function fitStoreNameFontSize(name: string, maxWidth: number, baseSize: number, letterSpacing: number): number {
  const chars = [...name];
  const em = chars.reduce((sum, ch) => sum + charEm(ch), 0);
  if (em === 0) return baseSize;
  const size = Math.floor((maxWidth - chars.length * letterSpacing) / em);
  return Math.max(10, Math.min(baseSize, size));
}

// 1行で minOneLineSize 未満になる長い店名は、最後の空白で2行に分ける（例「ホルモン 韓国料理」/「KOPU29」）
export function layoutStoreName(
  name: string,
  gap: string,
  maxWidth: number,
  baseSize: number,
  letterSpacing: number,
  minOneLineSize: number,
): { lines: string[]; fontSize: number } {
  const oneLine = spacedStoreName(name, gap);
  const oneLineSize = fitStoreNameFontSize(oneLine, maxWidth, baseSize, letterSpacing);
  const words = name.trim().split(/[\s　]+/);
  if (oneLineSize >= minOneLineSize || words.length < 2) return { lines: [oneLine], fontSize: oneLineSize };
  const lines = [words.slice(0, -1).join(gap), words[words.length - 1]];
  const fontSize = Math.min(...lines.map((l) => fitStoreNameFontSize(l, maxWidth, baseSize, letterSpacing)));
  return { lines, fontSize };
}
