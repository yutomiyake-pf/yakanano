import Link from "next/link";
import { FaCircleInfo, FaFireFlameCurved } from "react-icons/fa6";
import { RiskBadge } from "@/app/_components/RiskBadge";
import type { UvRanking } from "@/app/api/uv/ranking/type";
import { MAJOR_CITIES_CRITERIA } from "@/constants/majorCities";

interface Props {
  ranking: UvRanking;
}

const medalColor: Record<number, string> = {
  1: "#f59e0b",
  2: "#9ca3af",
  3: "#b45309",
};

export const UvRankingList = ({ ranking }: Props) => (
  <section
    aria-labelledby="uv-ranking-heading"
    className="card bg-base-100/80 border-base-300 border shadow-sm"
  >
    <div className="card-body gap-4">
      <div>
        <h2
          id="uv-ranking-heading"
          className="flex items-center gap-2 text-lg font-bold"
        >
          <FaFireFlameCurved className="text-primary" />
          今日の全国UVランキング
          <span
            className="tooltip tooltip-bottom text-base-content/40 [&::before]:max-w-40! [&::before]:text-xs! [&::before]:font-normal [&::before]:whitespace-normal [&::before]:leading-snug"
            data-tip={MAJOR_CITIES_CRITERIA}
          >
            <FaCircleInfo
              aria-label={MAJOR_CITIES_CRITERIA}
              className="text-sm"
            />
          </span>
        </h2>
        <p className="text-base-content/60 mt-1 text-xs">
          {ranking.date} 時点 ／ 全国の主要都市を紫外線が強い順に表示
        </p>
      </div>

      <ol className="divide-base-300/70 divide-y">
        {ranking.items.map((item) => (
          <li key={`${item.pref}-${item.name}`}>
            <Link
              href={`/result/${encodeURIComponent(`${item.pref}${item.name}`)}`}
              className="hover:bg-base-200/60 -mx-2 flex items-center gap-3 rounded-md px-2 py-2 transition-colors"
            >
              <span
                className="w-6 shrink-0 text-center text-sm font-bold tabular-nums"
                style={{ color: medalColor[item.rank] }}
              >
                {item.rank}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="text-base-content/50 ml-1 text-xs">
                  {item.pref}
                </span>
              </span>
              <span className="shrink-0 font-mono text-sm font-bold tabular-nums">
                {item.uvMax.toFixed(1)}
              </span>
              <RiskBadge risk={item.risk} size="sm" />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
