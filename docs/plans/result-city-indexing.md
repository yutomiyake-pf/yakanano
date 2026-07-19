# 主要都市の結果ページをインデックス対象にする実装フロー

`/result/[place]` は現在すべて `noindex`。ここに、TOPの全国UVランキングから遷移する
**主要都市 217 件（`constants/majorCities.ts`）だけ**を、`/result/〇〇県〇〇市` の形式で
インデックス対象にし、sitemap にも登録する。ユーザー入力による無限の地名組み合わせは
これまで通り `noindex` のまま残す。

- 対象 URL 例: `/result/鹿児島県奄美市`（= `pref + name`。ランキングのリンクと同一形式）
- 非対象: `/result/渋谷`（略称・任意入力）、skin/spf 付きの派生 URL

---

## 1. 現状の「インデックスを阻む」3要因

| # | 箇所 | 現状 | 問題 |
| --- | --- | --- | --- |
| 1 | `app/result/[place]/page.tsx` `generateMetadata` | `robots: { index: false, follow: true }` を**全ページ一律**で付与 | 主要都市も noindex になる |
| 2 | `app/robots.ts` | `disallow: ["/api/", "/result/"]` | `/result/` 配下を**クロール自体禁止**。noindex 以前にクローラが来られない。robots.txt で Disallow された URL は「noindex を読む」こともできない |
| 3 | `app/sitemap.ts` | `/`・`/terms`・`/privacy` のみ | 主要都市ページが sitemap に無く、発見されにくい |

> 重要: robots.txt の `Disallow` と `<meta robots noindex>` は別物。
> **インデックスさせたい URL は robots.txt で「クロール許可」しつつ、ページ側で `index:true` にする**必要がある。
> 両方を正さないと 217 件はインデックスされない。

---

## 2. インデックス対象の定義（単一の真実）

`constants/majorCities.ts` に「インデックス可能スラッグ集合」を追加し、判定を1箇所に集約する。
`page.tsx`（robots 判定）・`robots.ts`（Allow 列挙）・`sitemap.ts`（URL 列挙）の三者が同じ集合を参照する。

```ts
// constants/majorCities.ts へ追記
/** インデックス対象の正規スラッグ ("鹿児島県奄美市")。ランキングのリンク先と同形式。 */
export const MAJOR_CITY_SLUGS: readonly string[] = MAJOR_CITIES.map(
  (c) => `${c.pref}${c.name}`,
);

const MAJOR_CITY_SLUG_SET = new Set(MAJOR_CITY_SLUGS);

/** place（デコード済み地名）が主要都市の正規スラッグと完全一致するか。 */
export const isMajorCitySlug = (place: string): boolean =>
  MAJOR_CITY_SLUG_SET.has(place);
```

- ランキングのリンクは既に `/result/${encodeURIComponent(pref + name)}` に統一済み（実装済み）。
  → 遷移先の `place` は必ず `pref+name` になり、`isMajorCitySlug` で拾える。

---

## 3. 実装フロー（ステップ）

### Step 1. `constants/majorCities.ts` にスラッグ集合と判定を追加
§2 のコードを追記するだけ。

### Step 2. `app/result/[place]/page.tsx` の `generateMetadata` を分岐

```ts
import { isMajorCitySlug } from "@/constants/majorCities";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const place = decodePlace((await params).place);
  const indexable = isMajorCitySlug(place);
  return {
    title: `${place} の紫外線・日焼けリスク`,
    description: `${place} の今日から7日間の紫外線指数（UVインデックス）と、日焼けまでの時間・必要なSPFを判定します。`,
    // canonical は skin/spf を含まないクリーンURL。派生URLはここへ集約される。
    alternates: { canonical: `/result/${encodeURIComponent(place)}` },
    // 主要都市のみ index。それ以外（任意入力）は従来どおり noindex。
    robots: { index: indexable, follow: true },
  };
}
```

- skin/spf 付き URL でも `place` 自体は主要都市スラッグなので `index:true` になるが、
  **canonical が param 無しの同一URLを指す**ため Google 側で正規URLに統合される（重複インデックス回避）。
  厳密に切りたい場合は `searchParams` を見て param 有り時のみ `index:false` にする案もある（任意）。

### Step 3. `app/robots.ts` を「Disallow /result/ ＋ 217件 Allow」に

Google は robots.txt を**最長一致**で評価するため、`Disallow: /result/` より長い
`Allow: /result/<encoded>` が該当 URL では優先される。これで **217 件だけクロール許可**し、
残りの無限空間は Disallow のままにできる（クロールバジェット保護）。

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/site";
import { MAJOR_CITY_SLUGS } from "@/constants/majorCities";

export default function robots(): MetadataRoute.Robots {
  const allowCities = MAJOR_CITY_SLUGS.map(
    (slug) => `/result/${encodeURIComponent(slug)}`,
  );
  return {
    rules: [
      {
        userAgent: "*",
        // 最長一致で Allow が勝つため、217件の主要都市だけクロール可能になる。
        allow: ["/", ...allowCities],
        disallow: ["/api/", "/result/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

- パスは**パーセントエンコード**で出力する（実リクエストの日本語パスは encoded なので一致する）。
- 末尾 `$` は付けない（付けると skin/spf 派生がクロール不可になる）。prefix 一致で派生も
  クロール可能にし、index 制御は §Step 2 の canonical / robots に委ねる。

### Step 4. `app/sitemap.ts` に 217 件を追加

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/site";
import { MAJOR_CITY_SLUGS } from "@/constants/majorCities";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const cities: MetadataRoute.Sitemap = MAJOR_CITY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/result/${encodeURIComponent(slug)}`,
    lastModified: now,
    changeFrequency: "daily", // UV は毎日更新
    priority: 0.7,
  }));

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    ...cities,
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
```

### Step 5.（任意・フェーズ2）`generateStaticParams` で 217 件を SSG/ISR 化
インデックス品質・表示速度を上げたい場合のみ。

```ts
export const dynamicParams = true; // 217件以外は従来どおり動的レンダリング（検索は維持）
export const revalidate = 3600;    // UV を1hで再生成

export function generateStaticParams() {
  return MAJOR_CITY_SLUGS.map((slug) => ({ place: slug }));
}
```

- 注意: ビルド時に 217 件分の geocode+forecast が走る。現状の結果ページは `/api/uv`
  （Nominatim ジオコード）経由のため、**ビルドで 217 回 Nominatim を叩く**（1req/s 制限で数分＋ToS 的に微妙）。
  → 主要都市は `majorCities.ts` に座標を持っているので、**座標があれば geocode を省略する**
  経路を用意してからにするのが望ましい。フェーズ2として切り出す。
- フェーズ1（Step 1〜4）だけでも動的SSRのままインデックスは可能。まずはここまでで十分。

---

## 4. 注意点

- **robots.txt と meta の二段構え**: 「Allow でクロール可能」かつ「meta で index:true」の両方が揃って初めてインデックスされる。片方だけでは不可。
- **canonical**: すべて param 無しのクリーンURLを指すこと。skin/spf 違いを別ページとして量産させない。
- **同名回避**: `pref+name` で都道府県を前置しているため「府中市」等の同名も一意（`majorCities.ts` は同名重複0を確認済み）。ランキング・robots・sitemap・canonical すべて同じ `pref+name` で一貫。
- **クロールバジェット**: `Disallow: /result/` を残すことで、リンクもされていない無限の任意地名がクロールされるのを防ぐ。
- **件数**: robots.txt に 217 行の Allow が入るがサイズ的に問題なし。将来 `majorCities.ts` を増減すれば robots/sitemap/判定が自動追従する（単一ソース）。

---

## 5. 検証方法

1. `npm run build` 後、`/robots.txt` を取得し `Allow: /result/%E9%B9%BF...（奄美市）` 等が 217 件出ることを確認。
2. `/sitemap.xml` に `…/result/<encoded 主要都市>` が 217 件 + 固定3件で並ぶことを確認。
3. 主要都市ページ `curl /result/鹿児島県奄美市` の HTML に
   `<meta name="robots" content="index,follow">` と param 無し canonical が出ることを確認。
4. 任意地名ページ `curl /result/渋谷` は従来どおり `noindex` のままであることを確認。
5. （公開後）Google Search Console の URL 検査で主要都市URLが「インデックス登録可能」と判定されること。

---

## 6. 変更ファイルまとめ

| ファイル | 変更 |
| --- | --- |
| `constants/majorCities.ts` | `MAJOR_CITY_SLUGS` / `isMajorCitySlug` を追加 |
| `app/result/[place]/page.tsx` | `generateMetadata` の `robots.index` を主要都市のみ true に |
| `app/robots.ts` | `/result/` Disallow ＋ 217 件 Allow（最長一致） |
| `app/sitemap.ts` | 主要都市 217 件を daily / priority 0.7 で追加 |
| （任意）`app/result/[place]/page.tsx` | `generateStaticParams` + `revalidate`（フェーズ2、座標直結後） |
