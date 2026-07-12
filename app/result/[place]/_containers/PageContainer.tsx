import { notFound } from "next/navigation";
import { UvResultSchema, type UvResult } from "@/app/api/uv/type";
import { serverFetcher } from "@/lib/fetcher/server";

interface Props {
  place: string;
  /** URL クエリ由来の生の値。バリデーションと算定は API 側に委ねる。 */
  skin?: string;
  spf?: string;
  children: (result: UvResult) => React.ReactNode;
}

export const PageContainer = async ({
  place,
  skin,
  spf,
  children,
}: Props) => {
  const query = new URLSearchParams({ place });
  if (skin) query.set("skin", skin);
  if (spf) query.set("spf", spf);

  const result = await serverFetcher(`/api/uv?${query.toString()}`, {
    schema: UvResultSchema,
    throwErr: false,
  });
  if (!result) notFound();

  return children(result);
};
