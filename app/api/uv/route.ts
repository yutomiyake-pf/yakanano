import { type NextRequest, NextResponse } from "next/server";
import { clampSkin, parseSpf } from "@/constants/uv";
import { geocodePlace } from "@/lib/nominatim/geocode";
import { fetchUvForecast } from "@/lib/openmeteo/forecast";
import { calcSunburnTime, formatMinutes, getRiskLevel } from "@/lib/uv";
import {
  UvResultSchema,
  type HourlyUv,
  type Risk,
  type UvDay,
  type UvResult,
} from "./type";

// 日中の表示範囲 (6時〜18時)。
const DAY_START_HOUR = 6;
const DAY_END_HOUR = 18;

const toRisk = (uvIndex: number): Risk => {
  const r = getRiskLevel(uvIndex);
  return {
    key: r.key,
    label: r.label,
    color: r.color,
    recommendedSpf: r.recommendedSpf,
    advice: r.advice,
  };
};

// Open-Meteo は daily(日付) と hourly(168件のフラット配列) を別々に返すため、
// フラットな hourly を日付ごとにまとめ直し、日中のみに絞り、リスク・日焼け時間まで
// 算定済みの UvDay[] に整形する (クライアントは表示するだけにする)。
const buildDays = (
  dates: string[],
  uvMax: number[],
  hourlyTimes: string[],
  hourlyUv: number[],
  skin: number,
  spf: number,
): UvDay[] =>
  // dates は 1 日 1 要素。i 番目の日付に対応する hourly / uvMax を組み立てる。
  dates.map((date, i) => {
    const hourly: HourlyUv[] = [];
    hourlyTimes.forEach((time, j) => {
      // hourly は全日分がフラットに並ぶので、この日付 ("2026-07-06") 始まりのものだけ拾う。
      if (!time.startsWith(date)) return;
      // "2026-07-06T13:00" の 11〜12 文字目 = 時 ("13")。日中 (6〜18時) 以外は除外。
      const hour = Number(time.slice(11, 13));
      if (hour < DAY_START_HOUR || hour > DAY_END_HOUR) return;
      // 同じ添字 j の UV 値を対応付け。小数第1位に丸める (欠損は 0 扱い)。
      const uv = Math.round((hourlyUv[j] ?? 0) * 10) / 10;
      const risk = getRiskLevel(uv);
      hourly.push({
        hour,
        time,
        uv,
        riskLabel: risk.label,
        riskColor: risk.color,
      });
    });

    const dailyMax = Math.round((uvMax[i] ?? 0) * 10) / 10;
    const sunburnMinutes = calcSunburnTime(dailyMax, skin, spf);
    return {
      date,
      uvMax: dailyMax,
      risk: toRisk(dailyMax),
      sunburnMinutes,
      sunburnLabel:
        sunburnMinutes === null
          ? "日焼けしません"
          : `約 ${formatMinutes(sunburnMinutes)}`,
      hourly,
    };
  });

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("place")?.trim();
  if (!query) {
    return NextResponse.json({ error: "place_required" }, { status: 400 });
  }

  // 不正・欠損時は必ずデフォルト (肌タイプ3 / SPF30) に丸める。
  const skin = clampSkin(params.get("skin"));
  const spf = parseSpf(params.get("spf"));

  const geo = await geocodePlace(query);
  if (!geo) {
    return NextResponse.json({ error: "place_not_found" }, { status: 404 });
  }

  const forecast = await fetchUvForecast(geo.latitude, geo.longitude);

  const res = {
    query,
    displayName: geo.displayName,
    latitude: geo.latitude,
    longitude: geo.longitude,
    skin,
    spf,
    days: buildDays(
      forecast.dailyDates,
      forecast.dailyUvMax,
      forecast.hourlyTimes,
      forecast.hourlyUv,
      skin,
      spf,
    ),
  };

  const parsed: UvResult = UvResultSchema.parse(res);

  return NextResponse.json(parsed);
}
