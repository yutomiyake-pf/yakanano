"use client";

import { useState } from "react";
import type { UvDay } from "@/app/api/uv/type";
import { RiskBadge } from "@/app/_components/RiskBadge";
import { dayjs } from "@/lib/dayjs";
import { getRiskLevel } from "@/lib/uv";
import { SunburnCard } from "./SunburnCard";
import { UVHourlyChart } from "./UVHourlyChart";
import { UVHourlyTable } from "./UVHourlyTable";

interface Props {
  days: UvDay[];
  skin: number;
  spf: number;
}

const TAB_LABELS = ["今日", "明日", "明後日"];

// "2026-07-06" → "7月6日(日)" / "7/6"
const formatDate = (iso: string): string => dayjs(iso).format("M月D日(dd)");
const formatShortDate = (iso: string): string => dayjs(iso).format("M/D");

export const UVTabs = ({ days, skin, spf }: Props) => {
  const [active, setActive] = useState(0);
  const day = days[active];
  if (!day) return null;

  const risk = getRiskLevel(day.uvMax);

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" className="tabs tabs-box bg-base-100/80 flex-wrap">
        {days.map((d, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            className={`tab ${i === active ? "tab-active" : ""}`}
            onClick={() => setActive(i)}
          >
            {TAB_LABELS[i] ?? formatShortDate(d.date)}
          </button>
        ))}
      </div>

      <section className="card bg-base-100/80 border-base-300 border shadow-sm">
        <div className="card-body gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-base-content/60 text-sm">
                {formatDate(day.date)}
              </div>
              <div className="text-2xl font-bold">
                日最大UV指数 {day.uvMax}
              </div>
            </div>
            <RiskBadge risk={risk} size="lg" />
          </div>

          <SunburnCard uvMax={day.uvMax} skin={skin} spf={spf} />

          <div>
            <h2 className="mb-2 text-lg font-bold">1時間毎のUV推移</h2>
            <UVHourlyChart hourly={day.hourly} />
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">詳細データ</h2>
            <UVHourlyTable hourly={day.hourly} />
          </div>
        </div>
      </section>
    </div>
  );
};
