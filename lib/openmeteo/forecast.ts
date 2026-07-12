import "server-only";

interface UvForecast {
  /** ["2026-07-06", ...] JST 日付 (7日分) */
  dailyDates: string[];
  /** dailyDates と同じ並びの日最大UVインデックス */
  dailyUvMax: number[];
  /** ["2026-07-06T00:00", ...] 1時間毎 (168件) */
  hourlyTimes: string[];
  /** hourlyTimes と同じ並びのUVインデックス */
  hourlyUv: number[];
}

const OPEN_METEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

/**
 * 緯度・経度から7日間・1時間毎のUVインデックス予報を取得する (Open-Meteo)。
 * 気象データは1時間毎に更新されるため 1h キャッシュする。
 */
export const fetchUvForecast = async (
  latitude: number,
  longitude: number,
): Promise<UvForecast> => {
  const url = new URL(OPEN_METEO_ENDPOINT);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("hourly", "uv_index");
  url.searchParams.set("daily", "uv_index_max");
  url.searchParams.set("timezone", "Asia/Tokyo");
  url.searchParams.set("forecast_days", "7");

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`open_meteo_http_${res.status}`);

  const json: {
    hourly: { time: string[]; uv_index: number[] };
    daily: { time: string[]; uv_index_max: number[] };
  } = await res.json();

  return {
    dailyDates: json.daily.time,
    dailyUvMax: json.daily.uv_index_max,
    hourlyTimes: json.hourly.time,
    hourlyUv: json.hourly.uv_index,
  };
};
