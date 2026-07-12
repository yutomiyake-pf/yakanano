import "server-only";

// WMO 天気コード (Open-Meteo の weather_code) を、表示用の少数カテゴリに正規化する。
// アイコン自体はクライアント側で key から引く (ここでは分類とラベルのみ)。
// コード表: https://open-meteo.com/en/docs (WMO Weather interpretation codes)

export type WeatherKey =
  | "clear"
  | "partlyCloudy"
  | "cloudy"
  | "fog"
  | "rain"
  | "snow"
  | "thunder";

export interface Weather {
  key: WeatherKey;
  label: string;
}

const WEATHER: Record<WeatherKey, Weather> = {
  clear: { key: "clear", label: "晴れ" },
  partlyCloudy: { key: "partlyCloudy", label: "晴れ時々曇り" },
  cloudy: { key: "cloudy", label: "曇り" },
  fog: { key: "fog", label: "霧" },
  rain: { key: "rain", label: "雨" },
  snow: { key: "snow", label: "雪" },
  thunder: { key: "thunder", label: "雷" },
};

export const getWeather = (code: number): Weather => {
  // 快晴〜晴れ
  if (code === 0 || code === 1) return WEATHER.clear;
  // 一部曇り
  if (code === 2) return WEATHER.partlyCloudy;
  // 曇り
  if (code === 3) return WEATHER.cloudy;
  // 霧
  if (code === 45 || code === 48) return WEATHER.fog;
  // 雷 (雹を伴うものを含む)
  if (code >= 95) return WEATHER.thunder;
  // 雪・雪あられ・にわか雪 (71〜77, 85〜86)
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return WEATHER.snow;
  // 霧雨・雨・凍雨・にわか雨 (51〜67, 80〜82)
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
    return WEATHER.rain;
  // 未知コードは曇り扱い (安全側)
  return WEATHER.cloudy;
};
