import type { Metadata } from "next";
import { isMajorCitySlug } from "@/constants/majorCities";
import { PageComponent } from "./_components/PageComponent";
import { PageContainer } from "./_containers/PageContainer";

interface Props {
  params: Promise<{ place: string }>;
  searchParams: Promise<{ skin?: string; spf?: string }>;
}

// Next.js のルートセグメントはエンコードされたまま渡ってくるため一度デコードする
// (すでにデコード済み / 不正な場合でも壊れないよう try/catch)。
const decodePlace = (raw: string): string => {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const place = decodePlace((await params).place);
  return {
    title: `${place} の紫外線・日焼けリスク`,
    description: `${place} の今日から7日間の紫外線指数（UVインデックス）と、日焼けまでの時間・必要なSPFを判定します。紫外線に加え、熱中症（暑さ指数）の目安も確認できます。`,
    alternates: { canonical: `/result/${encodeURIComponent(place)}` },
    // 主要都市 (TOPランキングから遷移する pref+name) のみインデックス。
    // 任意入力の地名は無限に増えるためnoindex。
    robots: { index: isMajorCitySlug(place), follow: true },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const place = decodePlace((await params).place);
  const { skin, spf } = await searchParams;

  return (
    <PageContainer place={place} skin={skin} spf={spf}>
      {(result) => <PageComponent result={result} />}
    </PageContainer>
  );
}
