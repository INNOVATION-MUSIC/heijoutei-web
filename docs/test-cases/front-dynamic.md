# フロント動的化 テストケース（FRONT）

対象: `/news`・`/news/[id]`・トップ NewsSection・`/store`・`/store/[id]`・`/recruit`・`/recruit/[id]`・`/menu` 系（`/menu`・`/menu/[category]`・`/menu/lunch`・`/menu/course`・`/menu/takeout`）・`/takeout` 注文フロー。

関連コード:
- `src/app/lib/newsDb.ts`・`storeDb.ts`・`storeListDb.ts`・`recruitDb.ts`・`menuDb.ts`・`courseDb.ts`・`menuTakeoutDb.ts`・`takeoutOrderDb.ts`
- `src/lib/supabase/static.ts`（`createStaticClient` — anon・SELECT 用）
- 各フロントページ `export const revalidate = 60`

共通設計（全ページ共通パターン）:
- フェッチャは `createStaticClient` で SELECT → DB が空/エラー/例外時は **静的データへフォールバック**（try/catch で安全動作）。
- サーバーページで prefetch → クライアントに任意 props 注入（店舗切替等はクライアント側のまま）→ 表示コンポーネントは無改変。
- **レイアウト/URL は据え置き**。ISR `revalidate=60`、管理更新時は `revalidatePath` で即時クリア。
- 公開条件（RLS）: news/recruit は `is_published=true`、stores/courses/categories/menus は `is_active=true`。news は `published_at <= now()` も条件。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| FRONT-001 | お知らせ一覧の DB 描画 | news に公開記事複数 | `/news` を開く | DB の公開記事が新しい順で描画される（`fetchNewsList`） | 高 |
| FRONT-002 | お知らせ詳細（slug） | 公開記事 | `/news/<slug>` を開く | DB の本文（TipTap HTML）がそのまま描画される | 高 |
| FRONT-003 | 予約公開が未来は非表示 | `published_at` が未来の公開記事 | `/news` を開く | `published_at <= now()` 条件で当該記事は表示されない | 高 |
| FRONT-004 | 下書きは非表示 | 下書き記事 | `/news` `/news/<slug>` を開く | 一覧・詳細とも表示されない（`is_published=true` 条件） | 高 |
| FRONT-005 | トップ News カルーセル | news に公開記事 | トップ `/` を開く | 最新数件が NewsSection（PC/SP）に描画される（`fetchTopNews`） | 中 |
| FRONT-006 | 店舗一覧の DB 描画 | stores に is_active 複数 | `/store` を開く | is_active=true の店舗が sort_order 順で描画 | 高 |
| FRONT-007 | 非公開店舗の除外 | is_active=false の店舗 | `/store` を開く | 当該店舗が一覧に出ない | 高 |
| FRONT-008 | 店舗詳細 | 店舗あり | `/store/<slug>` を開く | DB の店舗情報・LINE ID・Google Map URL 等が描画 | 高 |
| FRONT-009 | 採用一覧/詳細 | recruit 公開あり | `/recruit`・`/recruit/<id>` を開く | 公開求人とタグ/募集要項が描画される | 高 |
| FRONT-010 | メニューカテゴリ一覧 | menu_categories あり | `/menu` を開く | カテゴリグリッド + 誘導バナー（ランチ/テイクアウト/コース）が描画 | 高 |
| FRONT-011 | カテゴリ詳細 | store_menus/menu_items あり | `/menu/<category>` を開く | 該当カテゴリの項目が描画される | 高 |
| FRONT-012 | ランチ/コース/テイクアウト閲覧 | 各データあり | `/menu/lunch`・`/menu/course`・`/menu/takeout` を開く | それぞれの DB データが描画される | 高 |
| FRONT-013 | 店舗別メニュー切替 | 複数店舗にメニュー | メニュー画面で店舗タブ/select を切替 | 同カテゴリで店舗別の内容に切替わる（リロードなし・`?store=` 更新） | 高 |
| FRONT-014 | テイクアウト注文フロー（店舗/メニュー） | takeout メニューあり | `/takeout` を開き店舗・メニューを選択 | DB の店舗 select・メニューが描画される（`takeoutOrderDb`） | 高 |
| FRONT-015 | ISR revalidate=60 | フロント各ページ | ページソース/挙動を確認 | 各ページに `revalidate=60` が設定され、最大60秒で再生成される | 中 |
| FRONT-016 | revalidatePath 即時反映 | 管理画面でデータ更新 | 該当データを更新後フロントを再読込 | `revalidatePath` 対象ページが即時で最新化される | 高 |
| FRONT-017 | URL 据え置き | — | 各フロント URL を確認 | 動的化後も URL は従来どおり（`/news`/`/store`/`/menu` 等） | 中 |

## 回帰テスト（フォールバック等）

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 | 備考 |
|----|-----------|----------|----------|----------|--------|------|
| FRONT-REG-001 | DB 空時の静的フォールバック（一覧） | 対象テーブルが空 or 取得失敗 | `/news`（`/store`/`/recruit`/`/menu` 同様）を開く | クエリ結果が 0 件/エラー時に静的データ（`NEWS_LIST_DATA` 等）へフォールバックし、ページが壊れず描画される | 高 | ミスリスト 2026-06-11。各 `xxxDb.ts` の try/catch・空判定 |
| FRONT-REG-002 | DB 空時のトップ News フォールバック | news が空 | トップ `/` を開く | `NEWS_DATA`（静的）へフォールバックして NewsSection が描画される | 高 | ミスリスト 2026-06-11 |
| FRONT-REG-003 | 詳細フォールバック（未存在/例外） | DB 取得失敗 | `/news/<id>` を開く | 静的 `NEWS_LIST_DATA` から id 一致を返す（無ければ undefined） | 中 | ミスリスト 2026-06-11 |
| FRONT-REG-004 | generateStaticParams のフォールバック | news が空 | ビルド時 | DB 空なら静的 id 一覧で SSG（`fetchNewsParams`） | 中 | ミスリスト 2026-06-11 |
| FRONT-REG-005 | レイアウト無変更 | DB 連携後 | 各フロントページを表示 | 既存デザイン/レイアウトが変わっていない（データ取得のみ切替） | 高 | ミスリスト 2026-06-11 |

---

## 追加連動（2026-06-11 後続セッション・据え置き分のうち SP 実装以外を消化）

作成当初「据え置き（未解決）」だった以下のフロント連動を実装したため追記。いずれも「デザイン不変の任意 prop 注入＋DB 空フォールバック」パターン。

関連コード:
- 受付枠カレンダー: `takeoutOrderDb.fetchTakeoutSlots()` ＋ `takeoutData.buildCalendar(y,m,today,slots?)` ＋ `TakeoutClient`(`slotsByStore`)・`Step1DateTime`(`timeSlots`)
- 営業カレンダー: `businessCalendarDb.fetchBusinessCalendar()` ＋ `CalendarSection`/`CalendarSectionSP`(`months`) ＋ `ResponsivePage`(`businessMonths`)
- トップコース: `courseDb.fetchTopCourses()` ＋ `CourseSection`/`CourseSectionSP`(`courses`)
- テイクアウト注文の店舗別メニュー: `takeoutOrderDb.fetchTakeoutMenuByStore()` ＋ `TakeoutClient`(`menuByStore`)

### テイクアウト受付枠カレンダー連動（ハイブリッド）

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| FRONT-018 | DB に枠がある日は DB 優先 | `takeout_slots`/`takeout_slot_times` に当該店・日付の枠（受付・時間枠）あり | `/takeout` Step1 で店舗選択しカレンダー確認 | DB 枠のある日は DB の受付可否で表示（例: 火曜でも開放設定なら予約可） | 高 |
| FRONT-019 | 休止日（is_closed） | `is_closed=true` の日 | カレンダー確認 | 当該日は「定休/予約不可」で選択不可 | 高 |
| FRONT-020 | 枠が無い日はアルゴリズム既定 | 当該日に DB 枠なし | カレンダー確認 | 従来 `buildCalendar` 既定（火曜定休・土日わずか等）で表示 | 高 |
| FRONT-021 | DB 空でも注文不能化しない | `takeout_slots` 全空 | `/takeout` を開く | 全日アルゴリズム既定で予約可能日が残り、注文フローが成立（`fetchTakeoutSlots`→`{}`） | 高 |
| FRONT-022 | 受付時間枠の連動 | 選択日に DB 時間枠あり（一部 `is_active=false`） | 受取日を選択し時間枠を確認 | `is_active=true` の時間枠のみ表示（DB 枠の無い日は既定の全枠） | 中 |
| FRONT-023 | 予約可能期間ゲート維持 | DB 枠が 32 日以上先にある | カレンダー確認 | 本日〜31 日先の期間制限が優先され、期間外は予約不可 | 中 |
| FRONT-024 | 店舗切替で受取日時リセット | 受取日時選択後に店舗変更 | Step1 で店舗を変更 | 受取日・時間がリセットされ、新店舗の枠で再選択になる | 中 |

### 営業カレンダー（トップ Business days）連動

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| FRONT-025 | 当月+翌月の DB 描画 | `business_calendars` に当月/翌月データ（代表店=kameoka） | トップ `/` の Business days を確認 | 当月+翌月が表示され、DB の status で日付スタイルが切替（PC/SP 両方） | 高 |
| FRONT-026 | status 写像（2026-06-11 改定） | closed/special_closed/open(他) を設定 | カレンダー確認 | **closed=定休日(赤)**、**special_closed=臨時休業(橙・別表示)**、open 等それ以外=通常営業（無印・省略）。凡例は「定休日」「臨時休業」のみ（通常営業/ランチは削除済） | 高 |
| FRONT-027 | DB 空フォールバック | 当月/翌月に `business_calendars` データ無し | トップを開く | 従来の静的カレンダー（サンプル 5/6 月）にフォールバックし崩れない（`fetchBusinessCalendar`→`undefined`） | 高 |
| FRONT-028 | PC/SP 高さ不変 | 6 行になる月を含む | PC/SP でカレンダー表示 | ScaledSection 固定高に収まりレイアウトが崩れない（PC 枠 480/SP 1090） | 中 |
| FRONT-029 | 代表店 kameoka | 複数店に異なるカレンダー | トップを開く | トップの 1 カレンダーは kameoka 基準で表示（※全店共通/店舗別表示は運用未確定） | 低 |

### トップ コース DB 連動

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| FRONT-030 | テキスト DB 連動（画像据え置き） | `courses`(kameoka) に 3 件以上 | トップ `/` のコース節を確認 | 3 カードの名称/価格/サブ/説明が DB 値で描画。画像はローカル `course1/2/3.webp` のまま（PC/SP） | 高 |
| FRONT-031 | コース フォールバック | `courses` が 3 件未満/空 | トップを開く | 静的コピーにフォールバックし、レイアウト不変で描画（`fetchTopCourses`→`undefined`） | 中 |

### テイクアウト注文フローの店舗別メニュー

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| FRONT-032 | Step1 店舗→Step2 にその店舗メニュー | `store_takeout_menus` に店舗別データ | Step1 で園部を選び日時選択→Step2 へ | Step2 に園部の品目（例「園部焼肉弁当」）が表示される | 高 |
| FRONT-033 | 店舗変更でカート/カテゴリ/日時リセット | カート投入後に店舗変更 | Step1 で別店舗に変更 | カート・受取日時・選択カテゴリがリセットされる（店舗で品目 id が異なるため） | 高 |
| FRONT-034 | カテゴリは全店共通・品目のみ店舗別 | 複数店舗 | 店舗を切替 | カテゴリ一覧は全店共通で、品目のみ店舗別に変わる | 中 |
| FRONT-035 | 注文メニュー DB 空フォールバック | `store_takeout_menus` 空 or 品目 0 店 | `/takeout` を開く | 静的 `TAKEOUT_MENU` にフォールバックして注文可能 | 中 |

---

## NEW タグの自動化（2026-06-11）

設計メモ:
- NEW は **DB に持たせず**、`newsDb.toItem` で `published_at` が **14日以内なら先頭に自動付与**（`TWO_WEEKS_MS = 14*24*60*60*1000`）。
- DB に手動で付いた NEW ラベルは `filter` で除外（常に日時駆動）。
- NEW は **トップ NewsSection（カルーセル）専用**。`/news` 一覧・`/news/[id]` 詳細では `filter(t.label!=="NEW")` で非表示。
- ISR 60s のため、公開から 2 週間経過後は自動で NEW が消える。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| FRONT-036 | 公開2週間以内に NEW 自動付与 | `published_at` が本日〜13日前の公開記事 | トップ `/` の NewsSection を確認 | 当該記事に NEW バッジ（赤）が先頭に自動表示される | 高 |
| FRONT-037 | 2週間超で NEW 非表示 | `published_at` が15日以上前の記事 | トップを確認 | NEW バッジが付かない | 高 |
| FRONT-038 | 手動 NEW ラベルの除外 | DB の `news_tags` に手動で NEW を付与 | トップ/一覧を確認 | 手動 NEW は `filter` で除外され、表示有無は `published_at`（日時）だけで決まる | 中 |
| FRONT-039 | 一覧/詳細では NEW 非表示 | NEW 期間内の公開記事 | `/news`・`/news/<slug>` を開く | どちらにも NEW バッジが出ない（NEW はトップ専用） | 高 |
| FRONT-040 | ISR で NEW 自動消滅 | 公開からちょうど 2 週間を跨ぐ記事 | 期限後にトップを再生成（最大60秒）して確認 | NEW が自動で消える（手動操作不要） | 低 |

## トップページのリンク配線（2026-06-11）

設計メモ:
- トップ各ボタンの `href="#"` を `SECTION_LINKS` に配線（メニュー→`/menu`・ランチ→`/menu/lunch`・コース→`/menu/course`・オンラインショップ→`/online-shop`）。
- お知らせカード（PC `NewsSection`/SP `NewsSectionSP`）を `/news/[id]` に配線（`NewsItem` に `id`・`fetchTopNews` が `slug` 返却）。
- **残る `href="#"` は Hero の LINE 友だち追加ボタン（PC×4）のみ**（実 LINE URL 未提供のため・未解決項目）。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| FRONT-041 | セクションボタンの遷移 | — | トップのメニュー/ランチ/コース/オンラインショップの各ボタンを押下 | それぞれ `/menu`・`/menu/lunch`・`/menu/course`・`/online-shop` に遷移する（`#` で留まらない） | 高 |
| FRONT-042 | お知らせカードの遷移（PC） | トップに公開記事 | PC `NewsSection` のお知らせカードをクリック | `/news/<id>`（該当記事詳細）に遷移する | 高 |
| FRONT-043 | お知らせカードの遷移（SP） | トップに公開記事 | SP `NewsSectionSP` のお知らせカードをタップ | `/news/<id>` に遷移する（`<div>`→`<a>` 化済） | 中 |
| FRONT-044 | LINE ボタンは未配線（既知） | — | Hero の LINE 友だち追加ボタン（PC）を確認 | `href="#"` のまま（実 URL 未提供＝未解決項目）。誤遷移しないこと | 低 |
