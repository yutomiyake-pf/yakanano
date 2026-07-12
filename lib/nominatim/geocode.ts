import "server-only";
import { SITE_NAME, SITE_URL } from "@/constants/site";

interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

/**
 * 日本語地名を緯度・経度に変換する (Nominatim / OpenStreetMap)。
 * 見つからない場合は null。
 * 地名の座標は不変かつ 1req/s のレート制限があるため 24h キャッシュする。
 */
export const geocodePlace = async (
  query: string,
): Promise<GeocodeResult | null> => {
  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("accept-language", "ja");
  url.searchParams.set("countrycodes", "jp");

  const res = await fetch(url, {
    headers: {
      // Nominatim の利用規約上、識別可能な User-Agent が必須。
      "User-Agent": `${SITE_NAME}/1.0 (${SITE_URL})`,
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) throw new Error(`nominatim_http_${res.status}`);

  const places = await res.json();
  const place = places[0];
  if (!place) return null;

  return {
    latitude: Number(place.lat),
    longitude: Number(place.lon),
    displayName: place.display_name,
  };
};
