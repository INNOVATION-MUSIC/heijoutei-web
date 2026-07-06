import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site";
import { fetchNewsParams } from "./lib/newsDb";
import { fetchStoreParams } from "./lib/storeDb";
import { fetchMenuParams } from "./lib/menuDb";
import { fetchRecruitParams } from "./lib/recruitDb";

export const revalidate = 3600;

// 静的ルートと優先度（/admin・/auth はクロール対象外なので含めない）
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/news", priority: 0.8, changeFrequency: "weekly" },
  { path: "/menu", priority: 0.9, changeFrequency: "weekly" },
  { path: "/menu/lunch", priority: 0.7, changeFrequency: "monthly" },
  { path: "/menu/course", priority: 0.7, changeFrequency: "monthly" },
  { path: "/menu/takeout", priority: 0.7, changeFrequency: "monthly" },
  { path: "/store", priority: 0.8, changeFrequency: "monthly" },
  { path: "/recruit", priority: 0.6, changeFrequency: "weekly" },
  { path: "/takeout", priority: 0.7, changeFrequency: "monthly" },
  { path: "/gift", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // DB 由来の動的ページ（失敗時も静的ルートだけは返せるよう安全側に）
  const [news, stores, menu, recruit] = await Promise.all([
    fetchNewsParams().catch(() => []),
    fetchStoreParams().catch(() => []),
    fetchMenuParams().catch(() => []),
    fetchRecruitParams().catch(() => []),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const dynamicEntries: MetadataRoute.Sitemap = [
    ...news.map((n) => ({ url: `${SITE_URL}/news/${n.id}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...stores.map((s) => ({ url: `${SITE_URL}/store/${s.id}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...menu.map((m) => ({ url: `${SITE_URL}/menu/${m.category}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...recruit.map((j) => ({ url: `${SITE_URL}/recruit/${j.id}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
  ];

  return [...staticEntries, ...dynamicEntries];
}
