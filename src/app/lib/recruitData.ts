// 採用情報データ一元管理（/recruit 一覧 ・ /recruit/[id] 詳細で共通）
// Figma「採用情報」2021:1059（一覧）/ 2021:1354（詳細）準拠。
// 現状の求人は全店「亀岡店」のため、給与・勤務地・待遇などは共通値を流用する。

export type RecruitTag = { label: string; color: string };

// タグ色（Figma: アルバイト/パート=#e18e3b・店舗=#16871d）
const TAG_ARUBAITO: RecruitTag = { label: "アルバイト", color: "#e18e3b" };
const TAG_PART: RecruitTag = { label: "パート", color: "#e18e3b" };
const tagStore = (label: string): RecruitTag => ({ label, color: "#16871d" });

export type RecruitRow = { label: string; value: string };

export type RecruitJob = {
  id: string;
  store: string; // 所属店舗（タブ絞り込み用・RECRUIT_STORE_TABS の値と一致）
  img: string; // 一覧カード写真 340×240
  heroImg?: string; // 詳細右上 500×500（未設定なら img にフォールバック）
  date: string;
  title: string;
  tags: RecruitTag[];
  summary: string[]; // 一覧カードの説明（1行目=職種・2行目=仕事内容）
  lead: string; // 詳細ページ導入文
  detail: RecruitRow[]; // 詳細ページの募集要項テーブル
  applyTel: string; // 応募電話番号
};

// 亀岡店 共通の募集要項（Figma 詳細「キッチンスタッフ」由来）
const KAMEOKA_TEL = "0771-23-8410";
const PAY = "時給 1,122円～　22：00以降 1,403円～ ※経験者優遇 がんばり次第で昇給あり";
const PLACE = "京都府亀岡市篠町浄法寺中村35－5 国道９号線頼政塚交差点付近 ★車・バイク通勤OK！";
const DAYS =
  "16：00～23：00の間で3時間以上できる方 ※土日のみの勤務大歓迎 シフト制　※週2日～の勤務ＯＫ！！ ★勤務シフトは相談に応じますので、お気軽にご相談ください。";
const QUALIFY = "経験・学歴不問！ ★未経験・バイトデビュー歓迎!! ★友達同士の応募ok!! ★経験者優遇!!";
const BENEFITS =
  "◆まかない補助あり ◆ユニフォーム貸与 ◆バイク・マイカー通勤可 ◆従業員割引（１０％off) ◆昇給あり ◆扶養内OK";

/** 募集要項テーブルを生成（職種・仕事内容のみ職種別、他は亀岡店共通） */
function rows(job: string, work: string): RecruitRow[] {
  return [
    { label: "職種", value: job },
    { label: "雇用形態", value: "アルバイト / パート" },
    { label: "仕事内容", value: work },
    { label: "給与", value: PAY },
    { label: "勤務地", value: PLACE },
    { label: "勤務曜日・時間", value: DAYS },
    { label: "資格・経験", value: QUALIFY },
    { label: "待遇", value: BENEFITS },
  ];
}

// 亀岡店 求人の共通リード（詳細デザインのない職種に使用）
const KAMEOKA_LEAD =
  "亀岡市篠町にある焼肉店です。 ほとんどがアルバイト未経験スタートでしたが、一人ひとり活躍できるまで丁寧にお教えするので安心です！ 同年代の仲間がいるから、皆で一緒に成長していけます。 「仕事は真剣に、遊ぶ時はとことん楽しむ」というメリハリのある環境で、就活や社会で活かせるマナーも身につきます。 週2日～、1日3ｈ～OK！シフトの融通も利くので、プライベートや学業と両立して働けます★";

export const RECRUIT_JOBS: RecruitJob[] = [
  {
    id: "1",
    store: "亀岡店",
    img: "/images/recruit_seiso_hd.webp",
    date: "2026.3.6",
    title: "焼肉店の清掃スタッフ募集！",
    tags: [TAG_ARUBAITO, TAG_PART, tagStore("亀岡店")],
    summary: [
      "職種：焼肉店の店内清掃",
      "仕事内容：店内清掃(客席の掃除・掃除機・モップ掛け）/ トイレ清掃・簡単な洗い物",
    ],
    lead: KAMEOKA_LEAD,
    detail: rows(
      "焼肉店の店内清掃スタッフ",
      "店内清掃（客席の掃除・掃除機・モップ掛け）/ トイレ清掃・簡単な洗い物などをお願いします。簡単なお仕事なのですぐに慣れていただけます。未経験者でも大丈夫。先輩が丁寧に指導してくれます。"
    ),
    applyTel: KAMEOKA_TEL,
  },
  {
    // ★Figma 詳細デザインのある職種（2021:1354）
    id: "2",
    store: "亀岡店",
    img: "/images/recruit_kitchen_hd.webp",
    heroImg: "/images/recruitdetail_hero_hd.webp",
    date: "2026.2.16",
    title: "1日3時間～焼肉店のキッチンスタッフ（簡単な調理補助のお仕事）募集！",
    tags: [TAG_ARUBAITO, TAG_PART, tagStore("亀岡店")],
    summary: [
      "職種：焼肉店のキッチンスタッフ（調補助）",
      "仕事内容：ピビンパやサラダの盛り付けなど簡単な調理を手伝っていただきます。慣れてくると簡単な野菜のカットもできるようになります。",
    ],
    lead: `亀岡市篠町にある焼肉店。
ほとんどがアルバイト未経験スタートでしたが、一人ひとり活躍できるまで丁寧にお教えするので安心です！
がっつり働きたいフリーターの方やＷワークの方も大歓迎です!
接客の仕事はありません。ホールからは見えない場所で作業します。♪
包丁の使い方はセンパイが一から教えてくれます。
同年代仲間がいるから、皆で一緒に成長していけます。
歓送迎会など、皆でご飯へ行く事も★
「仕事は真剣に、遊ぶ時はとことん楽しむ」という風にメリハリをつける事で、就活や社会で活かせるマナーも身につきます！

シフトサイクル……1週間
◆シフトは1週毎なのでスケジュール調整しやすい♪
テスト休みなどシフトのことは気軽に相談してください!!
もし、急に入れなくなった場合はできる限り事前に調整したいので、わかり次第ですぐに連絡してくださいね！
◆週2日～、1日3ｈ～OK！
「平日は授業後の18時～、土日は12時～」や「ガッツリ週5日×フルタイム」など、シフトの融通◎
プライベートや学業と両立して働けます★`,
    detail: rows(
      "焼肉店のキッチンスタッフ（調補助）",
      "ピビンパやサラダの盛り付けなど簡単な調理を手伝っていただきます。慣れてくると簡単な野菜のカットもできるようになります。 未経験者でも大丈夫。先輩が丁寧に指導してくれます。高校生・大学生・フリーターそれぞれ男女多数活躍中。"
    ),
    applyTel: KAMEOKA_TEL,
  },
  {
    id: "3",
    store: "亀岡店",
    img: "/images/recruit_hall_hd.webp",
    date: "2026.2.16",
    title: "焼肉店のホールスタッフ募集！",
    tags: [TAG_ARUBAITO, TAG_PART, tagStore("亀岡店")],
    summary: [
      "職種：焼肉店のホール接客係",
      "仕事内容：まずはお皿を並べたり、席の番号を覚えたり、簡単な仕事から始めていただきます。",
    ],
    lead: KAMEOKA_LEAD,
    detail: rows(
      "焼肉店のホール接客係",
      "まずはお皿を並べたり、席の番号を覚えたり、簡単な仕事から始めていただきます。慣れてくると次はいよいよ注文を聞いたり、料理の提供をします。 未経験者でも大丈夫！同世代の先輩が丁寧に指導してくれます！"
    ),
    applyTel: KAMEOKA_TEL,
  },
  {
    id: "4",
    store: "亀岡店",
    img: "/images/recruit_lunch_hd.webp",
    date: "2026.2.16",
    title: "焼肉店のランチ営業のキッチンスタッフ（調理補助）",
    tags: [TAG_ARUBAITO, TAG_PART, tagStore("亀岡店")],
    summary: [
      "職種：焼肉店のランチ営業スタッフ 調理補助",
      "仕事内容：ランチ営業のスタッフです。接客の仕事はありません。ホールからは見えない場所で作業します。",
    ],
    lead: KAMEOKA_LEAD,
    detail: rows(
      "焼肉店のランチ営業スタッフ 調理補助",
      "ランチ営業のスタッフです。接客の仕事はありません。ホールからは見えない場所で作業します。 お仕事の内容は、小鉢や石焼ピビンパを盛りつけたり、お野菜のカットなど軽作業メイン。簡単な仕事内容なのですぐになれます。未経験者でも大丈夫。社員スタッフが丁寧に指導します。"
    ),
    applyTel: KAMEOKA_TEL,
  },
];

/** 採用情報の店舗タブ（Figma: 亀岡店がアクティブ） */
export const RECRUIT_STORE_TABS = ["亀岡店", "園部店", "福知山店", "焼肉 ゆらの", "ヘイジョウテイ"] as const;

/** id から求人を取得（無ければ undefined） */
export function getRecruitJob(id: string): RecruitJob | undefined {
  return RECRUIT_JOBS.find((j) => j.id === id);
}

/** 詳細ページ右上 500×500 画像（未設定なら一覧画像にフォールバック） */
export function recruitHero(j: RecruitJob): string {
  return j.heroImg ?? j.img;
}
