# 結果ページの LINE / X シェアボタン 実装プラン

`/result/[place]` に **LINE** と **X（旧Twitter）** へのシェアボタンを追加し、
「今日の〇〇（地名）、肌タイプ・SPF〇〇で使ったときの日焼けリスク」をひとことメッセージ付きで
共有できるようにする。拡張機能案 §UX «シェア機能の強化» に対応（バイラル流入を狙う）。

- 共有される URL は **skin/spf 付き**にして、受け取った人も同じ条件の結果ページを見られるようにする。
- まずは「テキスト＋URL」共有。リッチな画像プレビュー（動的OG画像）は任意のフェーズ2。

---

## 1. 仕様

| 項目 | 内容 |
| --- | --- |
| 対象 | LINE / X（2ボタン）。任意で「OS共有（Web Share API）」ボタンを追加可 |
| 共有URL | `${SITE_URL}/result/${encodeURIComponent(query)}?skin=${skin}&spf=${spf}` |
| 共有テキスト | 「今日の〇〇、〇〇肌・SPF〇〇なら約〇分で日焼け⚠️ 紫外線リスクは【〇】 #yakanano #紫外線チェック」 |
| 配置 | 結果カード群の下部（`UVTabs` の後、`ForecastNotice` の前）に「この結果をシェア」ブロック |
| アイコン | `react-icons/fa6` の `FaLine` / `FaXTwitter`（確認済みで存在）。SVG直書き禁止（強制ルール⑨） |

> 補足: 結果ページは `noindex` だが、**OGメタ（title/description）はシェアのアンフォールドに使われるので有効**。robots の index 可否とは独立。

---

## 2. 共有テキストの設計

`UvResult` の `query` / `skin` / `spf` / `days[0]`（＝今日）から組み立てる。**純粋関数**として
`lib/share.ts` に置き（client/server どちらからも使えるよう server-only にしない）、テストしやすくする。

### 短縮ラベル
- 肌タイプは `constants/uv.ts` の `SKIN_TYPES` ラベルが長い（例: "タイプ3 — 普通（標準的な日本人の肌）"）ため、
  シェア用の短縮ラベルを用意する（`constants/uv.ts` に `short` を足すか、`lib/share.ts` にマップを持つ）。

  | skin | 短縮 |
  | --- | --- |
  | 1 | 超白肌 |
  | 2 | 白肌 |
  | 3 | 普通肌 |
  | 4 | やや濃い肌 |
  | 5 | 濃い肌 |
  | 6 | 非常に濃い肌 |

- SPF は `spf === 1` のとき「日焼け止めなし」、それ以外は `SPF${spf}`。

### テキスト生成（スケッチ）

```ts
// lib/share.ts
import type { UvResult } from "@/app/api/uv/type";

const SKIN_SHORT: Record<number, string> = {
  1: "超白肌", 2: "白肌", 3: "普通肌", 4: "やや濃い肌", 5: "濃い肌", 6: "非常に濃い肌",
};

const HASHTAGS = "#yakanano #紫外線チェック";

/** シェア本文（URLは含めない）。X は text と url を分けて渡すため。 */
export const buildShareText = (result: UvResult): string => {
  const { query, skin, spf, days } = result;
  const today = days[0];
  const skinLabel = SKIN_SHORT[skin] ?? `タイプ${skin}`;
  const spfLabel = spf === 1 ? "日焼け止めなし" : `SPF${spf}`;

  const body =
    today.sunburnMinutes === null
      ? `日焼けの心配は少なめ🙆 紫外線リスクは【${today.risk.label}】`
      : `${today.sunburnLabel}で日焼け⚠️ 紫外線リスクは【${today.risk.label}】`;

  return `今日の${query}、${skinLabel}・${spfLabel}なら${body}\n${HASHTAGS}`;
};

/** 受け取った人が同じ条件を再現できる skin/spf 付き絶対URL。 */
export const buildShareUrl = (siteUrl: string, result: UvResult): string =>
  `${siteUrl}/result/${encodeURIComponent(result.query)}?skin=${result.skin}&spf=${result.spf}`;
```

生成例:
> 今日の鹿児島県奄美市、普通肌・SPF30なら約 28分で日焼け⚠️ 紫外線リスクは【非常に高い】
> #yakanano #紫外線チェック

---

## 3. 各サービスのシェアリンク仕様

いずれも `<a href target="_blank" rel="noopener noreferrer">` で開くだけ（クライアントJS不要）。

### X（旧Twitter）
```
https://twitter.com/intent/tweet?text={enc(shareText)}&url={enc(shareUrl)}
```
- `text` と `url` を分けて渡す（X が末尾に URL を付与）。`twitter.com/intent/tweet` は現行も有効で x.com へリダイレクトされる。

### LINE
```
https://line.me/R/msg/text/?{enc(shareText + "\n" + shareUrl)}
```
- LINE アプリを開いて**本文（テキスト＋URL）をプリフィル**。URL は LINE 側で OG アンフォールドされ、
  カスタムメッセージと URL プレビューの両方が入る（ユーザー要望「〇〇の肌タイプで…」を満たす）。
- 代替: `https://social-plugins.line.me/lineit/share?url={enc(shareUrl)}`（URLのみ・OG依存でテキスト不可）。
  → カスタム文言を出したいので **`line.me/R/msg/text/` を採用**。

### （任意）OS ネイティブ共有
- `navigator.share({ text: shareText, url: shareUrl })` を使う「共有」ボタン。モバイルのシェアシートが出る。
  これだけ `"use client"` が必要。未対応環境では非表示にする。フェーズ1では省略可。

---

## 4. コンポーネント設計（4層分離）

- **`ShareButtons.tsx`（Leaf・Server Component）**: 受け取った `shareUrl` / `text` から X・LINE の
  `<a>` を描画するだけ。副作用なし・`"use client"` 不要（強制ルール⑥「Server Component を既定」）。
- テキスト/URL の組み立ては `lib/share.ts` の純粋関数。`SITE_URL` は `constants/site.ts` から。
- 配置は結果ページの **PageComponent**（UIルート）で `buildShareText` / `buildShareUrl` を呼び、
  `ShareButtons` に渡す。

```tsx
// app/result/[place]/_components/ShareButtons.tsx
import { FaLine, FaXTwitter } from "react-icons/fa6";

interface Props {
  shareUrl: string;
  text: string;
}

export const ShareButtons = ({ shareUrl, text }: Props) => {
  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
  const line = `https://line.me/R/msg/text/?${encodeURIComponent(`${text}\n${shareUrl}`)}`;

  return (
    <section aria-label="この結果をシェア" className="flex flex-col items-center gap-2">
      <p className="text-base-content/60 text-sm">この結果をシェア</p>
      <div className="flex gap-3">
        <a
          href={line}
          target="_blank"
          rel="noopener noreferrer"
          className="btn gap-2 text-white"
          style={{ backgroundColor: "#06C755" }} // LINE ブランドカラー
        >
          <FaLine className="text-lg" /> LINE
        </a>
        <a
          href={x}
          target="_blank"
          rel="noopener noreferrer"
          className="btn gap-2 bg-black text-white hover:bg-neutral-800"
        >
          <FaXTwitter className="text-lg" /> ポスト
        </a>
      </div>
    </section>
  );
};
```

```tsx
// app/result/[place]/_components/PageComponent.tsx （抜粋）
import { SITE_URL } from "@/constants/site";
import { buildShareText, buildShareUrl } from "@/lib/share";
import { ShareButtons } from "./ShareButtons";

// ...UVTabs の後、ForecastNotice の前あたりに:
<ShareButtons
  shareUrl={buildShareUrl(SITE_URL, result)}
  text={buildShareText(result)}
/>
```

---

## 5. 実装ファイルまとめ

| ファイル | 変更 |
| --- | --- |
| `lib/share.ts` | 新規。`buildShareText` / `buildShareUrl`（純粋・client/server 共用、server-only にしない） |
| `app/result/[place]/_components/ShareButtons.tsx` | 新規。X・LINE の共有リンク（Server Leaf） |
| `app/result/[place]/_components/PageComponent.tsx` | 変更。`ShareButtons` を描画 |
| `constants/uv.ts`（任意） | 肌タイプ短縮ラベルを持たせる場合。持たせないなら `lib/share.ts` 内マップで完結 |

新規依存なし（アイコンは既存 react-icons）。

---

## 6. 任意フェーズ2: 結果ページ専用の動的OG画像（シェアを見栄えよく）

`app/result/[place]/opengraph-image.tsx` を追加し、地名・今日のUV指数・リスク（色）・日焼け時間を
描いた OG 画像を動的生成する。既存の `app/opengraph-image.tsx` と `lib/og.ts`（Noto Sans JP subset）を流用可能。

- 効果: LINE/X のアンフォールドで結果がビジュアルに伝わり、クリック率・拡散が上がる。
- 注意: skin/spf は searchParams。OG画像の `size`/`alt` と、UVリスク色（`lib/uv.ts` の生の色）を使う。
- 結果ページは noindex だが OG 画像はシェアで有効。フェーズ1（ボタン）だけでも成立するので別PR推奨。

---

## 7. 注意点

- **URL は必ず skin/spf 付き**。ランキング/canonical は param 無しだが、シェアは「その人の条件」を再現したいので付与する（canonical が正規化するので重複インデックス問題は起きない。かつ結果ページは noindex）。
- **エンコード**：`encodeURIComponent` を text・url 双方に適用。改行 `\n` も含めて LINE 側でエンコード。
- **`rel="noopener noreferrer"` + `target="_blank"`**：外部遷移の安全確保。
- **ブランド配色**：LINE は緑 `#06C755`、X は黒。ブランドガイドライン準拠（DaisyUI では出せない色は生の値で指定＝強制ルール④の考え方と一致）。
- **絵文字**：⚠️🙆 等は環境により表示差があるが、テキスト共有では概ね問題なし。過剰にしない。
- **文字数**：X は URL を23字固定換算。本文＋ハッシュタグは長すぎない範囲に（地名が長い政令市の区名でも収まる想定）。

---

## 8. 検証方法

1. `npm run build` / `npm run lint`。
2. 結果ページ `/result/鹿児島県奄美市?skin=1&spf=50` を開き、LINE/X ボタンが表示されること。
3. X ボタンの `href` をデコードし、`text`（今日の…／リスク／ハッシュタグ）と `url`（skin/spf付き）が正しいこと。
4. LINE ボタンの `href` をデコードし、本文＋URL がプリフィルされること。
5. 生成テキストの分岐: `spf=1`（「日焼け止めなし」）、`sunburnMinutes===null`（「日焼けの心配は少なめ」）が正しく出ること。
6. （実機）モバイルで X/LINE アプリが起動し、本文とURLが入ること。
