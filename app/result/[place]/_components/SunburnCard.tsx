import { FaClock, FaShieldHalved } from "react-icons/fa6";
import { calcSunburnTime, formatMinutes, getRiskLevel } from "@/lib/uv";

interface Props {
  uvMax: number;
  skin: number;
  spf: number;
}

export const SunburnCard = ({ uvMax, skin, spf }: Props) => {
  const risk = getRiskLevel(uvMax);
  const minutes = calcSunburnTime(uvMax, skin, spf);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="card bg-base-100 border-base-300 border">
        <div className="card-body gap-1">
          <div className="text-base-content/60 flex items-center gap-2 text-sm">
            <FaClock />
            日焼けするまでの目安
          </div>
          <div className="text-primary text-3xl font-bold">
            {minutes === null ? "日焼けしません" : `約 ${formatMinutes(minutes)}`}
          </div>
          <p className="text-base-content/60 text-xs">
            日最大UV {uvMax} ／ 選択したSPF{spf === 1 ? "なし" : spf} で計算
          </p>
        </div>
      </div>

      <div className="card bg-base-100 border-base-300 border">
        <div className="card-body gap-1">
          <div className="text-base-content/60 flex items-center gap-2 text-sm">
            <FaShieldHalved />
            推奨される対策
          </div>
          <div className="text-xl font-bold">{risk.recommendedSpf}</div>
          <p className="text-base-content/70 text-sm">{risk.advice}</p>
        </div>
      </div>
    </div>
  );
};
