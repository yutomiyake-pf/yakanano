import type { UvResult } from "@/app/api/uv/type";
import { SKIN_TYPES } from "@/constants/uv";

const HASHTAGS = "#yakanano #紫外線チェック";

/** シェア本文 (URLは含めない。X は text と url を分けて渡すため)。 */
export const buildShareText = (result: UvResult): string => {
  const { query, skin, spf } = result;
  const skinLabel =
    SKIN_TYPES.find((t) => t.value === skin)?.short ?? `タイプ${skin}`;
  const spfLabel = spf === 1 ? "日焼け止めなし" : `SPF${spf}`;

  return `今日の${query}（${skinLabel}・${spfLabel}）の紫外線・日焼けリスク\n${HASHTAGS}`;
};

/** 受け取った人が同じ条件を再現できる skin/spf 付き絶対URL。 */
export const buildShareUrl = (siteUrl: string, result: UvResult): string =>
  `${siteUrl}/result/${encodeURIComponent(result.query)}?skin=${result.skin}&spf=${result.spf}`;
