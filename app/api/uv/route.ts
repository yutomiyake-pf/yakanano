import { type NextRequest, NextResponse } from "next/server";
import { geocodePlace } from "@/lib/nominatim/geocode";
import { fetchUvForecast } from "@/lib/openmeteo/forecast";
import type { HourlyUv, UvDay, UvResult } from "./type";

// 日中の表示範囲 (6時〜18時)。
const DAY_START_HOUR = 6;
const DAY_END_HOUR = 18;

// Open-Meteo は daily(日付) と hourly(168件のフラット配列) を別々に返すため、
// フラットな hourly を日付ごとにまとめ直し、日中のみに絞った UvDay[] に整形する。
const buildDays = (
  dates: string[],
  uvMax: number[],
  hourlyTimes: string[],
  hourlyUv: number[],
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
      hourly.push({ hour, time, uv: Math.round((hourlyUv[j] ?? 0) * 10) / 10 });
    });
    return {
      date,
      // 日最大 UV も同じく小数第1位に丸める。
      uvMax: Math.round((uvMax[i] ?? 0) * 10) / 10,
      hourly,
    };
  });

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("place")?.trim();
  if (!query) {
    return NextResponse.json({ error: "place_required" }, { status: 400 });
  }

  const geo = await geocodePlace(query);
  if (!geo) {
    return NextResponse.json({ error: "place_not_found" }, { status: 404 });
  }

  const forecast = await fetchUvForecast(geo.latitude, geo.longitude);

  return NextResponse.json<UvResult>({
    query,
    displayName: geo.displayName,
    latitude: geo.latitude,
    longitude: geo.longitude,
    days: buildDays(
      forecast.dailyDates,
      forecast.dailyUvMax,
      forecast.hourlyTimes,
      forecast.hourlyUv,
    ),
  });
}
