import { notFound } from "next/navigation";
import { UvResultSchema, type UvResult } from "@/app/api/uv/type";
import { serverFetcher } from "@/lib/fetcher/server";

interface Props {
  place: string;
  children: (result: UvResult) => React.ReactNode;
}

export const PageContainer = async ({ place, children }: Props) => {
  // 地名が見つからない / 取得失敗時は null を受けて 404 に落とす。
  const result = await serverFetcher(
    `/api/uv?place=${encodeURIComponent(place)}`,
    { schema: UvResultSchema, throwErr: false },
  );
  if (!result) notFound();

  return children(result);
};
