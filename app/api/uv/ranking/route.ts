import { NextResponse } from "next/server";
import { MAJOR_CITIES } from "@/constants/majorCities";
import { fetchDailyUvMaxBulk } from "@/lib/openmeteo/bulkForecast";
import { getRiskLevel } from "@/lib/uv";
import { UvRankingSchema, type RankingItem } from "./type";

const TOP_N = 30;

export async function GET() {
  const { uvMax, date } = await fetchDailyUvMaxBulk(
    MAJOR_CITIES.map((m) => ({ lat: m.lat, lon: m.lon })),
  );

  const items = MAJOR_CITIES.map((city, i) => ({ city, uv: uvMax[i] }))
    .filter((x): x is { city: (typeof MAJOR_CITIES)[number]; uv: number } => {
      return x.uv !== null;
    })
    // 同値は配列 (= データ定義) 順で安定させる。
    .sort((a, b) => b.uv - a.uv)
    .slice(0, TOP_N)
    .map((x, idx): RankingItem => {
      const r = getRiskLevel(x.uv);
      return {
        rank: idx + 1,
        name: x.city.name,
        pref: x.city.pref,
        uvMax: x.uv,
        risk: {
          key: r.key,
          label: r.label,
          color: r.color,
          recommendedSpf: r.recommendedSpf,
          advice: r.advice,
        },
      };
    });

  const parsed = UvRankingSchema.parse({ date, items });
  return NextResponse.json(parsed);
}
