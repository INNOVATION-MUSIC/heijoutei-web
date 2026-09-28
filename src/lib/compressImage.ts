// 管理画面のアップロード前に、ブラウザ内で画像を縮小・WebP 化する。
// 公開側は縮小配信せず保存した画像をそのまま表示する（next.config の images.unoptimized）ため、保存時点で配信サイズにしておく。
// GIF（アニメーション）・SVG は変換しない。変換できない／小さくならない場合は元ファイルをそのまま返す。

const DEFAULT_MAX_SIZE = 1600;
// メニュー・テイクアウト・カテゴリの画像（表示は最大500px前後）。既存画像の作り直し時の寸法とそろえる
export const MENU_IMAGE_MAX_SIZE = 1000;
const WEBP_QUALITY = 0.82;

export async function compressImage(file: File, maxSize = DEFAULT_MAX_SIZE): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;

  let bitmap: ImageBitmap;
  try {
    // EXIF の向きを反映（スマホ写真の横倒れ防止）
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  const ratio = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * ratio);
  const height = Math.round(bitmap.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY));
  // WebP 書き出し非対応のブラウザは PNG 等にフォールバックして大きくなりうるので、その場合は元ファイルを使う
  if (!blob || blob.type !== "image/webp") return file;
  if (ratio === 1 && blob.size >= file.size) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.webp`, { type: "image/webp" });
}
