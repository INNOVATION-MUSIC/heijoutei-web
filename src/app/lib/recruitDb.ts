import { createStaticClient } from "@/lib/supabase/static";
import { RECRUIT_JOBS, getRecruitJob, type RecruitJob, type RecruitTag, type RecruitRow } from "./recruitData";

// 店舗 slug → 採用タブ名（RECRUIT_STORE_TABS の値と一致させる）
const SLUG_TO_TAB: Record<string, string> = {
  kameoka: "亀岡店",
  sonobe: "園部店",
  fukuchiyama: "福知山店",
  yurano: "焼肉 ゆらの",
  heijohtei: "ヘイジョウテイ",
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  return `${y}.${m}.${day}`;
}

type RecruitRowDb = {
  sort_order: number | null;
  title: string;
  image_url: string | null;
  hero_image_url: string | null;
  summary: string | null;
  body: string | null;
  published_at: string | null;
  stores: { slug: string; phone: string | null } | null;
  recruitment_tags: { label: string; color: string; sort_order: number | null }[];
  recruitment_details: { label: string; value: string; sort_order: number | null }[];
};

const SELECT =
  "sort_order, title, image_url, hero_image_url, summary, body, published_at, stores(slug, phone), recruitment_tags(label, color, sort_order), recruitment_details(label, value, sort_order)";

function toJob(r: RecruitRowDb): RecruitJob {
  const tags: RecruitTag[] = (r.recruitment_tags ?? [])
    .slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((t) => ({ label: t.label, color: t.color }));
  const detail: RecruitRow[] = (r.recruitment_details ?? [])
    .slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((d) => ({ label: d.label, value: d.value }));
  return {
    id: String(r.sort_order ?? ""),
    store: r.stores ? (SLUG_TO_TAB[r.stores.slug] ?? r.stores.slug) : "",
    img: r.image_url ?? "",
    heroImg: r.hero_image_url ?? undefined,
    date: formatDate(r.published_at),
    title: r.title,
    tags,
    summary: (r.summary ?? "").split("\n").filter(Boolean),
    lead: r.body ?? "",
    detail,
    applyTel: r.stores?.phone ?? "",
  };
}

export async function fetchRecruitList(): Promise<RecruitJob[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("recruitments")
      .select(SELECT)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return RECRUIT_JOBS;
    return (data as unknown as RecruitRowDb[]).map(toJob);
  } catch {
    return RECRUIT_JOBS;
  }
}

export async function fetchRecruitJob(id: string): Promise<RecruitJob | undefined> {
  try {
    const supabase = createStaticClient();
    const { data } = await supabase
      .from("recruitments")
      .select(SELECT)
      .eq("is_published", true)
      .eq("sort_order", Number(id))
      .limit(1)
      .maybeSingle();
    if (!data) return getRecruitJob(id);
    return toJob(data as unknown as RecruitRowDb);
  } catch {
    return getRecruitJob(id);
  }
}

export async function fetchRecruitParams(): Promise<{ id: string }[]> {
  try {
    const supabase = createStaticClient();
    const { data } = await supabase.from("recruitments").select("sort_order").eq("is_published", true);
    if (!data || data.length === 0) return RECRUIT_JOBS.map((j) => ({ id: j.id }));
    return data.map((r) => ({ id: String(r.sort_order ?? "") }));
  } catch {
    return RECRUIT_JOBS.map((j) => ({ id: j.id }));
  }
}
