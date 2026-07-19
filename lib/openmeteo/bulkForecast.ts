import "server-only";

interface BulkUvMax {
  /** 入力地点と同じ並びの当日の日最大UV (欠損は null) */
  uvMax: (number | null)[];
  /** 対象日 "2026-07-19" (JST) */
  date: string;
}

const OPEN_METEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
// 1リクエスト最大1000地点まで可だが、GET URL 長の安全マージンと素直なキャッシュのため分割する。
const CHUNK_SIZE = 200;

/**
 * 複数地点の「当日の日最大UVインデックス」を Open-Meteo から一括取得する。
 * カンマ区切りで複数座標を渡すと地点ごとの結果が配列で返る (入力順を保持)。
 * 気象は1時間毎更新のため 1h キャッシュする (forecast.ts と同一方針)。
 */
export const fetchDailyUvMaxBulk = async (
  points: { lat: number; lon: number }[],
): Promise<BulkUvMax> => {
  const uvMax: (number | null)[] = [];
  let date = "";

  for (let i = 0; i < points.length; i += CHUNK_SIZE) {
    const chunk = points.slice(i, i + CHUNK_SIZE);
    const url = new URL(OPEN_METEO_ENDPOINT);
    url.searchParams.set("latitude", chunk.map((p) => p.lat).join(","));
    url.searchParams.set("longitude", chunk.map((p) => p.lon).join(","));
    url.searchParams.set("daily", "uv_index_max");
    url.searchParams.set("timezone", "Asia/Tokyo");
    url.searchParams.set("forecast_days", "1");

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`open_meteo_http_${res.status}`);

    // 複数地点は配列、単一地点はオブジェクトで返るため正規化する。
    const json = await res.json();
    const list: { daily?: { time?: string[]; uv_index_max?: number[] } }[] =
      Array.isArray(json) ? json : [json];

    // 位置ベースで対応付ける。返却数が入力数とズレても後続地点が連鎖的に
    // ズレないよう、チャンクごとに必ず chunk.length 個を push する。
    chunk.forEach((_, j) => {
      const daily = list[j]?.daily;
      const v = daily?.uv_index_max?.[0];
      uvMax.push(typeof v === "number" ? Math.round(v * 10) / 10 : null);
      if (!date && daily?.time?.[0]) date = daily.time[0];
    });
  }

  return { uvMax, date };
};
