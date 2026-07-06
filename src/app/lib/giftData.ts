// ギフト（ご進物）ページのデータ。PC / SP 共通の唯一の正本。
// 表示コンポーネント（PC・後日追加の SP）はすべてこのファイルを import する。
// 管理画面連携時は、この静的配列を DB 取得関数に差し替えるだけで PC/SP 両方へ反映される。

/** 価格表示のパーツ（大きい金額=lg / 単位・補足=sm）。お食事券のように複数額面を並べるため配列で持つ。 */
export type GiftPricePart = { text: string; size: "lg" | "sm" };

/** 商品スペック（右カラムのラベル + 値の行）。 */
export type GiftSpecRow = { label: string; value: string };

export type GiftProduct = {
  id: string;
  /** 小見出し（金色・タイトル上） */
  subtitle: string;
  /** 商品名 */
  title: string;
  /** 価格表示パーツ */
  price: GiftPricePart[];
  /** 商品写真（/images/xxx.webp） */
  image: string;
  imageAlt: string;
  /** 説明文（\n で改行） */
  description: string;
  /** 左カラムのラベル（セット内容 / 額 面 など） */
  contentLabel: string;
  /** 左カラムの値（\n で改行・全角スペースで桁揃え） */
  content: string;
  /** 右カラムのスペック行 */
  specs: GiftSpecRow[];
  /** 写真が低い短いカード（お食事券）。true で写真の高さを詰める。 */
  short?: boolean;
};

export const GIFT_PRODUCTS: GiftProduct[] = [
  {
    id: "tokusen-tabekurabe",
    subtitle: "厳選した人気部位をバランスよくセットに",
    title: "特選焼肉食べ比べセット",
    price: [
      { text: "15,120", size: "lg" },
      { text: "円 / 500g（本体14,000円）", size: "sm" },
    ],
    image: "/images/gift_steak_hikaku.webp",
    imageAlt: "特選焼肉食べ比べセット",
    description:
      "平壌亭の最高級ランクの焼肉を詰め合わせました。厚切りヒレの風味と柔らかさは絶品です。\n大切な方への贈り物におすすめの逸品です。",
    contentLabel: "セット内容",
    content:
      "ヒレ　　　　　　　140g\nサーロイン　　　　140g\n上ロース　　　　　110g\n上カルビ　　　　　110g\n卓上用つけだれ　　100g\n調理用もみだれ　　100g",
    specs: [
      { label: "賞味期限", value: "発送より1ヶ月" },
      { label: "外形サイズ", value: "22 × 30 × 7.5cm" },
      { label: "発送形態", value: "クール冷凍便" },
      { label: "送 料", value: "別途 下記料金表の通り" },
    ],
  },
  {
    id: "wagyu-yakiniku",
    subtitle: "肉のプロが厳選した和牛",
    title: "和牛焼肉セット",
    price: [
      { text: "7,020", size: "lg" },
      { text: "円 / 500g（本体6,500円）", size: "sm" },
    ],
    image: "/images/gift_wagyu.webp",
    imageAlt: "和牛焼肉セット",
    description:
      "肉の旨みを存分に味わえる、贅沢なセットです。\nカルビの上質な甘み、赤身肉の奥深いコクをご家庭でお楽しみいただけます。",
    contentLabel: "セット内容",
    content:
      "カルビ　　　　　　250g\n赤身肉　　　　　　250g\n卓上用つけだれ　　100g\n調理用もみだれ　　100g",
    specs: [
      { label: "賞味期限", value: "発送より1ヶ月" },
      { label: "外形サイズ", value: "22 × 30 × 7.5cm" },
      { label: "発送形態", value: "クール冷凍便" },
      { label: "送 料", value: "別途 下記料金表の通り" },
    ],
  },
  {
    id: "sukiyaki-shabushabu",
    subtitle: "とろけるようなやわらかさと上品な旨み",
    title: "すき焼き・しゃぶしゃぶ",
    price: [
      { text: "6,480", size: "lg" },
      { text: "円 / 500g（本体6,000円）", size: "sm" },
    ],
    image: "/images/gift_sukiyaki.webp",
    imageAlt: "すき焼き・しゃぶしゃぶ用 肩ロース",
    description:
      "サシがきめ細かく入った肩ロースをすき焼き・しゃぶしゃぶ用に、丁寧にスライスしました。\n特別な日の食卓に、贅沢なひと品を。",
    contentLabel: "セット内容",
    content: "肩ロース　　　　　500g",
    specs: [
      { label: "賞味期限", value: "発送より1ヶ月" },
      { label: "外形サイズ", value: "22 × 30 × 7.5cm" },
      { label: "発送形態", value: "クール冷凍便" },
      { label: "送 料", value: "別途 下記料金表の通り" },
    ],
  },
  {
    id: "oshokujiken",
    subtitle: "大切な方への贈り物に",
    title: "＜平壌亭＞お食事券",
    price: [
      { text: "5,000", size: "lg" },
      { text: "円 / ", size: "sm" },
      { text: "1,000", size: "lg" },
      { text: "円", size: "sm" },
    ],
    image: "/images/gift_ticket.webp",
    imageAlt: "＜平壌亭＞お食事券",
    description:
      "贈り物や景品としてなど、さまざまなシーンでご利用いただけます。\n平壌亭各店でご使用になれます。おつりは出ませんのでご了承ください。",
    contentLabel: "額 面",
    content: "5,000円 / 1,000円",
    specs: [{ label: "有効期限", value: "なし" }],
    short: true,
  },
];

/** 送料金表の 1 地域（地域名・都道府県・送料）。 */
export type GiftShippingArea = { region: string; prefectures: string[]; fee: string };

// Figma 表の並び（6 列 × 2 段）
export const GIFT_SHIPPING: GiftShippingArea[] = [
  { region: "北海道", prefectures: ["北海道"], fee: "1,970" },
  { region: "北東北", prefectures: ["青森県", "秋田県", "岩手県"], fee: "1,530" },
  { region: "南東北", prefectures: ["宮城県", "山形県", "福島県"], fee: "1,420" },
  { region: "関東", prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "神奈川県", "東京都", "山梨県"], fee: "1,310" },
  { region: "信越", prefectures: ["新潟県", "長野県"], fee: "1,200" },
  { region: "中部", prefectures: ["静岡県", "愛知県", "三重県", "岐阜県"], fee: "1,200" },
  { region: "北陸", prefectures: ["富山県", "石川県", "福井県"], fee: "1,200" },
  { region: "関西", prefectures: ["大阪府", "京都府", "滋賀県", "奈良県", "和歌山県", "兵庫県"], fee: "980" },
  { region: "中国", prefectures: ["岡山県", "広島県", "山口県", "鳥取県", "島根県"], fee: "1,200" },
  { region: "四国", prefectures: ["香川県", "徳島県", "愛媛県", "高知県"], fee: "1,200" },
  { region: "九州", prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県"], fee: "1,310" },
  { region: "沖縄", prefectures: ["沖縄県"], fee: "1,640" },
];

/** ご注文の問い合わせ先（CTA バンド）。 */
export const GIFT_CONTACT = {
  lead: "ご注文は各店頭、またはお電話にで承ります",
  phone: "0771-23-8410",
  hours: "受付時間：11:00〜21:00　※火曜定休",
} as const;
