import { createStaticClient } from "@/lib/supabase/static";
import { NEWS_LIST_DATA, NEWS_DATA, NEWS_TAG_NEW, type NewsListItem, type NewsItem, type Tag } from "./newsData";

// NEW タグは「公開日時から2週間」だけ自動表示する（DB に手動 NEW タグは持たせない）。
const NEW_TAG_LABEL = "NEW";
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
function isNew(publishedAt: string | null): boolean {
  if (!publishedAt) return false;
  const t = new Date(publishedAt).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= TWO_WEEKS_MS;
}

// published_at(ISO) → フロント表示の日付文字列 "YYYY.MM.D"（例: 2026.05.1）
function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "numeric",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  return `${y}.${m}.${day}`;
}

type NewsRow = {
  slug: string;
  title: string;
  body: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  news_tags: { label: string; color: string; sort_order: number | null }[];
};

function toItem(row: NewsRow): NewsListItem {
  const dbTags: Tag[] = (row.news_tags ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((t) => ({ label: t.label, color: t.color }))
    .filter((t) => t.label !== NEW_TAG_LABEL); // NEW は公開日時から自動付与するため手動分は除外
  // 公開から2週間以内は先頭に NEW を自動付与
  const tags: Tag[] = isNew(row.published_at) ? [NEWS_TAG_NEW, ...dbTags] : dbTags;
  const img = row.thumbnail_url || `/images/newslist${row.slug}.webp`;
  return {
    id: row.slug,
    img,
    date: formatDate(row.published_at),
    title: row.title,
    tags,
    heroImg: row.thumbnail_url || undefined,
    body: row.body ?? undefined,
  };
}

/** 一覧（公開済み・新しい順）。DB が空/失敗時は静的データにフォールバックして安全に動作。 */
export async function fetchNewsList(): Promise<NewsListItem[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("news")
      .select("slug, title, body, thumbnail_url, published_at, news_tags(label, color, sort_order)")
      .eq("is_published", true)
      .lte("published_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return NEWS_LIST_DATA;
    return (data as NewsRow[]).map(toItem);
  } catch {
    return NEWS_LIST_DATA;
  }
}

/** 詳細（slug=従来id）。未存在は undefined。 */
export async function fetchNewsArticle(id: string): Promise<NewsListItem | undefined> {
  try {
    const supabase = createStaticClient();
    const { data } = await supabase
      .from("news")
      .select("slug, title, body, thumbnail_url, published_at, news_tags(label, color, sort_order)")
      .eq("slug", id)
      .eq("is_published", true)
      .maybeSingle();
    if (!data) return NEWS_LIST_DATA.find((n) => n.id === id);
    return toItem(data as NewsRow);
  } catch {
    return NEWS_LIST_DATA.find((n) => n.id === id);
  }
}

/** トップページの News カルーセル用（最新数件・{img,date,title,tags} 形）。DB空時は静的にフォールバック。 */
export async function fetchTopNews(limit = 5): Promise<NewsItem[]> {
  try {
    const list = await fetchNewsList();
    if (!list || list.length === 0) return NEWS_DATA;
    return list.slice(0, limit).map(({ id, img, date, title, tags }) => ({ id, img, date, title, tags }));
  } catch {
    return NEWS_DATA;
  }
}

/** generateStaticParams 用の id(slug) 一覧。 */
export async function fetchNewsParams(): Promise<{ id: string }[]> {
  try {
    const supabase = createStaticClient();
    const { data } = await supabase.from("news").select("slug").eq("is_published", true);
    if (!data || data.length === 0) return NEWS_LIST_DATA.map((n) => ({ id: n.id }));
    return data.map((r) => ({ id: r.slug }));
  } catch {
    return NEWS_LIST_DATA.map((n) => ({ id: n.id }));
  }
}
