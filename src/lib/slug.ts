import slugify from 'slugify'

// 'use server' ファイルでは同期関数を export できないため通常モジュールに分離。
// 日本語タイトルだと slugify が空を返すためタイムスタンプで代替する。
export function generateSlug(title: string): string {
  const s = slugify(title, { lower: true, strict: true, locale: 'ja', trim: true }).substring(0, 100)
  return s || `news-${Date.now()}`
}
