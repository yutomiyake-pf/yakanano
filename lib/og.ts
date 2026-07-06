import "server-only";

// OG 画像で使う日本語 + ASCII をあらかじめ列挙し、Google Fonts の subset で一括取得する。
// 全 OG 画像が同じ subset を再利用するため CDN 側のキャッシュヒット率が上がる。
const OG_FONT_TEXT =
  "yakanai今日何分で日焼けする？紫外線指数UVリスク低中高非常極端SPF分対策" +
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" +
  " !\"#$%&'()*+,-./:;<=>?@[]^_`{|}~";

let cachedFont: ArrayBuffer | null = null;

// Google Fonts CSS API は User-Agent により woff2 / ttf を出し分けるので、
// 古めの UA を送って satori が扱いやすい ttf を強制的に返してもらう。
const LEGACY_UA =
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.0.0 Safari/537.36";

export const loadOgFont = async (): Promise<ArrayBuffer> => {
  if (cachedFont) return cachedFont;

  const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(OG_FONT_TEXT)}`;
  const css = await fetch(cssUrl, { headers: { "User-Agent": LEGACY_UA } }).then(
    (r) => r.text(),
  );

  const match = css.match(/src:\s*url\((https:\/\/[^)]+)\)/);
  if (!match) throw new Error("og_font_url_not_found");

  const fontData = await fetch(match[1]).then((r) => r.arrayBuffer());
  cachedFont = fontData;
  return fontData;
};

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;

// 日差しを感じさせる暖色グラデーション背景 (サイトテーマに合わせる)
export const OG_BG =
  "linear-gradient(135deg, #fb923c 0%, #fbbf24 55%, #fde68a 100%)";
