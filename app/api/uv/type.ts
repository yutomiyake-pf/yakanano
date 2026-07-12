import { z } from "zod";

export const HourlyUvSchema = z.object({
  /** 時刻 (0〜23) */
  hour: z.number(),
  /** ラベル用 ISO 文字列 ("2026-07-06T13:00") */
  time: z.string(),
  uv: z.number(),
});
export type HourlyUv = z.infer<typeof HourlyUvSchema>;

export const UvDaySchema = z.object({
  /** "2026-07-06" (JST) */
  date: z.string(),
  uvMax: z.number(),
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
  /** 今日から7日分 (index 0 = 今日) */
  days: z.array(UvDaySchema),
});
export type UvResult = z.infer<typeof UvResultSchema>;
