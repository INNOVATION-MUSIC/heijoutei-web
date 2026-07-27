// メニュー（お品書き）データ — PC /menu カテゴリ一覧・/menu/[category] 詳細で共有。
// Figma「メニューカテゴリ」162:1117 / 「メニュー詳細」164:1411 準拠。
// ※肉カテゴリのみ Figma 実データ。他カテゴリは仮の品目（実メニュー確定後に差し替え）。

// 品目の追加メニュー1件（例: サムギョプサルの「豚バラ」）。
export type MenuAddon = { name: string; price: number };

export type MenuItem = {
  name: string;
  desc?: string;
  price: number; // 税込価格（円）
  photo: string; // /images/xxx.webp
  // 追加メニュー（品目カード内に入れ子表示）。未指定/空=なし。
  addons?: MenuAddon[];
};

export type MenuCategory = {
  slug: string; // URL（/menu/[slug]）
  name: string; // カテゴリ名（カテゴリタブ表示）
  title: string; // 詳細ページ見出し（例: 肉メニュー）
  cardPhoto: string; // カテゴリカードの写真
  items: MenuItem[]; // 既定の品目（店舗別データが無い場合のフォールバック）
  // 店舗別メニュー（店舗id → 品目）。未指定の店舗は items にフォールバックする。
  // ※メニューは店舗ごとに変わる想定。実データが入ったらここに店舗idで品目を追加するだけで切替が効く。
  itemsByStore?: Partial<Record<string, MenuItem[]>>;
  // 対象店舗（store slug の配列）。未指定/空=全店表示。指定時はその店舗の /menu 一覧にのみ表示。
  storeSlugs?: string[];
};

// 受取店舗タブ（Figma Group 1）。メニュー内容は全店共通の想定（仮）。
export const MENU_STORES = [
  { id: "kameoka", name: "亀岡店" },
  { id: "sonobe", name: "園部店" },
  { id: "fukuchiyama", name: "福知山店" },
  { id: "yurano", name: "焼肉 ゆらの" },
  { id: "heijohtei", name: "ヘイジョウテイ" },
] as const;

const img = (n: string) => `/images/${n}.webp`;

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    slug: "meibutsu",
    name: "名物",
    title: "名物メニュー",
    cardPhoto: img("menu_cat_meibutsu"),
    items: [
      { name: "名物ユッケ", desc: "新鮮な赤身を秘伝のタレで和えた一品。", price: 1280, photo: img("menu_cat_meibutsu") },
      { name: "特選盛り合わせ", desc: "その日のおすすめ部位を贅沢に。", price: 3980, photo: img("menu_cat_meibutsu") },
      { name: "名物生レバー風", desc: "丁寧に下処理した自慢のレバー。", price: 980, photo: img("menu_cat_meibutsu") },
    ],
  },
  {
    slug: "niku",
    name: "肉",
    title: "肉メニュー",
    cardPhoto: img("menu_cat_niku"),
    // 亀岡店（既定）の肉メニュー。Figma 実データ。
    items: [
      { name: "カルビ", desc: "脂の旨い国産牛カルビは焼肉の王様です。", price: 1199, photo: img("menu_karubi") },
      { name: "上タン塩焼", desc: "焼肉といえばまずはタンから。", price: 1738, photo: img("menu_kamitan") },
      { name: "ハラミ", desc: "ヘルシーで旨味の強い人気の牛ハラミ。", price: 1199, photo: img("menu_harami") },
      { name: "天肉", desc: "牛1頭から1kg前後しかとれない希少なお肉です。", price: 1089, photo: img("menu_tenniku") },
      { name: "肩ロース", desc: "赤身が旨い肩ロースを焼肉カットに切り出した人気商品。", price: 2068, photo: img("menu_kataroin") },
      { name: "厚切りタン塩焼", desc: "贅沢に厚切りにしたこだわりの牛タン。", price: 2068, photo: img("menu_atsutan") },
    ],
    // ▼ デモ用の店舗別メニュー（仮データ）。実メニュー確定後に各店の内容へ差し替え。
    itemsByStore: {
      sonobe: [
        { name: "特上カルビ", desc: "園部店限定の厳選カルビ。", price: 1580, photo: img("menu_karubi") },
        { name: "中落ちカルビ", desc: "骨際の旨味が濃い人気部位。", price: 1080, photo: img("menu_kataroin") },
        { name: "タン元", desc: "やわらかなタンの根元部分。", price: 1980, photo: img("menu_kamitan") },
        { name: "ハラミ", desc: "旨味の強い定番ハラミ。", price: 1199, photo: img("menu_harami") },
        { name: "サガリ", desc: "希少なサガリをさっぱりと。", price: 1380, photo: img("menu_tenniku") },
      ],
      fukuchiyama: [
        { name: "黒毛和牛カルビ", desc: "福知山店自慢の黒毛和牛。", price: 1780, photo: img("menu_karubi") },
        { name: "塩タン", desc: "レモンでさっぱり塩タン。", price: 1380, photo: img("menu_kamitan") },
        { name: "上ハラミ", desc: "厚切りで食べ応え十分。", price: 1480, photo: img("menu_harami") },
        { name: "リブロース", desc: "サシの入った贅沢ロース。", price: 1680, photo: img("menu_kataroin") },
      ],
      yurano: [
        { name: "名物カルビ", desc: "焼肉ゆらのの看板メニュー。", price: 1280, photo: img("menu_karubi") },
        { name: "タン塩", desc: "歯ごたえ抜群のタン塩。", price: 1280, photo: img("menu_kamitan") },
        { name: "ザブトン", desc: "とろける希少部位ザブトン。", price: 1880, photo: img("menu_atsutan") },
        { name: "ミスジ", desc: "きめ細かなサシのミスジ。", price: 1680, photo: img("menu_tenniku") },
        { name: "イチボ", desc: "赤身の旨味が際立つイチボ。", price: 1780, photo: img("menu_kataroin") },
        { name: "ハラミ", desc: "ジューシーな人気のハラミ。", price: 1199, photo: img("menu_harami") },
      ],
      heijohtei: [
        { name: "熟成カルビ", desc: "じっくり熟成させた旨味。", price: 1480, photo: img("menu_karubi") },
        { name: "上タン", desc: "厚切りの上タンを塩で。", price: 1880, photo: img("menu_kamitan") },
        { name: "シャトーブリアン", desc: "ヒレの中心部・最高級部位。", price: 3980, photo: img("menu_atsutan") },
        { name: "特選ロース", desc: "やわらかな特選ロース。", price: 1980, photo: img("menu_kataroin") },
      ],
    },
  },
  {
    slug: "horumon",
    name: "ホルモン",
    title: "ホルモンメニュー",
    cardPhoto: img("menu_cat_horumon"),
    items: [
      { name: "マルチョウ", desc: "脂の甘みととろける食感が人気。", price: 880, photo: img("menu_cat_horumon") },
      { name: "ホルモンミックス", desc: "数種のホルモンを少しずつ。", price: 1280, photo: img("menu_cat_horumon") },
      { name: "ハツ", desc: "コリッとした歯ごたえと淡白な味わい。", price: 780, photo: img("menu_cat_horumon") },
      { name: "テッチャン", desc: "噛むほどに旨味あふれる定番ホルモン。", price: 880, photo: img("menu_cat_horumon") },
    ],
  },
  {
    slug: "set",
    name: "セット",
    title: "セットメニュー",
    cardPhoto: img("menu_cat_set"),
    items: [
      { name: "焼肉セット（2人前）", desc: "人気部位を盛り合わせたお得なセット。", price: 3980, photo: img("menu_cat_set") },
      { name: "上焼肉セット", desc: "厳選した上質な部位を堪能できます。", price: 5800, photo: img("menu_cat_set") },
      { name: "ファミリーセット", desc: "ご家族でたっぷり楽しめるボリューム。", price: 6800, photo: img("menu_cat_set") },
    ],
  },
  {
    slug: "yakimono",
    name: "焼物",
    title: "焼物メニュー",
    cardPhoto: img("menu_cat_yakimono"),
    items: [
      { name: "牛タン焼き", desc: "香ばしく焼き上げる定番の一品。", price: 1580, photo: img("menu_cat_yakimono") },
      { name: "豚バラ焼き", desc: "ジューシーな豚バラを香ばしく焼き上げて。", price: 880, photo: img("menu_cat_yakimono") },
      { name: "鶏もも焼き", desc: "旨味たっぷりの鶏ももをこんがりと。", price: 780, photo: img("menu_cat_yakimono") },
    ],
  },
  {
    slug: "ippin",
    name: "逸品",
    title: "逸品メニュー",
    cardPhoto: img("menu_cat_ippin"),
    items: [
      { name: "チャンジャ", desc: "ピリ辛で箸が進く韓国珍味。", price: 680, photo: img("menu_cat_ippin") },
      { name: "ナムル盛り合わせ", desc: "彩り豊かな三種のナムル。", price: 580, photo: img("menu_cat_ippin") },
      { name: "キムチ盛り合わせ", desc: "自家製キムチの盛り合わせ。", price: 680, photo: img("menu_cat_ippin") },
    ],
  },
  {
    slug: "salad",
    name: "サラダ・キムチ・ナムル",
    title: "サラダ・キムチ・ナムルメニュー",
    cardPhoto: img("menu_cat_salad"),
    items: [
      { name: "チョレギサラダ", desc: "ごま油香るやみつきサラダ。", price: 680, photo: img("menu_cat_salad") },
      { name: "海藻サラダ", desc: "さっぱりヘルシーな箸休めに。", price: 580, photo: img("menu_cat_salad") },
      { name: "白菜キムチ", desc: "自家製の本格キムチ。", price: 480, photo: img("menu_cat_salad") },
    ],
  },
  {
    slug: "toributa",
    name: "鶏・豚・海鮮",
    title: "鶏・豚・海鮮メニュー",
    cardPhoto: img("menu_cat_toributa"),
    items: [
      { name: "鶏もも", desc: "弾力のある国産鶏もも。", price: 780, photo: img("menu_cat_toributa") },
      { name: "豚カルビ", desc: "脂の甘みが楽しめる豚カルビ。", price: 880, photo: img("menu_cat_toributa") },
      { name: "エビ", desc: "プリッと甘い殻付きエビ。", price: 980, photo: img("menu_cat_toributa") },
      { name: "イカ", desc: "香ばしく焼き上げるイカ。", price: 780, photo: img("menu_cat_toributa") },
    ],
  },
  {
    slug: "soup",
    name: "スープ",
    title: "スープメニュー",
    cardPhoto: img("menu_cat_soup"),
    items: [
      { name: "わかめスープ", desc: "やさしい味わいの定番スープ。", price: 480, photo: img("menu_cat_soup") },
      { name: "コムタンスープ", desc: "じっくり煮込んだ白濁スープ。", price: 880, photo: img("menu_cat_soup") },
      { name: "ユッケジャンスープ", desc: "辛味と旨味のきいた人気スープ。", price: 980, photo: img("menu_cat_soup") },
    ],
  },
  {
    slug: "gohan",
    name: "ご飯もの",
    title: "ご飯ものメニュー",
    cardPhoto: img("menu_cat_gohan"),
    items: [
      { name: "白ご飯", desc: "ふっくら炊き上げたご飯。", price: 250, photo: img("menu_cat_gohan") },
      { name: "ビビンバ", desc: "野菜たっぷりの定番ビビンバ。", price: 880, photo: img("menu_cat_gohan") },
      { name: "石焼ビビンバ", desc: "アツアツのおこげが香ばしい。", price: 980, photo: img("menu_cat_gohan") },
      { name: "クッパ", desc: "あったかスープご飯。", price: 880, photo: img("menu_cat_gohan") },
    ],
  },
  {
    slug: "men",
    name: "麺類",
    title: "麺類メニュー",
    cardPhoto: img("menu_cat_men"),
    items: [
      { name: "冷麺", desc: "のど越しのよい本格冷麺。", price: 880, photo: img("menu_cat_men") },
      { name: "温麺", desc: "やさしい味わいの温かい麺。", price: 880, photo: img("menu_cat_men") },
      { name: "ビビン麺", desc: "甘辛ダレが食欲をそそる。", price: 880, photo: img("menu_cat_men") },
    ],
  },
  {
    slug: "dessert",
    name: "デザート",
    title: "デザートメニュー",
    cardPhoto: img("menu_cat_dessert"),
    items: [
      { name: "バニラアイス", desc: "食後にうれしい定番アイス。", price: 380, photo: img("menu_cat_dessert") },
      { name: "シャーベット", desc: "さっぱり口直しのシャーベット。", price: 380, photo: img("menu_cat_dessert") },
      { name: "杏仁豆腐", desc: "なめらかでやさしい甘さ。", price: 480, photo: img("menu_cat_dessert") },
    ],
  },
];

export function getMenuCategory(slug: string): MenuCategory | undefined {
  return MENU_CATEGORIES.find((c) => c.slug === slug);
}

/** 指定店舗のメニュー品目を返す（店舗別データが無ければ既定 items にフォールバック）。 */
export function getMenuItems(category: MenuCategory, storeId: string): MenuItem[] {
  return category.itemsByStore?.[storeId] ?? category.items;
}

// カテゴリページ下部の3バナー（ランチ/テイクアウト/コース）。
export type MenuPromo = {
  en: string;
  title: string;
  desc: string;
  photo: string;
  href: string;
};

/* ══════════ ランチメニュー（/menu/lunch・Figma 2109:25） ══════════ */
export const LUNCH_ITEMS: MenuItem[] = [
  { name: "特選焼肉ランチ", desc: "脂の旨い国産牛カルビは焼肉の王様です。", price: 2948, photo: img("menu_lunch_tokusen") },
  { name: "上焼肉重", desc: "柔らかい牛バラ肉を、秘伝のタレを加えた甘辛ダレでさっと焼き上げました。", price: 1848, photo: img("menu_lunch_jyu") },
  { name: "焼肉重", desc: "オススメメニュー！特製の甘辛ダレが食欲をそそります。", price: 1738, photo: img("menu_lunch_yakinikujyu") },
  { name: "豆腐チゲ", desc: "旨辛スープにとろ〜り豆腐が入った熱々のチゲが味わえます。", price: 1089, photo: img("menu_lunch_chige") },
  { name: "ハンバーグ定食", desc: "こだわりの手捏ねハンバーグを定食スタイルでお楽しみいただけます。", price: 1580, photo: img("menu_lunch_hamburg") },
  { name: "石焼ピビンパ", desc: "自家製ナムルとおこげが美味しい熱々石焼ピビンパ。", price: 1320, photo: img("menu_lunch_bibimba") },
];

/* ══════════ コースメニュー（/menu/course・Figma 2109:243） ══════════ */
export type CourseItem = {
  label: string; // 上部の小見出し
  title: string;
  price: string; // 「¥8,500〜」表記
  desc: string;
  photo: string;
  withRice?: boolean; // 「飯物付き」ラベルを表示するか（DB courses.with_rice）
};

export const COURSES: CourseItem[] = [
  {
    label: "前菜からデザートまで",
    title: "フルコース",
    price: "¥8,500〜",
    desc: "華やかで充実した料理内容で、少し改まった席や女性の多い宴会などにおすすめします。",
    photo: img("menu_course_full"),
  },
  {
    label: "お肉と野菜をご用意",
    title: "焼き肉と野菜の盛り合わせ",
    price: "¥4,950〜",
    desc: "ご飯ものやデザートは自由に選びたいという方へ。焼肉・焼き野菜・サラダのみのコースです。ご飯ものやデザートはお好きなものをお選びください。",
    photo: img("menu_course_yasai"),
  },
  {
    label: "すべてセットになった安心コース",
    title: "飲み放題付 ポッキリ宴会",
    price: "¥8,500〜",
    desc: "華やかで充実した料理内容で、少し改まった席や女性の多い宴会などにおすすめします。",
    photo: img("menu_course_nomi"),
  },
];

export const COURSE_NOTES: string[] = [
  "宴会料理は4名様より承ります。",
  "キャンセル及び人数の変更は前日までにお願いいたします。",
  "前日までのご予約とさせていただきます。",
  "当日のキャンセルはご予約時のお料理代金100％を申し受けます。",
];

// 店舗別の注記上書き（ゆらののみ内容が異なる。未設定の店舗は COURSE_NOTES を使用）
const COURSE_NOTES_BY_STORE: Record<string, string[]> = {
  yurano: [
    "宴会料理は4名様より承ります。",
    "前日までのご予約とさせていただきます。",
    "キャンセル及び人数の変更は前日までにお願いいたします。",
    "当日のキャンセルはキャンセル料を申し受けます。",
    "飲み放題は4名様以上から承ります。",
  ],
};

export function getCourseNotes(storeId: string): string[] {
  return COURSE_NOTES_BY_STORE[storeId] ?? COURSE_NOTES;
}

/* ══════════ 2時間飲み放題プラン（/menu/course・指定カテゴリ選択時のみ注意書きの上に表示） ══════════ */
export type DrinkPlan = { name: string; price: string; desc: string };
export const DRINK_PLAN_TITLE = "2時間飲み放題プラン";
export const DRINK_PLANS: DrinkPlan[] = [
  {
    name: "標準プラン",
    price: "2,750円",
    desc: "瓶ビール・焼酎・チューハイ・日本酒・カクテル\n果実酒・ハイボール・マッコリ・ソフトドリンク",
  },
  { name: "生ビール付きプラン", price: "3,300円", desc: "上記内容プラス生ビール" },
];
// 飲み放題プランを表示するコースカテゴリの slug（カテゴリ管理で slug を変える場合はここも更新）。
export const DRINK_PLAN_CATEGORY_SLUGS = ["full", "moriawase"];

/* ══════════ ポッキリ宴会オプション（/menu/course・ポッキリ宴会カテゴリ選択時のみ注意書きの上に表示） ══════════ */
export const POKKIRI_OPTION = {
  title: "ポッキリ宴会オプション",
  price: "＋550円",
  priceSuffix: "で",
  desc: "生ビール付飲み放題に変更 OK!!",
};
// ポッキリ宴会オプションを表示するコースカテゴリの slug。
export const POKKIRI_OPTION_CATEGORY_SLUGS = ["enkai"];

// ポッキリ宴会の案内（マイクロバス送迎＋宴会注意事項）。enkai 選択時にオプションと併せて表示。
export const ENKAI_INFO = {
  headline: "8名様よりマイクロバス送迎あります。",
  headlineSub: "一部有料エリア",
  notes: [
    "宴会料理は4名様以上より承ります。",
    "前日までにご予約ください。",
    "飲み放題は2時間以内です。",
  ],
};

/* ══════════ テイクアウトメニュー（/menu/takeout・Figma 2020:488） ══════════ */
export type TakeoutMenuTab = { slug: string; name: string; items: MenuItem[] };

// 「焼肉弁当」のみ Figma 実データ。他カテゴリは仮の品目（写真は弁当6点を流用）。
export const TAKEOUT_MENU_TABS: TakeoutMenuTab[] = [
  {
    slug: "bento",
    name: "焼肉弁当",
    items: [
      { name: "焼肉弁当", desc: "脂の旨い国産牛カルビは焼肉の王様です。", price: 1700, photo: img("menu_to_yakiniku") },
      { name: "カルビ弁当", desc: "脂の旨い国産牛カルビは焼肉の王様です。", price: 2000, photo: img("menu_to_karubi") },
      { name: "タン塩弁当", desc: "ジューシーなタンの旨みとさっぱりとした塩ダレの組み合わせが絶品。", price: 2000, photo: img("menu_to_tanshio") },
      { name: "ステーキ弁当", desc: "赤身の旨みが際立つやわらかなステーキ肉を使用。", price: 2800, photo: img("menu_to_steak") },
      { name: "特選焼肉丼", desc: "赤身の旨みが際立つやわらかなお肉をたっぷりと。", price: 1800, photo: img("menu_to_don") },
      { name: "野菜サラダ", desc: "平壌亭オリジナルドレッシングのさっぱりサラダ。", price: 800, photo: img("menu_to_salad") },
      { name: "たまごスープ", desc: "ごま油香る卵とわかめのふんわりスープ。", price: 594, photo: img("menu_to_soup") },
    ],
  },
  {
    slug: "sozai",
    name: "お惣菜",
    items: [
      { name: "ナムル三種盛り", desc: "彩り豊かな自家製ナムル。", price: 480, photo: img("menu_to_salad") },
      { name: "キムチ盛り合わせ", desc: "本格自家製キムチの盛り合わせ。", price: 580, photo: img("menu_to_soup") },
      { name: "チャプチェ", desc: "甘辛い味付けの春雨炒め。", price: 680, photo: img("menu_to_salad") },
    ],
  },
  {
    slug: "set",
    name: "お家で焼肉セット",
    items: [
      { name: "お家で焼肉セット（2人前）", desc: "ご家庭で本格焼肉をお楽しみいただけます。", price: 3980, photo: img("menu_to_yakiniku") },
      { name: "上焼肉セット（2人前）", desc: "厳選した上質な部位の詰め合わせ。", price: 5800, photo: img("menu_to_karubi") },
      { name: "ファミリー焼肉セット", desc: "ご家族でたっぷり楽しめるボリューム。", price: 6800, photo: img("menu_to_steak") },
    ],
  },
  {
    slug: "bbq",
    name: "BBQセット",
    items: [
      { name: "BBQセット（3〜4人前）", desc: "屋外バーベキューに最適な詰め合わせ。", price: 5980, photo: img("menu_to_yakiniku") },
      { name: "大人数BBQセット（6〜8人前）", desc: "大人数の集まりにおすすめ。", price: 9800, photo: img("menu_to_karubi") },
    ],
  },
  {
    slug: "gohan",
    name: "ご飯物・一品料理",
    items: [
      { name: "焼肉丼", desc: "甘辛ダレの焼肉をご飯にのせて。", price: 1200, photo: img("menu_to_don") },
      { name: "クッパ", desc: "あったかスープご飯。", price: 880, photo: img("menu_to_soup") },
      { name: "ビビンバ", desc: "野菜たっぷりの定番ビビンバ。", price: 880, photo: img("menu_to_salad") },
    ],
  },
  {
    slug: "tanpin",
    name: "焼肉単品",
    items: [
      { name: "カルビ（100g）", desc: "脂の旨い国産牛カルビ。", price: 980, photo: img("menu_to_karubi") },
      { name: "ハラミ（100g）", desc: "旨味の強い人気のハラミ。", price: 980, photo: img("menu_to_yakiniku") },
      { name: "上タン（100g）", desc: "厚切りの上タンを塩で。", price: 1480, photo: img("menu_to_tanshio") },
    ],
  },
  {
    slug: "moriawase",
    name: "焼肉盛合わせ",
    items: [
      { name: "焼肉盛合わせ（2人前）", desc: "人気部位を少しずつ盛り合わせ。", price: 3200, photo: img("menu_to_steak") },
      { name: "上盛合わせ（2人前）", desc: "上質な部位を贅沢に盛り合わせ。", price: 4800, photo: img("menu_to_karubi") },
    ],
  },
];

export const TAKEOUT_MENU_NOTE = {
  title: "お店の味をご家庭でも楽しめます！",
  lines: [
    "ご注文されてから商品のお渡しまでに、最短でも60分頂戴しております。",
    "お急ぎの方は直接お電話でご注文ください。",
  ],
  reserveTitle: "予約に関する注意事項",
  reserveNotes: [
    ["予約受付締切", "1時間前まで"],
    ["キャンセル締切", "4時間前まで"],
  ] as [string, string][],
};

export const TAKEOUT_MENU_CONTACT = {
  tel: "0771-00-0000",
  telHours: "受付時間：11:00〜21:00　※火曜定休",
  onlineHours: "24時間予約受付中",
};

/* ══════════ 店舗別メニュー（デモ仮データ・実メニュー確定後に差替） ══════════ */
// メニューは店舗ごとに変わる想定。亀岡店（既定）は上記データ、他4店は下記で上書き。
// 未指定の店舗は既定データにフォールバックする。

// ─── ランチ 店舗別 ───
export const LUNCH_ITEMS_BY_STORE: Partial<Record<string, MenuItem[]>> = {
  sonobe: [
    { name: "園部ランチセット", desc: "園部店人気No.1の焼肉ランチ。", price: 1480, photo: img("menu_lunch_tokusen") },
    { name: "上焼肉重", desc: "柔らかい牛バラ肉を甘辛ダレで。", price: 1848, photo: img("menu_lunch_jyu") },
    { name: "カルビ丼", desc: "特製ダレのカルビをご飯にのせて。", price: 1380, photo: img("menu_lunch_yakinikujyu") },
    { name: "豆腐チゲ定食", desc: "旨辛スープの豆腐チゲ定食。", price: 1180, photo: img("menu_lunch_chige") },
  ],
  fukuchiyama: [
    { name: "黒毛和牛ランチ", desc: "福知山店自慢の黒毛和牛ランチ。", price: 2480, photo: img("menu_lunch_tokusen") },
    { name: "焼肉重", desc: "特製の甘辛ダレが食欲をそそります。", price: 1738, photo: img("menu_lunch_yakinikujyu") },
    { name: "ハンバーグ定食", desc: "こだわりの手捏ねハンバーグ。", price: 1580, photo: img("menu_lunch_hamburg") },
    { name: "石焼ピビンパ", desc: "おこげが香ばしい石焼ピビンパ。", price: 1320, photo: img("menu_lunch_bibimba") },
  ],
  yurano: [
    { name: "ゆらの名物ランチ", desc: "焼肉ゆらの名物の焼肉ランチ。", price: 1680, photo: img("menu_lunch_tokusen") },
    { name: "上焼肉重", desc: "贅沢な上バラ肉を甘辛ダレで。", price: 1980, photo: img("menu_lunch_jyu") },
    { name: "焼肉重", desc: "特製ダレの焼肉重。", price: 1738, photo: img("menu_lunch_yakinikujyu") },
    { name: "豆腐チゲ", desc: "とろ〜り豆腐の熱々チゲ。", price: 1089, photo: img("menu_lunch_chige") },
    { name: "石焼ピビンパ", desc: "自家製ナムルとおこげが美味。", price: 1380, photo: img("menu_lunch_bibimba") },
  ],
  heijohtei: [
    { name: "特選ランチ", desc: "厳選した上質なお肉の特選ランチ。", price: 2980, photo: img("menu_lunch_tokusen") },
    { name: "ハンバーグ定食", desc: "手捏ねハンバーグを定食で。", price: 1580, photo: img("menu_lunch_hamburg") },
    { name: "カルビ丼", desc: "甘辛ダレのカルビ丼。", price: 1480, photo: img("menu_lunch_yakinikujyu") },
  ],
};

export function getLunchItems(storeId: string): MenuItem[] {
  return LUNCH_ITEMS_BY_STORE[storeId] ?? LUNCH_ITEMS;
}

// ─── コース 店舗別 ───
export const COURSES_BY_STORE: Partial<Record<string, CourseItem[]>> = {
  sonobe: [
    { label: "前菜からデザートまで", title: "園部スタンダードコース", price: "¥7,800〜", desc: "充実した料理内容で、各種ご宴会におすすめのコースです。", photo: img("menu_course_full") },
    { label: "お肉と野菜をご用意", title: "焼き肉と野菜の盛り合わせ", price: "¥4,500〜", desc: "焼肉・焼き野菜・サラダのみのお手軽コース。ご飯ものはお好みで。", photo: img("menu_course_yasai") },
    { label: "すべてセットになった安心コース", title: "飲み放題付 宴会コース", price: "¥7,800〜", desc: "飲み放題付きで気軽に楽しめる宴会コースです。", photo: img("menu_course_nomi") },
  ],
  fukuchiyama: [
    { label: "黒毛和牛を堪能", title: "黒毛和牛フルコース", price: "¥9,800〜", desc: "福知山店こだわりの黒毛和牛を心ゆくまでご堪能いただけます。", photo: img("menu_course_full") },
    { label: "お肉と野菜をご用意", title: "焼き肉と野菜の盛り合わせ", price: "¥5,200〜", desc: "厳選したお肉と季節の野菜をご用意したコースです。", photo: img("menu_course_yasai") },
    { label: "すべてセットになった安心コース", title: "飲み放題付 プレミアム宴会", price: "¥9,800〜", desc: "目利きの和牛と飲み放題で、特別なひとときを。", photo: img("menu_course_nomi") },
  ],
  yurano: [
    { label: "前菜からデザートまで", title: "ゆらの満喫フルコース", price: "¥8,000〜", desc: "焼肉ゆらの自慢の料理を一通り楽しめる満喫コース。", photo: img("menu_course_full") },
    { label: "お肉と野菜をご用意", title: "焼き肉と野菜の盛り合わせ", price: "¥4,800〜", desc: "焼肉と焼き野菜をたっぷりと。ご飯ものはお好みで。", photo: img("menu_course_yasai") },
    { label: "すべてセットになった安心コース", title: "飲み放題付 ポッキリ宴会", price: "¥8,000〜", desc: "飲み放題付きでお会計も安心のポッキリ宴会コース。", photo: img("menu_course_nomi") },
  ],
  heijohtei: [
    { label: "前菜からデザートまで", title: "特選フルコース", price: "¥10,000〜", desc: "最上級のお肉と一品料理を贅沢に揃えた特選コースです。", photo: img("menu_course_full") },
    { label: "お肉と野菜をご用意", title: "焼き肉と野菜の盛り合わせ", price: "¥5,500〜", desc: "上質なお肉と彩り野菜の盛り合わせコース。", photo: img("menu_course_yasai") },
    { label: "すべてセットになった安心コース", title: "飲み放題付 特選宴会", price: "¥10,000〜", desc: "特別な席にふさわしい飲み放題付の特選宴会コース。", photo: img("menu_course_nomi") },
  ],
};

export function getCourses(storeId: string): CourseItem[] {
  return COURSES_BY_STORE[storeId] ?? COURSES;
}

// ─── テイクアウト 店舗別（「焼肉弁当」タブの品目を店舗別に上書き・他タブは共通） ───
export const TAKEOUT_ITEMS_BY_STORE: Partial<Record<string, Partial<Record<string, MenuItem[]>>>> = {
  sonobe: {
    bento: [
      { name: "園部焼肉弁当", desc: "園部店人気の焼肉弁当。", price: 1600, photo: img("menu_to_yakiniku") },
      { name: "カルビ弁当", desc: "脂の旨い国産牛カルビ。", price: 1900, photo: img("menu_to_karubi") },
      { name: "タン塩弁当", desc: "さっぱり塩ダレのタン塩弁当。", price: 1900, photo: img("menu_to_tanshio") },
      { name: "野菜サラダ", desc: "オリジナルドレッシングのサラダ。", price: 780, photo: img("menu_to_salad") },
    ],
  },
  fukuchiyama: {
    bento: [
      { name: "黒毛和牛弁当", desc: "福知山店自慢の黒毛和牛弁当。", price: 2400, photo: img("menu_to_karubi") },
      { name: "ステーキ弁当", desc: "やわらかなステーキ肉を使用。", price: 3000, photo: img("menu_to_steak") },
      { name: "特選焼肉丼", desc: "赤身の旨みをたっぷりと。", price: 1900, photo: img("menu_to_don") },
      { name: "たまごスープ", desc: "ふんわり卵とわかめのスープ。", price: 594, photo: img("menu_to_soup") },
    ],
  },
  yurano: {
    bento: [
      { name: "ゆらの名物弁当", desc: "焼肉ゆらの名物の焼肉弁当。", price: 1700, photo: img("menu_to_yakiniku") },
      { name: "カルビ弁当", desc: "甘辛ダレのカルビ弁当。", price: 2000, photo: img("menu_to_karubi") },
      { name: "タン塩弁当", desc: "歯ごたえ抜群のタン塩弁当。", price: 2000, photo: img("menu_to_tanshio") },
      { name: "特選焼肉丼", desc: "ボリューム満点の焼肉丼。", price: 1800, photo: img("menu_to_don") },
      { name: "野菜サラダ", desc: "さっぱりヘルシーなサラダ。", price: 800, photo: img("menu_to_salad") },
    ],
  },
  heijohtei: {
    bento: [
      { name: "特選焼肉弁当", desc: "厳選した上質なお肉の弁当。", price: 2200, photo: img("menu_to_yakiniku") },
      { name: "ステーキ弁当", desc: "贅沢なステーキ弁当。", price: 3200, photo: img("menu_to_steak") },
      { name: "カルビ弁当", desc: "熟成カルビの弁当。", price: 2200, photo: img("menu_to_karubi") },
    ],
  },
};

export function getTakeoutTabs(storeId: string): TakeoutMenuTab[] {
  const override = TAKEOUT_ITEMS_BY_STORE[storeId];
  if (!override) return TAKEOUT_MENU_TABS;
  return TAKEOUT_MENU_TABS.map((t) => (override[t.slug] ? { ...t, items: override[t.slug]! } : t));
}
