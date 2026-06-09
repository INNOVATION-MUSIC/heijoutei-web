import { LINE_STORE_LINKS } from "./navLinks";

/**
 * 店舗詳細ページ（/store/[id]）用データ。
 * 亀岡店は Figma「店舗一覧（詳細）」162:879 に準拠した実コンテンツ。
 * 他 4 店舗は店舗一覧（StoreListSection）と同等の情報で構成（詳細デザイン未確定のため流用）。
 */
export type StoreDetail = {
  slug: string;
  enLabel: string; // 英字ラベル（double space は whiteSpace:pre で保持）
  name: string;
  desc?: string[]; // 説明文（行ごと・任意）
  photos: string[]; // 上部写真（500×500・2 枚想定）
  address: string;
  phone: string;
  access: string;
  hours: string[]; // 営業時間（行ごと）
  closed: string;
  seats?: string; // お席（任意）
  lineName?: string; // LINE 友だち追加ボタンの店舗名（無い店舗はボタン非表示）
  lineUrl?: string;
};

export const STORE_DETAILS: StoreDetail[] = [
  {
    slug: "kameoka",
    enLabel: "HEIJOHTEI  KAMEOKA",
    name: "平壌亭  亀岡店",
    desc: [
      "落ち着きのある空間の中で、",
      "上質な焼肉と特別なひとときをお楽しみいただけます",
      "本店ならではのメニュー、ランチ&ディナーもご用意しております",
    ],
    photos: ["/images/storelist_kameoka.webp", "/images/about_interior.webp"],
    address: "京都府亀岡市篠町浄法寺中村３５-５",
    phone: "0771-23-8410",
    access:
      "【30台無料駐車場完備】お車でお越しの方も安心◎ 8名様以上でマイクロバスの送迎も承ります。お気軽にご相談ください。",
    hours: [
      "月、水〜日、祝日、祝前日: 11:30〜14:30 （料理L.O. 14:00 ドリンクL.O. 14:00）16:00〜22:30 （料理L.O. 22:00 ドリンクL.O. 22:00）",
      "お席120分制となっておりますのでご了承ください。",
    ],
    closed: "火曜　但し祝祭日の場合は翌日",
    seats: "126席(テーブル/掘りごたつ座敷/個室)　4〜36名様までOKの個室完備",
    lineName: "亀岡店",
    lineUrl: LINE_STORE_LINKS.kameoka,
  },
  {
    slug: "sonobe",
    enLabel: "HEIJOHTEI  SONOBE",
    name: "平壌亭  園部店",
    photos: ["/images/storelist_sonobe.webp", "/images/about_interior.webp"],
    address: "京都府南丹市園部町上木崎町坪ノ内26-5",
    phone: "0771-68-1760",
    access: "20台駐車場完備/8名様よりマイクロバス送迎あり",
    hours: ["月、水〜日、祝日、祝前日: 16:00〜22:30"],
    closed: "火曜",
    lineName: "園部店",
    lineUrl: LINE_STORE_LINKS.sonobe,
  },
  {
    slug: "fukuchiyama",
    enLabel: "HEIJOHTEI  FUKUCHIYAMA",
    name: "平壌亭  福知山店",
    photos: ["/images/storelist_fukuchiyama.webp", "/images/about_interior.webp"],
    address: "京都府福知山市字堀2303の２",
    phone: "0773-24-2322",
    access: "15台駐車場完備/8名様よりマイクロバス送迎あり",
    hours: ["月、水〜日、祝日、祝前日: 16:00〜22:30"],
    closed: "火曜",
    lineName: "福知山店",
    lineUrl: LINE_STORE_LINKS.fukuchiyama,
  },
  {
    slug: "yurano",
    enLabel: "YAKINIKU  YURANO",
    name: "焼肉ゆらの",
    photos: ["/images/storelist_yurano.webp", "/images/about_interior.webp"],
    address: "京都府福知山堀今岡６番地ゆらのガーデン内",
    phone: "0773-45-8429",
    access: "JR福知山駅より徒歩10分/駐車場有",
    hours: ["11:30〜14:30(LO14:00) / 17:00〜22:00(LO21:30)"],
    closed: "火曜",
    lineName: "ゆらの",
    lineUrl: LINE_STORE_LINKS.yurano,
  },
  {
    slug: "heijohtei",
    enLabel: "HEIJOHTEI",
    name: "ヘイジョウテイ",
    photos: ["/images/about_zashiki.webp", "/images/about_interior.webp"],
    address: "京都府亀岡市篠町浄法寺中村34-6",
    phone: "0771-20-1960",
    access: "JR嵯峨野線「亀岡」駅から徒歩15分",
    hours: ["月、水〜日、祝日、祝前日: 16:00〜22:30"],
    closed: "火曜",
  },
];

export function getStoreDetail(slug: string): StoreDetail | undefined {
  return STORE_DETAILS.find((s) => s.slug === slug);
}
