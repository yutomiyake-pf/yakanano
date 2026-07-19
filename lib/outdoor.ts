export type OutdoorLevelKey =
  | "low"
  | "moderate"
  | "high"
  | "veryHigh"
  | "extreme";

export interface OutdoorLevel {
  key: OutdoorLevelKey;
  label: string;
  color: string;
}

const COLORS: Record<OutdoorLevelKey, string> = {
  low: "#22c55e",
  moderate: "#eab308",
  high: "#f97316",
  veryHigh: "#ef4444",
  extreme: "#a855f7",
};

/** 湿球温度・気温から WBGT(暑さ指数) を近似する (日陰想定: 0.7×湿球 + 0.3×気温)。 */
export const calcWbgt = (wetBulb: number, temp: number): number =>
  Math.round((0.7 * wetBulb + 0.3 * temp) * 10) / 10;

/** WBGT から熱中症区分を判定する (環境省「暑さ指数」5段階)。 */
export const getHeatLevel = (wbgt: number): OutdoorLevel => {
  if (wbgt >= 31) return { key: "extreme", label: "危険", color: COLORS.extreme };
  if (wbgt >= 28)
    return { key: "veryHigh", label: "厳重警戒", color: COLORS.veryHigh };
  if (wbgt >= 25) return { key: "high", label: "警戒", color: COLORS.high };
  if (wbgt >= 21)
    return { key: "moderate", label: "注意", color: COLORS.moderate };
  return { key: "low", label: "ほぼ安全", color: COLORS.low };
};
