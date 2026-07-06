import type { HourlyUv } from "@/app/api/uv/type";
import { getRiskLevel } from "@/lib/uv";

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
        </tr>
      </thead>
      <tbody>
        {hourly.map((h) => {
          const risk = getRiskLevel(h.uv);
          return (
            <tr key={h.time}>
              <td>{h.hour}時</td>
              <td className="font-medium">{h.uv}</td>
              <td>
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full align-middle"
                  style={{ backgroundColor: risk.color }}
                />
                <span className="ml-2 align-middle text-xs">{risk.label}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
