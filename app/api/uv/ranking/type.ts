import { z } from "zod";
import { RiskSchema } from "@/app/api/uv/type";

export const RankingItemSchema = z.object({
  /** 順位 (1 始まり) */
  rank: z.number(),
  /** 市区町村名 "那覇市" */
  name: z.string(),
  /** 都道府県 "沖縄県" */
  pref: z.string(),
  /** 当日の日最大UVインデックス */
  uvMax: z.number(),
  /** 日最大UVに対応するリスク (バッジの色・ラベル用) */
  risk: RiskSchema,
});
export type RankingItem = z.infer<typeof RankingItemSchema>;

export const UvRankingSchema = z.object({
  /** 対象日 "2026-07-19" (JST) */
  date: z.string(),
  /** UV が強い順の上位ランキング */
  items: z.array(RankingItemSchema),
});
export type UvRanking = z.infer<typeof UvRankingSchema>;
