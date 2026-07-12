import type { Risk } from "@/app/api/uv/type";

interface Props {
  risk: Risk;
  size?: "sm" | "md" | "lg";
}

const sizeClass: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-1.5",
};

export const RiskBadge = ({ risk, size = "md" }: Props) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full font-bold text-white ${sizeClass[size]}`}
    style={{ backgroundColor: risk.color }}
  >
    リスク{risk.label}
  </span>
);
