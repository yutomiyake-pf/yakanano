# yakanano — Agent Guide

「今日、何分で日焼けする？」を判定する UV 日焼けリスクチェッカー。DB なし・認証なし・外部 API のみで動作する。

Claude が本プロジェクトで作業するうえで最低限知っておくべき内容のみを書く。設計・設定・実装は姉妹プロジェクト oss-health-checker の構成を踏襲している。

## Stack (バージョン固定 — training data と異なる可能性あり)

| 項目                    | 値                | メモ                                                                    |
| ----------------------- | ----------------- | ----------------------------------------------------------------------- |
| Next.js                 | 16.2 (App Router) | `params` / `searchParams` は `Promise`                                  |
| React                   | 19.2              | controlled input のチェックが厳格                                       |
| Tailwind CSS            | 4.x               | `@tailwindcss/postcss` 経由。`tailwind.config.ts` は不要                |
| DaisyUI                 | 5.x               | `globals.css` の `@plugin "daisyui"` + カスタムテーマ `yakanano`         |
| Recharts                | 3.x               | 1時間毎の UV 推移を折れ線グラフで描画（`"use client"` 配下のみ）         |
| TypeScript              | 5.x               | strict 前提                                                             |
| zod                     | 4.x               | `z.url()` `z.coerce.number()` 等がトップレベル                          |
| react-hook-form         | 7.74              | フォーム状態管理                                                        |
| @hookform/resolvers     | 5.x               | RHF と zod の橋渡し (`zodResolver(schema)`)                             |
| react-icons             | 5.x               | アイコンは全てここから（他ライブラリを足さない）                        |
| @tailwindcss/typography | 0.5.x             | `prose` クラスで利用規約 / プライバシーの本文スタイル                   |

## 強制ルール (作業前に必ず確認)

1. **外部 API 呼び出しは必ず API Route 経由**: Nominatim / Open-Meteo へのアクセスは `lib/nominatim/*` `lib/openmeteo/*`（`import "server-only"`）にラップし、`app/api/uv/route.ts` から呼ぶ。Server / Client Component からは自前 API Route を fetch する。
2. **キャッシュは用途別に明示**: Nominatim は `revalidate: 86400`（24h、座標は不変 + 1req/s 制限回避）、Open-Meteo は `revalidate: 3600`（1h、気象は1h更新）。
3. **認証なし・DB なし**: ログイン不要。`firebase` / `next-auth` 等の依存を追加しない。
4. **UI は DaisyUI + Tailwind 一択**: 独自 CSS Module や styled-components を導入しない。テーマは `globals.css` のサニーテーマ `yakanano`。UV リスク5段階の色（緑/黄/橙/赤/紫）は DaisyUI では表現しきれないため `lib/uv.ts` の生の色を使う。
5. **コメントは最小限**: 「なぜそう書いたか」が非自明な時のみ。
6. **Server Component を既定とする**: `"use client"` はフォーム入力・タブ切替（useState）・Recharts など対話/ブラウザ API が必要な箇所のみ。
7. **自前 API Route の呼び出しは `lib/fetcher` 経由**: Server からは `serverFetcher`、Client からは `clientFetcher`。レスポンスは zod スキーマで検証する。
8. **フォームは react-hook-form + zod + `@hookform/resolvers` 固定**。
9. **アイコンは `react-icons` 一択**: SVG 直書き・他アイコンライブラリ禁止。
10. **4 層分離 (page / Container / PageComponent / Leaf)**: `page.tsx` は結線のみ。Container はデータフェッチのみ（render props で children に渡す）。PageComponent は画面ごとの UI ルート。Leaf は単機能の表示部品。
11. **SEO を常に意識する**: 新画面は `generateMetadata` で title / description / canonical / OG を組む。地名結果ページ（`/result/[place]`）は組み合わせが無限のため `robots: { index: false }`。サイト定数は `constants/site.ts` に集約。

## ディレクトリ構成 (要点)

```
yakanano/
├── app/
│   ├── page.tsx                       # トップ: PageComponent 結線のみ
│   ├── _components/                   # アプリ共通 UI
│   │   ├── RiskBadge.tsx              # UV リスクレベルのバッジ
│   │   └── ForecastNotice.tsx        # 「予報・推定値」注意書き
│   ├── _top/_components/              # トップ画面の専用 UI
│   │   ├── PageComponent.tsx          # UI ルート
│   │   └── SearchForm.tsx             # 地名 + 肌タイプ + SPF 入力 (Client, RHF + zod)
│   ├── result/[place]/                # 判定結果画面
│   │   ├── page.tsx                   # 結線 + generateMetadata (skin/spf は searchParams)
│   │   ├── _containers/PageContainer.tsx  # /api/uv を叩き、null なら notFound()
│   │   └── _components/
│   │       ├── PageComponent.tsx      # UI ルート
│   │       ├── UVTabs.tsx             # 今日/明日/明後日 タブ (Client, useState)
│   │       ├── SunburnCard.tsx        # 日焼け時間・推奨対策カード
│   │       ├── UVHourlyChart.tsx      # 1時間毎 UV 推移グラフ (Client, Recharts)
│   │       └── UVHourlyTable.tsx      # 1時間毎データテーブル
│   ├── api/uv/
│   │   ├── route.ts                   # geocode → forecast → 整形して返す
│   │   └── type.ts                    # API 出力型 (UvResultSchema, zod)
│   ├── terms/ , privacy/              # 利用規約 / プライバシーポリシー
│   ├── layout.tsx                     # RootLayout (ヘッダーなし、main + footer) + サイト metadata
│   ├── error.tsx / not-found.tsx / global-error.tsx
│   ├── robots.ts / sitemap.ts / opengraph-image.tsx / globals.css
├── lib/
│   ├── fetcher/                       # baseFetch / serverFetcher / clientFetcher
│   ├── nominatim/geocode.ts           # 地名 → 緯度経度 (server-only, 24h キャッシュ)
│   ├── openmeteo/forecast.ts          # 緯度経度 → UV 予報 (server-only, 1h キャッシュ)
│   ├── uv.ts                          # 日焼け時間計算・リスク判定 (純粋ロジック、client/server 共用)
│   └── og.ts                          # OG 画像共通 (Noto Sans JP subset / 背景)
└── constants/site.ts                  # サイト定数
```

### 4 層アーキテクチャ

| 層             | 責務                                                       | やってはいけないこと                    |
| -------------- | ---------------------------------------------------------- | --------------------------------------- |
| `page.tsx`     | `params`/`searchParams` の await、Container + Component 結線 | JSX 要素を直接書く                      |
| Container      | データフェッチのみ（render props で children に渡す）      | UI コンポーネントを import・描画する     |
| PageComponent  | 画面ごとの UI ルート                                       | fetch / router 等の副作用、環境変数      |
| Leaf Component | 単機能の表示部品                                           | 外部 API 直アクセス、環境変数            |

### 型の分離: 外部 API 側 vs 自前 API 出力

- 外部 API（Nominatim / Open-Meteo）の生レスポンス型は `lib/**` 内の **module-private interface** として持ち、export しない。
- 自前 API の出力型 + zod schema は `app/api/uv/type.ts` に置く。Container の `serverFetcher({ schema })` にはこの schema を渡す。
- 整形（生レスポンス → API 出力）は `app/api/uv/route.ts` で完結させる。
- 日焼け時間・リスク判定の純粋ロジックは `lib/uv.ts`。skin/spf はクライアント入力なので `"use client"` からも呼べるよう server-only にしない。

## 開発フロー

- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` — production build（型エラーで落ちる）
- `npm run lint` — eslint-config-next

## 環境変数

| 変数名                 | 用途                                                  | 必須 |
| ---------------------- | ----------------------------------------------------- | ---- |
| `NEXT_PUBLIC_SITE_URL` | `serverFetcher` が自前 API を叩く絶対 URL のベース    | ✅   |
| `NEXT_PUBLIC_GA_ID`    | Google Analytics 測定 ID（未設定なら GA を読み込まない） | —    |

## クレジット表記 (削除しないこと)

- 地名データ © OpenStreetMap contributors（ODbL ライセンス上フッターでの帰属表示が必須）
- 気象データ Open-Meteo
