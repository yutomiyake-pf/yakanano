# yakanano

「今日、何分で日焼けする？」— 地域・肌タイプ・日焼け止めのSPFから、今日・明日・明後日の紫外線指数（UVインデックス）をもとに日焼けまでの時間と必要な対策を判定するサービス。

DB なし・認証なし・外部 API のみで動作する完全サーバーレス構成。

## 技術スタック

- Next.js 16 (App Router) / React 19
- Tailwind CSS 4 + DaisyUI 5（サニーテーマ）
- Recharts（UV推移グラフ）
- Nominatim (OpenStreetMap) — 地名 → 緯度経度
- Open-Meteo — 紫外線・気象データ

## 開発

```bash
npm install
npm run dev    # http://localhost:3000
npm run build
npm run lint
```

`.env.local` に `NEXT_PUBLIC_SITE_URL`（`serverFetcher` が自前 API を叩く際の絶対 URL のベース）を設定する。外部 API はすべて認証不要。

## クレジット

- 地名データ © OpenStreetMap contributors（ODbL）
- 気象データ Open-Meteo
