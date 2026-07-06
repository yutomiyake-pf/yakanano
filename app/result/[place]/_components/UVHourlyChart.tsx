"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HourlyUv } from "@/app/api/uv/type";

interface Props {
  hourly: HourlyUv[];
}

export const UVHourlyChart = ({ hourly }: Props) => {
  const data = hourly.map((h) => ({ label: `${h.hour}時`, uv: h.uv }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(91% 0.07 75)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "currentColor" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12, fill: "currentColor" }}
            allowDecimals={false}
            domain={[0, "auto"]}
          />
          <Tooltip
            formatter={(v) => [`${v}`, "UV指数"]}
            contentStyle={{
              borderRadius: "0.5rem",
              border: "1px solid oklch(91% 0.07 75)",
              fontSize: "0.8rem",
            }}
          />
          <Line
            type="monotone"
            dataKey="uv"
            stroke="#f97316"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#f97316" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
