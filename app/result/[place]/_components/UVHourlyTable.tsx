import type { HourlyUv } from "@/app/api/uv/type";
import { WeatherIcon } from "@/app/_components/WeatherIcon";

interface Props {
  hourly: HourlyUv[];
}

export const UVHourlyTable = ({ hourly }: Props) => (
  <div className="overflow-x-auto">
    <table className="table table-sm">
      <thead>
        <tr>
          <th>時刻</th>
          <th>UV指数</th>
          <th>リスク</th>
          <th>天気</th>
        </tr>
      </thead>
      <tbody>
        {hourly.map((h) => (
          <tr key={h.time}>
            <td>{h.hour}時</td>
            <td className="font-medium">{h.uv}</td>
            <td>
              <span
                className="inline-block h-2.5 w-2.5 rounded-full align-middle"
                style={{ backgroundColor: h.riskColor }}
              />
              <span className="ml-2 align-middle text-xs">{h.riskLabel}</span>
            </td>
            <td>
              <span className="inline-flex items-center gap-1">
                <WeatherIcon
                  weatherKey={h.weatherKey}
                  label={h.weatherLabel}
                  className="text-2xl"
                />
                <span className="align-middle text-xs">{h.weatherLabel}</span>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
