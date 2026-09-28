// media バケットへのアップロード時に付けるブラウザキャッシュ期間（秒）。
// ファイル名は毎回 UUID で上書きしないため、長期キャッシュでも古い画像が残らない。
// Supabase は Free プランだと配信時に常に no-cache を返し、この値が効くのは Pro 以上（Smart CDN）。
export const MEDIA_CACHE_CONTROL = '31536000'
