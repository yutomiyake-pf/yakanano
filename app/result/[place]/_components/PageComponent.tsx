import Link from "next/link";
import { FaArrowLeft, FaLocationDot } from "react-icons/fa6";
import type { UvResult } from "@/app/api/uv/type";
import { ForecastNotice } from "@/app/_components/ForecastNotice";
import { UVTabs } from "./UVTabs";

interface Props {
  result: UvResult;
  skin: number;
  spf: number;
}

export const PageComponent = ({ result, skin, spf }: Props) => (
  <div className="mx-auto flex max-w-3xl flex-col gap-6">
    <div>
      <Link
        href="/"
        className="link link-hover inline-flex items-center gap-1 text-sm"
      >
        <FaArrowLeft />
        地名を変えて調べる
      </Link>
      <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold">
        <FaLocationDot className="text-primary" />
        {result.query}
      </h1>
      <p className="text-base-content/60 mt-1 text-xs">{result.displayName}</p>
    </div>

    <UVTabs days={result.days} skin={skin} spf={spf} />

    <ForecastNotice />
  </div>
);
