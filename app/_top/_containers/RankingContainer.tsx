import { UvRankingSchema, type UvRanking } from "@/app/api/uv/ranking/type";
import { serverFetcher } from "@/lib/fetcher/server";

interface Props {
  children: (ranking: UvRanking | null) => React.ReactNode;
}

/**
 * 全国UVランキングを取得する Container (データフェッチのみ)。
 * 失敗しても null を返し、トップページ全体は落とさない (ランキングは付加要素)。
 */
export const RankingContainer = async ({ children }: Props) => {
  const ranking = await serverFetcher("/api/uv/ranking", {
    schema: UvRankingSchema,
    throwErr: false,
    next: { revalidate: 3600 },
  });

  return children(ranking);
};
