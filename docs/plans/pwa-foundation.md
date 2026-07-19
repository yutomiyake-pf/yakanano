# PWA基盤 実装プラン（インストール可能にする / manifest強化 / インストール促進）

「ちゃんとインストールできるPWA」にするための基盤整備。
**オフライン対応・プッシュ通知・ローカル通知はスコープ外**（今回は不要）。
バックエンド不要な範囲に限定し、**DBなし・認証なしの方針を崩さない**。

---

## 1. スコープ

| やる | やらない |
| --- | --- |
| manifest 強化（maskable / scope / lang 等） | オフライン対応（キャッシュ戦略・offlineページ） |
| インストール促進（A2HS ボタン＋iOS手順） | プッシュ通知 / ローカル通知 |
| 最小 Service Worker（**Android のインストールプロンプト用のみ**・キャッシュしない） | バックグラウンド同期 |
| iOS 用メタ（standalone 表示） | 動的OG画像・その他機能 |

---

## 2. インストールに必要なもの（前提整理）

- **iOS Safari**：Service Worker **不要**。manifest ＋ `appleWebApp` メタで「共有 → ホーム画面に追加」でインストール可。
- **Android / Chrome**：manifest 要件を満たせばブラウザメニューから手動インストール可。
  ただし `beforeinstallprompt` による**自前インストールボタン（自動プロンプト）を出すには、登録済み Service Worker が必要**。
  → オフラインは要らないので、**キャッシュを一切しない最小 SW**を1つ置くだけでよい。

---

## 3. 現状

- `app/manifest.ts`：name / short_name / display=standalone / theme・背景色 / 192・512 アイコンのみ。`id`/`scope`/`lang`/maskable 未設定。
- **Service Worker：無し** → Android の自動インストールプロンプトが出にくい。
- `public/`：`icon-96x/180x/192x/512x.png`、`icon.svg` あり（**maskable 用の余白付きアイコンは無い**）。
- ビルドは **Turbopack**。PWA系依存なし。

---

## 4. 実装内容

### 4.1 最小 Service Worker（`public/sw.js`）

**キャッシュしない**。インストール可能条件を満たすためだけの空 SW。依存なし・Turbopack と無関係。

```js
// public/sw.js
// インストール可能条件を満たすための最小 SW。オフラインキャッシュは行わない。
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
// fetch ハンドラは無し（キャッシュしない）。将来オフライン対応する場合にここへ追加。
```

- 将来オフライン対応したくなったら、この SW に fetch ハンドラ＋キャッシュ戦略を足すだけで拡張できる。

### 4.2 SW 登録（クライアント）

`app/_components/ServiceWorkerRegister.tsx`（`"use client"`）を作り、`layout.tsx` の `<body>` 末尾で描画。
**本番のみ登録**（dev の HMR と衝突させない）。

```tsx
"use client";
import { useEffect } from "react";

export const ServiceWorkerRegister = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
};
```

### 4.3 manifest 強化（`app/manifest.ts`）

```ts
return {
  id: "/",
  name: `${SITE_NAME} — ${SITE_TAGLINE}`,
  short_name: SITE_NAME,
  description: SITE_DESCRIPTION,
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  lang: "ja",
  dir: "ltr",
  categories: ["health", "weather", "lifestyle"],
  background_color: "#ffffff",
  theme_color: "#fb923c",
  icons: [
    { src: "/icon-192x.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/icon-512x.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/icon-maskable-512x.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};
```

> `shortcuts` は入れない。深リンク先が `/`（＝アプリ起動と同じ）になり無意味なため。専用ページ（例 `/ranking`）を作った段階で検討する。

- **maskable アイコンの生成が必要**：`icon-maskable-512x.png` は周囲に約20%の余白（セーフゾーン）を持たせた版を用意する。既存512を `purpose: "any maskable"` に流用すると端が欠ける恐れがあるため専用画像が安全。
- `screenshots`（インストールUIをリッチに）は任意で後追い可。

### 4.4 iOS 対応（`app/layout.tsx` の metadata / viewport）

iOS Safari は `beforeinstallprompt` 非対応。standalone 表示のため metadata を追加:

```ts
// metadata に追記
appleWebApp: { capable: true, statusBarStyle: "default", title: SITE_NAME },
// viewport に追記
themeColor: "#fb923c",
```

（`apple-touch-icon` は既存の `icons.apple`（180x）で対応済み。）

### 4.5 インストール促進（`app/_components/InstallPrompt.tsx`）

- **Android / Chromium**：`beforeinstallprompt` を捕捉して既定バナーを抑止し、**自前の「ホーム画面に追加」ボタン**を表示。クリックで `prompt()`。
- **iOS Safari**：イベントが来ないので、iOS かつ非standalone のとき「共有 → ホーム画面に追加」の手順を小さく表示。
- 表示条件：既に standalone（`matchMedia('(display-mode: standalone)')`）なら非表示。「閉じる」で `localStorage` にフラグを持ち再表示しない。
- 配置：トップページ下部の控えめなバナー。`"use client"`。アイコンは react-icons。

```tsx
"use client";
import { useEffect, useState } from "react";

const DISMISS_KEY = "yakanano:installDismissed";

export const InstallPrompt = () => {
  const [deferred, setDeferred] = useState<Event | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    if (matchMedia("(display-mode: standalone)").matches) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible) return null;
  // 「ホーム画面に追加」ボタン（(deferred as BeforeInstallPromptEvent).prompt()）＋「閉じる」
};
```

- iOS 手順表示は別途、UA/`standalone` 判定で出し分け（同コンポーネント内でも可）。

---

## 5. 追加・変更ファイル一覧

| ファイル | 種別 | 役割 |
| --- | --- | --- |
| `public/sw.js` | 新規 | 最小 SW（キャッシュなし・インストール可能化のみ） |
| `public/icon-maskable-512x.png` | 新規（資産） | maskable 用 余白付きアイコン |
| `app/_components/ServiceWorkerRegister.tsx` | 新規（client） | 本番のみ SW 登録 |
| `app/_components/InstallPrompt.tsx` | 新規（client） | A2HS ボタン＋iOS手順 |
| `app/manifest.ts` | 変更 | scope/id/lang/orientation/maskable 等を追加 |
| `app/layout.tsx` | 変更 | `ServiceWorkerRegister` 描画、`appleWebApp`・`themeColor` 追加、`InstallPrompt` 配置 |

新規 npm 依存なし。**オフライン用の SW キャッシュ・`app/offline` ページは作らない**。

---

## 6. 注意点

- **DBなし・認証なし維持**：本フェーズは全てクライアント/静的で完結。
- **SW はキャッシュしない**：「更新が反映されない」事故が起きない。オフラインでは従来どおりネット依存（＝今回の要件どおり）。
- **dev では SW を登録しない**（本番のみ）。
- **HTTPS 必須**：SW/インストールは本番（https）で有効。localhost はセキュアコンテキスト扱いで prod ビルドをローカル確認可。
- **A8 広告・GA に影響なし**：SW は fetch を触らないため計測・バナーは素通り。
- **maskable アイコン**：セーフゾーン確保のため専用画像を用意（既存流用は欠け注意）。

---

## 7. 検証方法

1. `npm run build && npm run start`（本番モード）でローカル起動。
2. DevTools → Application:
   - **Manifest**：name/icons/maskable/scope が表示され Installability に警告が無いこと。
   - **Service Workers**：`/sw.js` が activated。
3. **インストール**：Chrome/Android で自前ボタン（`beforeinstallprompt`）または既定のインストールが出る。iOS Safari で手順表示。standalone 起動でアイコン・`theme_color` が反映。
4. **Lighthouse（Installable）**：Installable 要件を満たすこと（オフライン項目は対象外）。
5. `npm run lint` / `npm run build` が通ること。

---

## 8. 強制ルール整合

- `"use client"` は **SW登録・インストールプロンプト**のみ。SW 本体は `public/` の素の JS。
- UI は DaisyUI + Tailwind、アイコンは react-icons。
- サイト定数は `constants/site.ts` を参照（テーマ色・名称等）。
