# フロント動的化 テストケース（FRONT）

対象: `/news`・`/news/[id]`・トップ NewsSection・`/store`・`/store/[id]`・`/recruit`・`/recruit/[id]`・`/menu` 系（`/menu`・`/menu/[category]`・`/menu/lunch`・`/menu/course`・`/menu/takeout`）・`/takeout` 注文フロー・`/contact` お問い合わせフロー（PC/SP）。

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

## お問い合わせフロー（/contact・PC/SP）（2026-06-24）

対象: `/contact` の入力 → 確認 → 完了の 3 ステップフロー。`useIsMobile()` で PC（設計幅1440・`contact/ContactForm`/`ContactConfirm`/`ContactComplete`）と SP（設計幅390・`sp/ContactSP` の `ContactFormSP`/`ContactConfirmSP`/`ContactCompleteSP`）を切替。

関連コード:
- `src/app/components/ContactClient.tsx`（PC/SP 分岐・フォーム状態の一元管理・`/api/contact` 送信ロジック共通）
- `src/app/components/sp/ContactSP.tsx`（SP 3 ステップ。`SectionShell` がヘッダースペーサー153px + ResizeObserver で実測高さ確定）
- `src/app/components/contact/ContactForm.tsx`・`ContactConfirm.tsx`・`ContactComplete.tsx`（PC 3 ステップ）
- 共通: `src/app/lib/useIsMobile.ts`・`SpStickyHeader`・`HamburgerMenuSP`・`FooterSP`・`ReserveModal`・`Turnstile`

設計メモ:
- フォーム状態（`name`/`kana`/`email`/`emailConfirm`/`phone`/`inquiryType`/`store`/`message`/`agreed`）・送信処理（`handleConfirm` → `POST /api/contact`）・ステップ遷移（`goStep`）は PC/SP 共通。`goStep` でページ先頭へスクロールし実測値をリセット。
- 入力フォームの「確認画面へ進む」活性条件（`valid`）: 氏名・フリガナ・メール・メール確認が一致（`emailMatch`）かつ同意チェック ON。電話番号・お問合せ内容は任意。
- API 検証・DB INSERT・メール送信は **API-CNT-001〜009** を参照（本節は UI フロー観点）。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| FRONT-045 | PC/SP 表示切替 | — | `/contact` を PC 幅（≧1024px）と SP 幅（<1024px）で開く | PC は 1440 設計・SP は 390 設計のレイアウトで描画される（`useIsMobile` 判定。判定確定前は黒画面プレースホルダ） | 高 |
| FRONT-046 | SP 入力フォーム描画 | SP 幅 | `/contact`（ステップ1）を開く | ヒーロー(351×130)＋「お問合せ/Contact」見出し＋各入力欄（氏名/フリガナ/メール/メール確認/電話/種別/店舗/内容）＋同意チェック＋「確認画面へ進む」が全 flexbox で縦に並ぶ | 高 |
| FRONT-047 | SP 必須項目バリデーション | SP ステップ1 | 氏名・フリガナ・メールのいずれかを空のまま操作 | 「確認画面へ進む」ボタンが非活性（`disabled`）のまま。全必須＋一致＋同意が揃うと活性化 | 高 |
| FRONT-048 | SP メール一致チェック | SP ステップ1 | メールと確認メールに異なる値を入力 | 確認欄下に「メールアドレスが一致しません」（赤）が表示され、ボタンは非活性。一致させると注意文が消える | 高 |
| FRONT-049 | SP 同意チェックでボタン活性 | SP ステップ1・必須＋メール一致済 | 「プライバシーポリシーに同意する」を ON/OFF | ON でボタン活性・OFF で非活性に切替わる | 高 |
| FRONT-050 | SP 確認画面の内容表示 | SP ステップ1 で入力済 | 「確認画面へ進む」を押下 | ステップ2 に遷移し、入力値（氏名/フリガナ/メール/電話/種別/店舗/内容）がカードに表示される。未入力の任意項目は「—」表示 | 高 |
| FRONT-051 | SP 入力画面へ戻る | SP ステップ2 | 「入力画面へ戻る」を押下 | ステップ1 に戻り、入力済みの内容が保持されている | 高 |
| FRONT-052 | SP 送信 → 完了遷移 | SP ステップ2・正常入力 | 「送信する」を押下 | `/api/contact` に POST され成功時にステップ3（完了）へ遷移。送信中はボタン文言が「送信中...」になり非活性 | 高 |
| FRONT-053 | SP 送信失敗時のエラー表示 | SP ステップ2・API が 4xx/5xx を返す状況 | 「送信する」を押下 | ステップ2 に留まり、ボタン上部にエラーメッセージ（API の `error`）が表示される（API-CNT-009 連動） | 中 |
| FRONT-054 | SP 完了画面の電話 tel: リンク | SP ステップ3 | 完了画面の電話番号をタップ | 選択店舗の電話番号が `tel:`（数字のみ）リンクになっており発信できる。受付時間「10:00〜21:30」が併記される | 中 |
| FRONT-055 | SP 完了画面トップへ | SP ステップ3 | 「トップページへ」を押下 | `/`（トップ）へ遷移する | 中 |
| FRONT-056 | SP 入力欄のタップ操作性（自動ズーム防止） | SP 幅・実機/エミュレータ | 各入力欄（input/textarea）をタップしてフォーカス | `fontSize:16`・高さ48px のため iOS のフォーカス時自動ズームが起きず、タップしやすい（レビュー#5 関連） | 中 |
| FRONT-057 | SP ヘッダー固定・ハンバーガー | SP 幅 | `/contact` をスクロール・ハンバーガーを開閉 | `SpStickyHeader` が固定表示（各セクション先頭153pxスペーサー）。ハンバーガーで `HamburgerMenuSP` が開閉する | 中 |
| FRONT-058 | SP 予約モーダル | SP 幅 | ヘッダー/メニュー/フッターの予約導線を押下 | `ReserveModal`（`isMobile`）が ScaledSection 外で開く。フォーム入力中でも状態を保持して開閉できる | 中 |
| FRONT-059 | SP セクション高さ実測 | SP 幅 | 各ステップを表示・本文を長文入力 | `ResizeObserver` がコンテンツ実測高さを `onMeasured` で報告し、ScaledSection 全高が `153 + 実測` に確定（ステップ毎にリセット）。レイアウトが切れたり余白過多にならない | 中 |
| FRONT-060 | SP ステップ遷移でページ先頭へ | SP 幅 | ステップ1→2→3 と遷移 | `goStep` で各遷移時にページ先頭へスムーズスクロールする | 低 |
| FRONT-061 | PC フロー（入力→確認→完了） | PC 幅 | `/contact` で入力 → 確認 → 送信 | PC でも 3 ステップが成立し、確認・戻る・完了（電話 tel: リンク）が SP と同等に動作する（状態・送信ロジック共通） | 中 |
| FRONT-062 | Turnstile 有効時の送信ゲート（PC/SP 共通） | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` 設定済 | 確認画面で Turnstile を完了せず送信 | Turnstile 未完了時は「送信する」が非活性。検証完了でトークンが入り活性化する（鍵未設定時はウィジェット非表示で送信可・SEC-020 連動） | 中 |

## テイクアウト注文フロー（/takeout・PC/SP）（2026-06-24）

対象: `/takeout` の 日時選択 → メニュー → 情報入力 → 注文確認 → 完了 の 5 ステップフロー。`useIsMobile()` で PC（設計幅1440・`takeout/Step1DateTime`〜`Step5Complete`）と SP（設計幅390・`sp/TakeoutSP` の `Step1DateTimeSP`/`Step2MenuSP`/`Step3FormSP`/`Step4ConfirmSP`/`Step5CompleteSP`）を切替。

関連コード:
- `src/app/components/takeout/TakeoutClient.tsx`（PC/SP 分岐・全状態（店舗/受取日時/カート/フォーム）と送信ロジック（`handleConfirm` → `POST /api/takeout`）の一元管理・`goStep` で先頭スクロール＋実測値リセット）
- `src/app/components/sp/TakeoutSP.tsx`（SP 5 ステップ。`SectionShell` がヘッダースペーサー153px + ResizeObserver で実測高さ確定。`TakeoutStepperSP` が5段進捗・全 flexbox）
- `src/app/components/takeout/Step1DateTime.tsx`〜`Step5Complete.tsx`（PC 5 ステップ＝ロジックの正本）
- `src/app/lib/takeoutData.ts`（`buildCalendar`／`TAKEOUT_TIME_SLOTS`／`TAKEOUT_STORES`／`TAKEOUT_CATEGORIES`／`formatJpDate`）
- 共通: `src/app/lib/useIsMobile.ts`・`SpStickyHeader`・`HamburgerMenuSP`・`FooterSP`・`ReserveModal`・`Turnstile`

設計メモ:
- 全状態（受取店舗 `store`／表示月 `view`／受取日 `dateIso`／受取時間 `time`／カテゴリ `activeCategory`／カート `cart`／フォーム `form`）・カート計算（`cartLines`/`subtotal`/`cartCount`）・送信処理は **PC/SP 完全共通**（PC 側 `takeout/*` は無改修）。
- カレンダーは `buildCalendar`（火曜定休＝既定・本日〜31日先のみ予約可・土日は残りわずか）。DB 受付枠（`takeoutOrderDb`）がある日は DB 優先・無い日はアルゴリズム既定（DB 空でも注文不能化しない）。
- 「メニュー選択へ進む」活性条件: 受取日 `dateIso` と受取時間 `time` の両方が選択済み。「購入者情報入力へ進む」活性条件: カート 1 点以上。「確認画面へ進む」活性条件: 氏名・フリガナ・メール＋メール一致＋同意 ON（電話・連絡事項は任意）。
- 送信ペイロードは最小化（`storeSlug`/`pickupDate`/`pickupTime`/`items:[{id,qty}]`/`customer`）。価格・合計・商品名・店舗名はサーバーが店舗メニューから再計算（改ざん防止）。API 検証・DB INSERT・メール送信は **API-TKO-001〜010** を参照（本節は UI フロー観点に限定）。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| FRONT-063 | PC/SP 表示切替 | — | `/takeout` を PC 幅（≧1024px）と SP 幅（<1024px）で開く | PC は 1440 設計・SP は 390 設計のレイアウトで描画される（`useIsMobile` 判定。判定確定前は黒画面プレースホルダ） | 高 |
| FRONT-064 | SP 共通ヘッダー/見出し/ステッパー | SP 幅・各ステップ | 各ステップを表示 | ヒーロー(351×130)＋縦書き「持ち帰り」＋「Takeout」見出し＋5段ステッパー（日時選択/メニュー/情報入力/注文確認/完了）が表示。現在ステップ以下の円・接続線が赤で点灯する | 高 |
| FRONT-065 | SP Step1 店舗セレクト変更でリセット | SP ステップ1・受取日時/カート/カテゴリ選択済 | 店舗セレクトを別店舗に変更 | 受取日時（`dateIso`/`time`）・カート・カテゴリが新店舗の先頭にリセットされる（店舗別メニュー/受付枠に切替） | 高 |
| FRONT-066 | SP Step1 カレンダー表示・選択 | SP ステップ1 | カレンダー（全幅・7列）を確認し予約可能日をタップ | 火曜は定休（赤背景・「定休」）・過去/期間外（本日〜31日先より外）は非活性・土日は残りわずか（▲）。予約可能日をタップで金枠ハイライト。前後月の `←`/`→` で月送りできる | 高 |
| FRONT-067 | SP Step1 受取時間枠（3列）の活性 | SP ステップ1 | 受取日を選ぶ前後で時間枠を確認 | 受取日未選択時は時間枠が非活性（薄表示）。受取日選択後に活性化し、タップで金枠ハイライト。「選択中の受取日」に日付＋時刻が反映される | 高 |
| FRONT-068 | SP Step1 次へ活性条件 | SP ステップ1 | 受取日のみ／受取時間のみ／両方選択を試す | 受取日と受取時間の両方が揃うまで「メニュー選択へ進む」は非活性。揃うと活性化しタップで Step2 へ遷移 | 高 |
| FRONT-069 | SP Step2 カテゴリタブ切替 | SP ステップ2 | カテゴリタブ（横スクロール）をタップ | アクティブタブに金下線が付き、該当カテゴリのメニューカード（1列）に切替わる。タブは横スクロール可能 | 高 |
| FRONT-070 | SP Step2 数量ステッパーとカート反映 | SP ステップ2 | メニューカードの「＋」「−」で数量変更 | カート「ご注文内容」に明細（商品名×数量）・小計（消費税8%含む）・合計が即時反映。0 にすると明細から消える | 高 |
| FRONT-071 | SP Step2 次へ活性条件・戻る | SP ステップ2 | カート 0 点／1 点以上で操作、「日時選択へ戻る」を押下 | カート 0 点では「購入者情報入力へ進む」非活性、1 点以上で活性。「日時選択へ戻る」で Step1 に戻り選択内容を保持 | 高 |
| FRONT-072 | SP Step3 入力フォーム描画・バリデーション | SP ステップ3 | 必須（氏名/フリガナ/メール）・メール一致・同意を満たす/欠く | 全 flexbox で各入力欄＋同意チェックが縦に並ぶ。必須＋メール一致＋同意が揃うまで「確認画面へ進む」非活性。揃うと活性化 | 高 |
| FRONT-073 | SP Step3 メール一致チェック | SP ステップ3 | メールと確認メールに異なる値を入力 | 確認欄下に「メールアドレスが一致しません」（赤）が表示されボタン非活性。一致で注意文が消える | 高 |
| FRONT-074 | SP Step3 入力欄のタップ操作性（自動ズーム防止） | SP 幅・実機/エミュレータ | 各入力欄（input/textarea）をタップしてフォーカス | `fontSize:16`・高さ48px のため iOS のフォーカス時自動ズームが起きず、タップしやすい（レビュー#5 関連） | 中 |
| FRONT-075 | SP Step3 メニューへ戻る | SP ステップ3 | 「メニューへ戻る」を押下 | Step2 に戻り、カート内容・入力済みフォームが保持されている | 中 |
| FRONT-076 | SP Step4 確認カードの内容表示 | SP ステップ3 で入力済 | 「確認画面へ進む」を押下 | Step4 に遷移し、お受取予定（受取店舗・受取日時）／ご注文メニュー（明細）／合計／購入者情報（氏名/フリガナ/メール/電話/連絡事項）が確認カードに正しく表示される。未入力の任意項目は「—」表示 | 高 |
| FRONT-077 | SP Step4 情報入力へ戻る | SP ステップ4 | 「情報入力へ戻る」を押下 | Step3 に戻り、入力済みの内容が保持されている | 中 |
| FRONT-078 | SP Step4 送信 → 完了遷移 | SP ステップ4・正常入力 | 「予約を確定する」を押下 | `/api/takeout` に POST され成功時に Step5（完了）へ遷移。送信中はボタン文言が「送信中...」になり非活性 | 高 |
| FRONT-079 | SP Step4 送信失敗時のエラー表示 | SP ステップ4・API が 4xx/5xx を返す状況 | 「予約を確定する」を押下 | Step4 に留まり、ボタン上部にエラーメッセージ（API の `error`）が表示される（API-TKO 連動） | 中 |
| FRONT-080 | SP Step5 完了画面の電話 tel: リンク | SP ステップ5 | 完了画面の電話番号をタップ | 選択店舗の電話番号が `tel:`（数字のみ）リンクになっており発信できる。受付時間「10:00〜21:30」が併記される | 中 |
| FRONT-081 | SP Step5 トップへ | SP ステップ5 | 「トップページへ」を押下 | `/`（トップ）へ遷移する | 中 |
| FRONT-082 | SP ヘッダー固定・ハンバーガー・予約モーダル | SP 幅 | `/takeout` をスクロール・ハンバーガー/予約導線を操作 | `SpStickyHeader` が固定表示（各ステップ先頭153pxスペーサー）。`HamburgerMenuSP` が開閉し、`ReserveModal`（`isMobile`）が ScaledSection 外で開く（注文操作中も状態保持） | 中 |
| FRONT-083 | SP セクション高さ実測 | SP 幅 | カレンダー月送り・カート増減・カテゴリ切替で高さが変わる操作 | `ResizeObserver` がコンテンツ実測高さを `onMeasured` で報告し、ScaledSection 全高が `153 + 実測` に追従（ステップ毎にリセット）。レイアウトが切れたり余白過多にならない | 中 |
| FRONT-084 | SP ステップ遷移でページ先頭へ | SP 幅 | Step1→2→3→4→5 と遷移 | `goStep` で各遷移時にページ先頭へスムーズスクロールする | 低 |
| FRONT-085 | PC フロー（5 ステップ通し） | PC 幅 | `/takeout` で日時 → メニュー → 情報入力 → 確認 → 確定 | PC でも 5 ステップが成立し、各活性条件・戻る・確認・完了（電話 tel: リンク）が SP と同等に動作する（状態・送信ロジック共通） | 中 |
| FRONT-086 | Turnstile 有効時の送信ゲート（PC/SP 共通） | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` 設定済 | 確認画面（Step4）で Turnstile を完了せず確定 | Turnstile 未完了時は「予約を確定する」が非活性。検証完了でトークンが入り活性化する（鍵未設定時はウィジェット非表示で送信可・SEC-020 連動） | 中 |
