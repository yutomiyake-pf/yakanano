import { FaCircleInfo } from "react-icons/fa6";

export const ForecastNotice = () => (
  <p className="text-base-content/50 mt-2 flex items-center gap-1.5 text-left text-xs">
    <FaCircleInfo className="shrink-0" />
    表示している値は予報およびキャッシュに基づく推定値です。実際の紫外線量とは異なる場合があります。
  </p>
);
