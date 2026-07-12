/* eslint-disable @next/next/no-img-element */
// A8 バナーは規約上リサイズ・最適化不可のため next/image を使わず生 <img> をネイティブ寸法で表示する。
// 計測ピクセル(0.gif)を同時に読み込ませてインプレッションを成立させる。
import { AD_BANNERS } from "@/constants/ads";

export const AdBannerCarousel = () => {
  if (AD_BANNERS.length === 0) return null;

  return (
    <section aria-label="広告" className="mb-6">
      <p className="text-base-content/50 mb-2 text-xs">広告</p>

      <div className="carousel carousel-center w-full max-w-full items-center gap-4">
        {AD_BANNERS.map((banner) => (
          <a
            key={banner.href}
            href={banner.href}
            target="_blank"
            rel="sponsored nofollow noopener"
            className="carousel-item"
          >
            <img
              src={banner.imgSrc}
              alt="広告"
              width={banner.width}
              height={banner.height}
              className="block h-[200px] w-auto max-w-none rounded"
            />
          </a>
        ))}
      </div>

      {/* インプレッション計測ピクセル (表示されないが読み込ませる) */}
      <div aria-hidden="true" className="sr-only">
        {AD_BANNERS.map((banner) => (
          <img
            key={banner.pixelSrc}
            src={banner.pixelSrc}
            width={1}
            height={1}
            alt=""
          />
        ))}
      </div>
    </section>
  );
};
