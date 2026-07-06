import { type NextRequest, NextResponse } from "next/server";
import { geocodePlace } from "@/lib/nominatim/geocode";
import { fetchUvForecast } from "@/lib/openmeteo/forecast";
import type { HourlyUv, UvDay, UvResult } from "./type";

// 日中の表示範囲 (6時〜18時)。設計書 §3.3 に準拠。
const DAY_START_HOUR = 6;
const DAY_END_HOUR = 18;

// 生の hourly (72件) を日付ごと・日中のみに整形する。
const buildDays = (
  dates: string[],
  uvMax: number[],
  hourlyTimes: string[],
  hourlyUv: number[],
): UvDay[] =>
  dates.map((date, i) => {
    const hourly: HourlyUv[] = [];
    hourlyTimes.forEach((time, j) => {
      if (!time.startsWith(date)) return;
      const hour = Number(time.slice(11, 13));
      if (hour < DAY_START_HOUR || hour > DAY_END_HOUR) return;
      hourly.push({ hour, time, uv: Math.round((hourlyUv[j] ?? 0) * 10) / 10 });
    });
    return {
      date,
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
