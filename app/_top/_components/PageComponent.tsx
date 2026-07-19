import { FaSun } from "react-icons/fa6";
import { AdBannerCarousel } from "@/app/_components/AdBannerCarousel";
import { InstallPrompt } from "@/app/_components/InstallPrompt";
import { SITE_TAGLINE } from "@/constants/site";
import { RankingContainer } from "../_containers/RankingContainer";
import { SearchForm } from "./SearchForm";
import { UvRankingList } from "./UvRankingList";

export const PageComponent = () => {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <AdBannerCarousel />

      <div className="text-center">
        <div className="text-primary mb-3 flex justify-center">
          <FaSun className="text-5xl" />
        </div>
        <h1 className="text-3xl font-bold">{SITE_TAGLINE}</h1>
        <p className="text-base-content/70 mt-3 text-sm">
          地域・肌タイプ・日焼け止めのSPFを入力するだけ。今日から7日間の紫外線指数から、日焼けまでの時間と必要な対策がわかります。
        </p>
      </div>

      <div className="card bg-base-100/80 border-base-300 border shadow-sm">
        <div className="card-body">
          <SearchForm />
        </div>
      </div>

      <RankingContainer>
        {(ranking) =>
          ranking && ranking.items.length > 0 ? (
            <UvRankingList ranking={ranking} />
          ) : null
        }
      </RankingContainer>

      <InstallPrompt />
    </div>
  );
};
