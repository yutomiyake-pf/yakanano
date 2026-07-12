import type { IconType } from "react-icons";
import {
  WiCloudy,
  WiDayCloudy,
  WiDaySunny,
  WiFog,
  WiRain,
  WiSnow,
  WiThunderstorm,
} from "react-icons/wi";
import type { HourlyUv } from "@/app/api/uv/type";

type WeatherKey = HourlyUv["weatherKey"];

const ICONS: Record<WeatherKey, IconType> = {
  clear: WiDaySunny,
  partlyCloudy: WiDayCloudy,
  cloudy: WiCloudy,
  fog: WiFog,
  rain: WiRain,
  snow: WiSnow,
  thunder: WiThunderstorm,
};

const COLORS: Record<WeatherKey, string> = {
  clear: "#f59e0b",
  partlyCloudy: "#f59e0b",
  cloudy: "#94a3b8",
  fog: "#94a3b8",
  rain: "#3b82f6",
  snow: "#60a5fa",
  thunder: "#a855f7",
};

interface Props {
  weatherKey: WeatherKey;
  label: string;
  className?: string;
}

export const WeatherIcon = ({ weatherKey, label, className }: Props) => {
  const Icon = ICONS[weatherKey];
  return (
    <Icon
      className={className}
      style={{ color: COLORS[weatherKey] }}
      role="img"
      aria-label={label}
    />
  );
};
