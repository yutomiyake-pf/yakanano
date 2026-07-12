import { z } from "zod";

// 表示に必要なリスク情報 (算定は API 側で実施済み)。
export const RiskSchema = z.object({
  key: z.enum(["low", "moderate", "high", "veryHigh", "extreme"]),
  label: z.string(),
  color: z.string(),
  recommendedSpf: z.string(),
  advice: z.string(),
});
export type Risk = z.infer<typeof RiskSchema>;

export const HourlyUvSchema = z.object({
  /** 時刻 (0〜23) */
  hour: z.number(),
  /** ラベル用 ISO 文字列 ("2026-07-06T13:00") */
  time: z.string(),
  uv: z.number(),
  /** その時刻の UV に対応するリスク (テーブルの色分け用) */
  riskLabel: z.string(),
  riskColor: z.string(),
  /** その時刻の天気カテゴリ (クライアントで key → アイコンを引く) */
  weatherKey: z.enum([
    "clear",
    "partlyCloudy",
    "cloudy",
    "fog",
    "rain",
    "snow",
    "thunder",
  ]),
  weatherLabel: z.string(),
});
export type HourlyUv = z.infer<typeof HourlyUvSchema>;

export const UvDaySchema = z.object({
  /** "2026-07-06" (JST) */
  date: z.string(),
  uvMax: z.number(),
  /** 日最大 UV に対応するリスク */
  risk: RiskSchema,
  /** 日焼けするまでの目安 (分)。UV=0 など日焼けしない場合は null */
  sunburnMinutes: z.number().nullable(),
  /** 上記を整形した表示文言 ("約 13時間53分" / "日焼けしません") */
  sunburnLabel: z.string(),
  /** 日中 (6〜18時) の1時間毎UV */
  hourly: z.array(HourlyUvSchema),
});
export type UvDay = z.infer<typeof UvDaySchema>;

export const UvResultSchema = z.object({
  /** ユーザーが入力した地名 */
  query: z.string(),
  /** Nominatim が解決した正式名称 (display_name) */
  displayName: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  /** 実際に適用した肌タイプ / SPF (不正入力はデフォルトに丸め済み) */
  skin: z.number(),
  spf: z.number(),
  /** 今日から7日分 (index 0 = 今日) */
  days: z.array(UvDaySchema),
});
export type UvResult = z.infer<typeof UvResultSchema>;
