import type { Metadata } from "next";
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

const clampSkin = (raw?: string): number => {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 6 ? n : 3;
};

const parseSpf = (raw?: string): number => {
  const n = Number(raw);
  return [1, 15, 30, 50].includes(n) ? n : 30;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const place = decodePlace((await params).place);
  return {
    title: `${place} の紫外線・日焼けリスク`,
    description: `${place} の今日・明日・明後日の紫外線指数（UVインデックス）と、日焼けまでの時間・必要なSPFを判定します。`,
    alternates: { canonical: `/result/${encodeURIComponent(place)}` },
    // 地名の組み合わせは無限にあるため重複インデックスを防ぐ。
    robots: { index: false, follow: true },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const place = decodePlace((await params).place);
  const { skin, spf } = await searchParams;

  return (
    <PageContainer place={place}>
      {(result) => (
        <PageComponent
          result={result}
          skin={clampSkin(skin)}
          spf={parseSpf(spf)}
        />
      )}
    </PageContainer>
  );
}
