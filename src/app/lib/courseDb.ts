import { createStaticClient } from "@/lib/supabase/static";
import { COURSES_BY_STORE, COURSES, type CourseItem } from "./menuData";

type CourseRowDb = {
  name: string;
  type_label: string | null;
  price_label: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number | null;
  stores: { slug: string } | null;
  course_categories?: { slug: string; name: string; sort_order: number | null } | null;
};

// /menu/course のサブタブ1つ分。slug=null は未分類（タブにしない／単独ならフラット表示）。
export type CourseGroup = { slug: string | null; name: string | null; courses: CourseItem[] };

function toItem(r: CourseRowDb): CourseItem {
  return {
    label: r.type_label ?? "",
    title: r.name,
    price: r.price_label ?? "",
    desc: r.description ?? "",
    photo: r.image_url ?? "",
  };
}

// トップ Course セクションの3カード用（テキストのみ・画像はフロント側でローカル据え置き）。
export type TopCourse = { sub: string; name: string; price: string; desc: string };

/**
 * トップページの Course ティーザー3枚ぶんのテキストを kameoka のコースから取得する。
 * 3件に満たない／DB 空／失敗時は undefined を返し、フロントは従来の静的コピーにフォールバックする。
 * 画像はトップ専用（course1/2/3.webp）をフロント側で保持するため、ここでは返さない。
 */
export async function fetchTopCourses(storeSlug = "kameoka"): Promise<TopCourse[] | undefined> {
  try {
    const byStore = await fetchCoursesByStore();
    const items = byStore[storeSlug];
    if (!items || items.length < 3) return undefined;
    return items.slice(0, 3).map((c) => ({ sub: c.label, name: c.title, price: c.price, desc: c.desc }));
  } catch {
    return undefined;
  }
}

/** 全店舗のコースを店舗 slug ごとにまとめて返す（DB 空時は静的データにフォールバック）。 */
export async function fetchCoursesByStore(): Promise<Record<string, CourseItem[]>> {
  const fallback: Record<string, CourseItem[]> = {};
  // 静的フォールバック（kameoka は既定 COURSES、他店は COURSES_BY_STORE）
  fallback.kameoka = COURSES;
  for (const [slug, items] of Object.entries(COURSES_BY_STORE)) {
    if (items) fallback[slug] = items;
  }
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("courses")
      .select("name, type_label, price_label, description, image_url, sort_order, stores(slug)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return fallback;
    const map: Record<string, CourseItem[]> = {};
    for (const row of data as unknown as CourseRowDb[]) {
      const slug = row.stores?.slug;
      if (!slug) continue;
      (map[slug] ??= []).push(toItem(row));
    }
    return Object.keys(map).length > 0 ? map : fallback;
  } catch {
    return fallback;
  }
}

/**
 * 店舗 slug ごとに、コースをカテゴリ別グループ（サブタブ）にまとめて返す。
 * カテゴリ付きを course_categories.sort_order 順、未分類は末尾の slug=null グループに集約する。
 * DB 空／失敗時は undefined を返し、フロントは静的データのフラット表示にフォールバックする。
 */
export async function fetchCourseGroupsByStore(): Promise<Record<string, CourseGroup[]> | undefined> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("courses")
      .select(
        "name, type_label, price_label, description, image_url, sort_order, stores(slug), course_categories(slug, name, sort_order)"
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return undefined;

    // 店舗 slug → (カテゴリ slug|null → グループ) を順序を保って構築
    const byStore: Record<string, Map<string, CourseGroup & { _order: number }>> = {};
    for (const row of data as unknown as CourseRowDb[]) {
      const storeSlug = row.stores?.slug;
      if (!storeSlug) continue;
      const cat = row.course_categories ?? null;
      const key = cat?.slug ?? "__none__";
      const groups = (byStore[storeSlug] ??= new Map());
      let g = groups.get(key);
      if (!g) {
        g = {
          slug: cat?.slug ?? null,
          name: cat?.name ?? null,
          courses: [],
          // 未分類は末尾（大きな値）。カテゴリは sort_order 昇順。
          _order: cat ? cat.sort_order ?? 0 : Number.MAX_SAFE_INTEGER,
        };
        groups.set(key, g);
      }
      g.courses.push(toItem(row));
    }

    const result: Record<string, CourseGroup[]> = {};
    for (const [storeSlug, groups] of Object.entries(byStore)) {
      result[storeSlug] = [...groups.values()]
        .sort((a, b) => a._order - b._order)
        .map(({ slug, name, courses }) => ({ slug, name, courses }));
    }
    return Object.keys(result).length > 0 ? result : undefined;
  } catch {
    return undefined;
  }
}
