@AGENTS.md

# heijoutei-web プロジェクトルール

## プロジェクト概要
焼肉平壌亭（亀岡・園部・福知山・焼肉ゆらの）の公式Webサイト。
Figmaデザイン（固定px設計）をScaledSectionでスケーリングして表示する。

---

## アーキテクチャ

### ScaledSection方式
- PC設計幅: **1440px**、SP設計幅: **390px**
- ブレークポイント: **1024px**（未満がSP）
- `transform: scale()` でビューポートに合わせてスケーリング
- 各セクションは `<ScaledSection designWidth={...} height={...}>` でラップする
- SP用コンポーネントは `src/app/components/sp/` に格納（例: `HeroSectionSP.tsx`）

### ファイル構成
```
src/app/
├── page.tsx                      # ルート
├── layout.tsx
├── globals.css
└── components/
    ├── ResponsivePage.tsx        # PC/SP切替 + ScaledSection管理
    ├── StickyButton.tsx          # 右下固定ボタン
    ├── ReserveModal.tsx          # 予約モーダル
    ├── [SectionName].tsx         # PC用セクション
    └── sp/
        └── [SectionName]SP.tsx   # SP用セクション
```

---

## レイアウトルール（最重要）

### flexboxを使う
横並び・縦並び・間隔調整など、**レイアウトは必ずflexboxで行う**。

```tsx
// 横並び
display: "flex", gap: 16

// 縦並び
display: "flex", flexDirection: "column", gap: 24

// 分散配置
justifyContent: "space-between"

// 中央揃え
alignItems: "center", justifyContent: "center"
```

### absoluteを使っていい場面（限定）
- 背景画像・オーバーレイ画像など、**物理的に重なる要素のみ**
- グラデーションオーバーレイ

### 使ってはいけない配置方法
- `position: absolute` を通常の要素配置に使う → **禁止**
- `marginTop` / `marginBottom` で縦の位置を指定する → **禁止**（`gap` で代替）
- `top` / `left` の絶対値でテキスト・ロゴ・ナビを配置する → **禁止**

---

## デザイントークン

### カラー
| 用途 | 値 |
|------|----|
| 背景 | `#0a0a0a` |
| メインテキスト | `#ebe5db` |
| サブテキスト | `#99948c` / `#59544f` |
| ゴールドアクセント | `#d9b86b` / `rgba(221,168,63,0.6)` |
| LINEバー背景 | `#273528` |
| ボーダー（薄） | `rgba(234,229,219,0.15)` |

### フォント
```tsx
const mincho = "'Shippori Mincho', serif";   // 和文見出し・本文
const sans = "'Noto Sans JP', sans-serif";   // サブテキスト・英字
// Cormorant Garamond は英語装飾テキストに使用
```

---

## コーディング規約

- コンポーネントはすべて `"use client"` （ScaledSection内でuseEffectを使うため）
- フォント変数 `mincho` / `sans` はファイル上部に定数として定義する
- インラインスタイルを使う（Tailwindは補助的に使用）
- コメントは最小限。WHYが自明でない場合のみ書く

## Figmaとの対応
- デザイン参照先: Figmaファイル（URLはユーザーから都度共有）
- 座標・サイズは `get_design_context` / `get_metadata` で取得する
- Figma値をコードに反映する際はflexboxで再現する（生の座標値をそのままtop/leftに使わない）

---

## 開発コマンド
```bash
npm run dev    # 開発サーバー起動
npm run build  # ビルド確認
npm run lint   # ESLint
```
