import { FaClock, FaShieldHalved, FaTriangleExclamation } from "react-icons/fa6";
import type { UvDay } from "@/app/api/uv/type";

interface Props {
  day: UvDay;
  spf: number;
}

export const SunburnCard = ({ day, spf }: Props) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card bg-base-100 border-base-300 border">
          <div className="card-body gap-1">
            <div className="text-base-content/60 flex items-center gap-2 text-sm">
              <FaClock />
              日焼けするまでの目安
            </div>
            <div className="text-primary text-3xl font-bold">
              {day.sunburnLabel}
            </div>
            <p className="text-base-content/60 text-xs">
              日最大UV {day.uvMax} ／ 選択したSPF{spf === 1 ? "なし" : spf} で計算
            </p>
          </div>
        </div>

        <div className="card bg-base-100 border-base-300 border">
          <div className="card-body gap-1">
            <div className="text-base-content/60 flex items-center gap-2 text-sm">
              <FaShieldHalved />
              推奨される対策
            </div>
            <div className="text-xl font-bold">{day.risk.recommendedSpf}</div>
            <p className="text-base-content/70 text-sm">{day.risk.advice}</p>
          </div>
        </div>
      </div>

      <p className="text-base-content/60 flex items-start gap-1.5 text-xs">
        <FaTriangleExclamation className="mt-0.5 shrink-0" />
        <span>
          この時間は簡易的な計算式による目安で、この時間まで日焼けしないことを保証するものではありません。実際の日焼け止めの効果は塗布量・汗・こすれ等でラベルのSPFより低下し、標高・照り返し・累積の紫外線量によっても変わります。早めの塗り直しと、より高い防御を心がけてください。
        </span>
      </p>
    </div>
  );
};
