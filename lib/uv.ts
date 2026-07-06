// 日焼け時間計算とUVリスク判定の純粋ロジック。
// クライアント (SunburnCard) / サーバ (API Route) の双方から使うため server-only にしない。

/** 肌タイプ (Fitzpatrick Scale) 別の基準時間 (分) ※UV=1 のときに日焼けするまでの時間 */
const BASE_MINUTES: Record<number, number> = {
  1: 67, // 超白肌 (色白・そばかすあり)
  2: 100, // 白肌
  3: 200, // 普通
  4: 300, // やや濃い
  5: 400, // 濃い
  6: 500, // 非常に濃い
};

export const SKIN_TYPES = [
  { value: 1, label: "タイプ1 — 超白肌（すぐ赤くなり黒くならない）" },
  { value: 2, label: "タイプ2 — 白肌（赤くなりやすい）" },
  { value: 3, label: "タイプ3 — 普通（標準的な日本人の肌）" },
  { value: 4, label: "タイプ4 — やや濃い（赤くなりにくい）" },
  { value: 5, label: "タイプ5 — 濃い（ほとんど赤くならない）" },
  { value: 6, label: "タイプ6 — 非常に濃い（赤くならない）" },
] as const;

export const SPF_OPTIONS = [
  { value: 1, label: "使わない" },
  { value: 15, label: "SPF15" },
  { value: 30, label: "SPF30" },
  { value: 50, label: "SPF50" },
] as const;

/**
 * 日焼けするまでの時間 (分) を計算する。UV=0 のときは日焼けしないので null。
 * base(肌タイプ基準) / uvIndex * spf。
 */
export const calcSunburnTime = (
  uvIndex: number,
  skinType: number,
  spf = 1,
): number | null => {
  if (uvIndex <= 0) return null;
  const base = BASE_MINUTES[skinType] ?? 200;
  return Math.round((base / uvIndex) * spf);
};

export type RiskLevelKey = "low" | "moderate" | "high" | "veryHigh" | "extreme";

export interface RiskLevel {
  key: RiskLevelKey;
  label: string;
  /** バッジ / グラフで使う色 (Tailwind ではなく生の値。設計書の色分けに準拠) */
  color: string;
  recommendedSpf: string;
  advice: string;
}

const RISK_LEVELS: RiskLevel[] = [
  {
    key: "low",
    label: "低",
    color: "#22c55e",
    recommendedSpf: "SPF15以上",
    advice: "特別な対策は不要ですが、長時間の外出時は日焼け止めがあると安心です。",
  },
  {
    key: "moderate",
    label: "中",
    color: "#eab308",
    recommendedSpf: "SPF30以上",
    advice: "帽子・サングラスを活用しましょう。日焼け止めの塗布を推奨します。",
  },
  {
    key: "high",
    label: "高",
    color: "#f97316",
    recommendedSpf: "SPF50以上",
    advice: "日焼け止めは必須。日陰を活用し、こまめに塗り直しましょう。",
  },
  {
    key: "veryHigh",
    label: "非常に高い",
    color: "#ef4444",
    recommendedSpf: "SPF50+必須",
    advice: "11時〜15時の外出はできるだけ避けましょう。肌の露出を控えてください。",
  },
  {
    key: "extreme",
    label: "極端",
    color: "#a855f7",
    recommendedSpf: "SPF50+必須",
    advice: "できるだけ外出を避けてください。外出時は徹底した紫外線対策を。",
  },
];

/** UVインデックスからリスクレベルを判定する (設計書 §5 の基準)。 */
export const getRiskLevel = (uvIndex: number): RiskLevel => {
  if (uvIndex >= 11) return RISK_LEVELS[4];
  if (uvIndex >= 8) return RISK_LEVELS[3];
  if (uvIndex >= 6) return RISK_LEVELS[2];
  if (uvIndex >= 3) return RISK_LEVELS[1];
  return RISK_LEVELS[0];
};

/** 分を「◯時間◯分」表記に整形する。 */
export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes}分`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}時間` : `${h}時間${m}分`;
};
