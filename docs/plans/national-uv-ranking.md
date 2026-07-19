# 全国UVランキング（今日の全国UV速報）— 調査結果と実装プラン

トップページに「**今日、全国で一番紫外線が強い街**」を最大UVインデックス上位10位まで表示する機能。
拡張機能案 §PV・リピーター増加 の «今日の全国UV速報» に対応する。

- **狙い**: 「今日 紫外線 強い」等のキーワードでのSEO流入と、毎日更新されるコンテンツによるリピーター獲得。
- **結論**: **技術的に実現可能**。DBなし・認証なしの現行方針を崩さずに実装できる。

---

## 1. 技術的実現可能性の調査結果

### 1.1 Open-Meteo は 1 リクエストで複数地点を取得できる

`latitude` / `longitude` をカンマ区切りで並べると、地点ごとの結果を **JSON 配列**で返す。

- 公式ドキュメント: 「Multiple coordinates can be comma separated. E.g. `&latitude=52.52,48.85&longitude=13.41,2.35`」
- **1 リクエストあたり最大 1000 地点**まで指定可能（それ以上は POST ボディ or 分割）。
- レスポンスは入力順を保持した配列。**配列の添字で入力地点と対応付け可能**（実測で確認済み）。

実測（今日 = 2026-07-19、東京・那覇・石垣の 3 点）:

```
GET https://api.open-meteo.com/v1/forecast
    ?latitude=35.68,26.21,24.34
    &longitude=139.76,127.68,124.16
    &daily=uv_index_max&timezone=Asia/Tokyo&forecast_days=1

→ [
    { "latitude":35.7, ..., "daily":{ "time":["2026-07-19"], "uv_index_max":[7.60] } },
    { "latitude":26.19, ..., "location_id":1, "daily":{ ..., "uv_index_max":[8.60] } },
    { "latitude":24.36, ..., "location_id":2, "daily":{ ..., "uv_index_max":[9.00] } }
  ]
```

> 注: 2 地点目以降に `location_id`（= 入力順の添字）が付く。1 地点目は付かない。**添字ベースで zip** すれば `location_id` に依存せず安全。

### 1.2 レート制限とコスト重み

無料（非商用）枠:

| 区分 | 上限 |
| --- | --- |
| 日次 | 10,000 calls / day |
| 時次 | 5,000 calls / hour |
| 分次 | 600 calls / min |

**コスト重みの式**:

```
weight = nLocations × (nDays / 14) × (nVariables / 10)
```

本機能の 1 回のフェッチは `nLocations=250`, `nDays=1`, `nVariables=1`（`uv_index_max` のみ）なので:

```
weight = 250 × (1/14) × (1/10) ≈ 1.79 calls
```

`revalidate: 3600`（1h）でキャッシュするので **1 日最大 24 回 ≒ 43 calls/day**。日次上限 10,000 に対して誤差レベルで、余裕で無料枠内。

### 1.3 座標の入手（DBなしをどう守るか）

- **Nominatim の逐次ジオコーディングは使えない**: 1req/s のレート制限＋ToS 上、250 地点の一括ジオコーディングは不可。
- 代わりに **市区町村の代表点（緯度経度）を静的データとしてリポジトリに同梱**する。これは「DB」ではなく `constants/` に置く定数（座標は不変）なので、強制ルール③「DBなし」に抵触しない。geocode.ts と同じ「座標は不変」という前提の延長線上にある。

---

## 2. 設計判断: 対象地点は「主要都市 約250」

**採用**: 47 都道府県庁所在地 ＋ 政令指定都市の区 ＋ 各都道府県の人口上位市 ＋ 主要観光地 を厳選した **約250地点**。表示は市区町村名（例: 渋谷区・那覇市）。

### なぜ全 1,900 市区町村にしないか

- 素朴に「最大UV上位10」を全市区町村で取ると、**ほぼ毎日「沖縄・南西諸島の離島（与那国町・竹富町・宮古島市 …）」で固定**され、ランキングの新鮮味・話題性が乏しい。
- 地点数が多く GET URL が長くなり、分割 or POST（Next のデータキャッシュ対象外）＋自前キャッシュが必要になり複雑。

### 主要都市 約250 の利点

- 全国が満遍なく入るので**日々の天候で順位が入れ替わり**、リピーター動機・SNS 話題性が出る。
- 250 地点なら **GET URL は約 4〜5KB** に収まり、`fetch` の `next: { revalidate }` に素直に乗る（後述の安全策として 200 地点ずつ分割も可）。
- ランキングが「県庁所在地・主要都市」なので読者が**自分事として読める**（「静岡市が2位」等）。

---

## 3. データセット設計

> **命名方針**: このデータは全国UVランキング以外（都市別ページ・天気連動など）でも再利用しうる汎用の「主要都市マスタ」なので、ランキング専用に見えない `constants/majorCities.ts`（型 `MajorCity` / 定数 `MAJOR_CITIES`）とする。「主要都市 = major cities」であることがファイル名から一目で分かる。

### 3.1 選定基準（ユーザーにも説明する）

「主要都市」の定義を **1 箇所に文言として持ち**、UI のツールチップ（§5.5）でそのまま表示する。基準:

- 47 都道府県すべての **県庁所在地**
- **政令指定都市の区**
- 各都道府県の **人口上位の市**
- 主要な **観光地**

この定義文は `constants/majorCities.ts` に `MAJOR_CITIES_CRITERIA` として export し、データ・UI・doc の三者で表現を一致させる（表示のブレを防ぐ）。

### 3.2 スキーマ

```ts
// constants/majorCities.ts
export interface MajorCity {
  /** 表示名（市区町村）例: "那覇市" "渋谷区" */
  name: string;
  /** 都道府県 例: "沖縄県" */
  pref: string;
  /** 代表点（十進緯度） */
  lat: number;
  /** 代表点（十進経度） */
  lon: number;
}

/** 「主要都市」の選定基準（UI ツールチップと共有する説明文） */
export const MAJOR_CITIES_CRITERIA =
  "全国の県庁所在地・政令指定都市の区・各都道府県の人口上位市・主要観光地から選んだ約250都市を対象にしています。";

export const MAJOR_CITIES: MajorCity[] = [
  { name: "札幌市", pref: "北海道", lat: 43.0642, lon: 141.3469 },
  { name: "那覇市", pref: "沖縄県", lat: 26.2124, lon: 127.6809 },
  // ... 約250件
];
```

### 3.3 データの作り方（同梱前の一度きりの作業）

以下のいずれかで CSV/JSON を用意し、`MAJOR_CITIES` に整形して静的コミットする（実行時にジオコーディングしない）:

- **推奨**: 国土地理院「全国市区町村界データ」or e-Stat「市区町村別代表点」から、対象都市を抽出。
- 代替: GeoNames（`JP.txt`、`feature class=P`）を人口降順で上位抽出し、県庁所在地・政令市区を補完。
- 生成スクリプトは `scripts/` に置くが**ビルド/実行時には使わない**（出力の TS だけを同梱）。座標は不変なので再生成は稀。

> 品質チェック: 各県 1 件以上入っていること、政令市は区単位で重複しすぎないこと、離島の極端値だけで上位が埋まらないバランスにすること。

---

## 4. アーキテクチャ（4層分離の遵守）

### 4.1 データフロー

```
app/page.tsx (結線のみ)
  └─ RankingContainer (Server, データフェッチのみ / render props)
        └─ serverFetcher("/api/uv/ranking")  ──▶  app/api/uv/ranking/route.ts
                                                     ├─ MAJOR_CITIES を読む
                                                     ├─ lib/openmeteo/bulkForecast.ts で一括取得
                                                     └─ getRiskLevel で整形し上位10を返す
        └─ children(ranking) →
              PageComponent (UI ルート)
                ├─ UvRankingList (Leaf, 表示のみ)   ← 新規
                └─ SearchForm（既存）
```

現行の外部 API アクセス規約（強制ルール①②⑦⑩⑪）にすべて沿う:
外部 API は `lib/**`（server-only）にラップ → 自前 API Route から呼ぶ → Container が `serverFetcher` + zod で受ける。

### 4.2 新規・変更ファイル一覧

| ファイル | 種別 | 役割 |
| --- | --- | --- |
| `constants/majorCities.ts` | 新規 | 主要都市 約250 の代表点データ ＋ 選定基準文言（再利用可能な汎用マスタ） |
| `lib/openmeteo/bulkForecast.ts` | 新規 (server-only) | 複数地点の当日 `uv_index_max` を一括取得 |
| `app/api/uv/ranking/type.ts` | 新規 | ランキング出力型 + zod schema |
| `app/api/uv/ranking/route.ts` | 新規 | 一括取得 → 整形 → 上位10を返す |
| `app/_top/_containers/RankingContainer.tsx` | 新規 | `/api/uv/ranking` を叩く（render props） |
| `app/_top/_components/UvRankingList.tsx` | 新規 (Leaf) | ランキングの表示（Server Component） |
| `app/_top/_components/PageComponent.tsx` | 変更 | `ranking` を受け取り `UvRankingList` を描画 |
| `app/page.tsx` | 変更 | `RankingContainer` と `PageComponent` を結線 |
| `constants/site.ts` | 変更 | ランキング用の SEO キーワード追記（任意） |

新しい依存は追加しない（Recharts も不要。ランキングは静的な順位リスト）。

---

## 5. 実装スケッチ

### 5.1 一括取得（`lib/openmeteo/bulkForecast.ts`）

```ts
import "server-only";

export interface BulkUvMax {
  /** 入力地点と同じ並び。当日の日最大UV（欠損は null） */
  uvMax: (number | null)[];
  /** 対象日 "2026-07-19" (JST) */
  date: string;
}

const ENDPOINT = "https://api.open-meteo.com/v1/forecast";
// GET URL 長対策の安全マージン（1000 まで可だが分割して素直にキャッシュ）
const CHUNK = 200;

export const fetchDailyUvMaxBulk = async (
  points: { lat: number; lon: number }[],
): Promise<BulkUvMax> => {
  const uvMax: (number | null)[] = [];
  let date = "";

  for (let i = 0; i < points.length; i += CHUNK) {
    const chunk = points.slice(i, i + CHUNK);
    const url = new URL(ENDPOINT);
    url.searchParams.set("latitude", chunk.map((p) => p.lat).join(","));
    url.searchParams.set("longitude", chunk.map((p) => p.lon).join(","));
    url.searchParams.set("daily", "uv_index_max");
    url.searchParams.set("timezone", "Asia/Tokyo");
    url.searchParams.set("forecast_days", "1");

    // 気象は1h更新のため forecast.ts と同じ 1h キャッシュ（強制ルール②）
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`open_meteo_http_${res.status}`);

    // 1地点でも配列で返さないケースに備え normalize
    const json = await res.json();
    const list: { daily: { time: string[]; uv_index_max: number[] } }[] =
      Array.isArray(json) ? json : [json];

    for (const item of list) {
      const v = item.daily?.uv_index_max?.[0];
      uvMax.push(typeof v === "number" ? Math.round(v * 10) / 10 : null);
      if (!date) date = item.daily?.time?.[0] ?? "";
    }
  }

  return { uvMax, date };
};
```

### 5.2 出力型（`app/api/uv/ranking/type.ts`）

```ts
import { z } from "zod";
import { RiskSchema } from "@/app/api/uv/type"; // 既存 Risk を再利用

export const RankingItemSchema = z.object({
  rank: z.number(),          // 1..10
  name: z.string(),          // "那覇市"
  pref: z.string(),          // "沖縄県"
  uvMax: z.number(),
  risk: RiskSchema,          // 色・ラベル・推奨SPF
});
export type RankingItem = z.infer<typeof RankingItemSchema>;

export const UvRankingSchema = z.object({
  date: z.string(),          // "2026-07-19"
  items: z.array(RankingItemSchema),
});
export type UvRanking = z.infer<typeof UvRankingSchema>;
```

### 5.3 ルート（`app/api/uv/ranking/route.ts`）

```ts
import { NextResponse } from "next/server";
import { MAJOR_CITIES } from "@/constants/majorCities";
import { fetchDailyUvMaxBulk } from "@/lib/openmeteo/bulkForecast";
import { getRiskLevel } from "@/lib/uv";
import { UvRankingSchema, type RankingItem } from "./type";

const TOP_N = 10;

export async function GET() {
  const { uvMax, date } = await fetchDailyUvMaxBulk(
    MAJOR_CITIES.map((m) => ({ lat: m.lat, lon: m.lon })),
  );

  const ranked = MAJOR_CITIES
    .map((m, i) => ({ m, uv: uvMax[i] }))
    .filter((x): x is { m: (typeof MAJOR_CITIES)[number]; uv: number } =>
      x.uv !== null,
    )
    .sort((a, b) => b.uv - a.uv)
    .slice(0, TOP_N)
    .map((x, idx): RankingItem => {
      const r = getRiskLevel(x.uv);
      return {
        rank: idx + 1,
        name: x.m.name,
        pref: x.m.pref,
        uvMax: x.uv,
        risk: {
          key: r.key,
          label: r.label,
          color: r.color,
          recommendedSpf: r.recommendedSpf,
          advice: r.advice,
        },
      };
    });

  const parsed = UvRankingSchema.parse({ date, items: ranked });
  return NextResponse.json(parsed);
}
```

### 5.4 Container（`app/_top/_containers/RankingContainer.tsx`）

```tsx
import { UvRankingSchema, type UvRanking } from "@/app/api/uv/ranking/type";
import { serverFetcher } from "@/lib/fetcher/server";

interface Props {
  children: (ranking: UvRanking | null) => React.ReactNode;
}

export const RankingContainer = async ({ children }: Props) => {
  // 失敗してもトップ全体は落とさない（throwErr:false → null → 非表示）
  const ranking = await serverFetcher("/api/uv/ranking", {
    schema: UvRankingSchema,
    throwErr: false,
  });
  return children(ranking);
};
```

### 5.5 Leaf（`app/_top/_components/UvRankingList.tsx`）

- Server Component（`useState` 等は不要）。`react-icons` の 🔥/☀ 系アイコンで演出。
- 各行: 順位・市区町村名（県）・UV値・`RiskBadge`（既存を再利用）。1位は強調。
- 各行をクリックすると `/result/[place]?...`（既存の結果ページ）へ遷移 → 回遊導線になる。
- **選定基準のツールチップ**: 見出し横に `react-icons` の info アイコンを置き、DaisyUI の `tooltip`（`data-tip`）で `MAJOR_CITIES_CRITERIA` を表示。「なぜこの都市だけ？」という疑問に答え、ランキングの信頼性を担保する。`aria-label` にも同文言を入れてアクセシビリティ対応。
- SVG 直書きは禁止（強制ルール⑨）なので、アイコンは必ず `react-icons` から。

```tsx
import Link from "next/link";
import { FaCircleInfo } from "react-icons/fa6";
import { RiskBadge } from "@/app/_components/RiskBadge";
import type { UvRanking } from "@/app/api/uv/ranking/type";
import { MAJOR_CITIES_CRITERIA } from "@/constants/majorCities";

export const UvRankingList = ({ ranking }: { ranking: UvRanking }) => (
  <section aria-labelledby="uv-ranking-heading" className="mb-8">
    <h2
      id="uv-ranking-heading"
      className="mb-3 flex items-center gap-2 text-lg font-bold"
    >
      今日の全国UVランキング
      <span className="text-base-content/60 text-xs">{ranking.date} 時点</span>
      {/* DaisyUI tooltip: 選定基準をホバー/フォーカスで表示 */}
      <span
        className="tooltip tooltip-bottom text-base-content/50 before:max-w-xs before:whitespace-normal"
        data-tip={MAJOR_CITIES_CRITERIA}
      >
        <FaCircleInfo aria-label={MAJOR_CITIES_CRITERIA} className="text-sm" />
      </span>
    </h2>
    <ol className="divide-base-300 divide-y">
      {ranking.items.map((it) => (
        <li key={it.rank}>
          <Link
            href={`/result/${encodeURIComponent(it.name)}`}
            className="hover:bg-base-200/60 flex items-center gap-3 px-2 py-2"
          >
            <span className="w-6 text-center font-bold">{it.rank}</span>
            <span className="flex-1">
              {it.name}
              <span className="text-base-content/60 ml-1 text-xs">{it.pref}</span>
            </span>
            <span className="font-mono font-bold">{it.uvMax.toFixed(1)}</span>
            <RiskBadge risk={it.risk} size="sm" />
          </Link>
        </li>
      ))}
    </ol>
  </section>
);
```

### 5.6 結線（`page.tsx` / `PageComponent.tsx`）

```tsx
// app/page.tsx
import { RankingContainer } from "./_top/_containers/RankingContainer";
import { PageComponent } from "./_top/_components/PageComponent";

export default function Page() {
  return (
    <RankingContainer>
      {(ranking) => <PageComponent ranking={ranking} />}
    </RankingContainer>
  );
}
```

```tsx
// PageComponent.tsx（抜粋）: ranking?.items があれば SearchForm の上に UvRankingList を描画
{ranking && ranking.items.length > 0 && <UvRankingList ranking={ranking} />}
```

---

## 6. キャッシュ戦略

| 対象 | revalidate | 理由 |
| --- | --- | --- |
| `bulkForecast`（Open-Meteo） | 3600（1h） | 既存 forecast.ts と同一。気象は1h更新（強制ルール②） |
| `/api/uv/ranking`（Route Handler） | 上流 fetch のキャッシュに追従 | Route 自体は毎回上流のキャッシュ済み結果を整形 |

- ランキングは 1h ごとに更新され、当日の日最大UVは日中を通して安定（`uv_index_max` は「その日の最大」なので時刻に依らない）。
- 追加の再検証を明示したい場合、`route.ts` に `export const revalidate = 3600;` を付けても良い。

---

## 7. SEO

- `<h2>今日の全国UVランキング</h2>` を**サーバーレンダリング**（本文がHTMLに載る）。→「今日 紫外線 強い」等を拾う。
- トップに `generateMetadata`（現状は layout 依存）を追加し、description に「全国のUVランキング／今日紫外線が一番強い街」を反映。`constants/site.ts` の `SITE_KEYWORDS` に「全国」「ランキング」「速報」を追記。
- 構造化データ（任意・効果的）: `ItemList` の JSON-LD を `UvRankingList` に埋め、リッチリザルト候補にする。
- 各行から `/result/[place]` へ内部リンク → クロール導線＆回遊率向上（結果ページは `robots: index:false` のままで良い。ランキング＝トップは index 対象）。

---

## 8. エッジケース・注意点

- **一括取得の失敗**: `RankingContainer` は `throwErr:false`。null ならセクション非表示にしてトップの検索フォームは通常表示（機能はあくまで付加要素）。
- **欠損値**: `uv_index_max` が number でない地点は `filter` で除外（順位から落とす）。
- **同値の並び**: `sort` は安定。同UVは配列順（＝データ定義順）で決まる。必要なら第2キーに人口/県名を足す。
- **地名の解決**: ランキングのリンク先 `/result/[place]` は既存の Nominatim 検索を通る。データの `name`（例「那覇市」）が Nominatim で正しく引けることを、データ作成時にサンプル検証しておく。曖昧な同名市（例「府中市」）は `name` を「府中市（東京都）」等にせず、リンクは `pref+name` を渡す等の調整余地あり（初版は `name` のみで可、要確認）。
- **URL 長**: 200 地点/チャンクで分割済みのため GET で安全。将来 1000 超にする場合のみ POST + `unstable_cache` を検討。
- **タイムゾーン**: `timezone=Asia/Tokyo` 固定。`date` は `daily.time[0]`。

---

## 9. 実装ステップ（順に PR 可能な粒度）

1. `constants/majorCities.ts` を用意（`MAJOR_CITIES` データ生成 ＋ `MAJOR_CITIES_CRITERIA` 定義 → サンプル地名の Nominatim 解決確認）。
2. `lib/openmeteo/bulkForecast.ts` を実装（3 点で手動確認）。
3. `app/api/uv/ranking/type.ts` + `route.ts` を実装（`/api/uv/ranking` を直接叩いて JSON 検証）。
4. `RankingContainer` + `UvRankingList` + `PageComponent`/`page.tsx` 結線。
5. SEO（`generateMetadata`・キーワード・任意で JSON-LD）。
6. `npm run build` / `npm run lint` を通す。トップの表示・回遊リンク・失敗時フォールバックを確認。

## 10. 将来拡張（本プランのスコープ外）

- **都道府県別ランキングページ** `/ranking`（専用ページ・index 対象）へ発展。トップは上位10のダイジェスト、`/ranking` で全都市＋県別フィルタ。
- 「一番弱い街」「前日比で急上昇した街」など切り口を追加し話題性を強化。
- 週間の推移（`forecast_days` を増やす）で「今週末が一番強い街」ランキング。

---

### 参考（調査ソース）

- Open-Meteo Docs — 複数地点（カンマ区切り）／レート制限: <https://open-meteo.com/en/docs>
- Open-Meteo「Weather Data for Multiple Locations At Once」— 最大1000地点・重み式 `weight = nLocations × (nDays/14) × (nVariables/10)`: <https://openmeteo.substack.com/p/weather-data-for-multiple-locations>
- Open-Meteo Pricing — 無料枠 10,000/day・5,000/hour・600/min: <https://open-meteo.com/en/pricing>
