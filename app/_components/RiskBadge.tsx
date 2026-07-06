import type { RiskLevel } from "@/lib/uv";

interface Props {
  risk: RiskLevel;
  size?: "sm" | "md" | "lg";
}

const sizeClass: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-1.5",
};

// リスクレベルの色は設計書 §5 の5段階 (緑/黄/橙/赤/紫)。DaisyUI の badge 色では
// 5段階を表現しきれないため、uv.ts が持つ生の色をインラインで当てる。
export const RiskBadge = ({ risk, size = "md" }: Props) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full font-bold text-white ${sizeClass[size]}`}
    style={{ backgroundColor: risk.color }}
  >
    リスク{risk.label}
  </span>
);
