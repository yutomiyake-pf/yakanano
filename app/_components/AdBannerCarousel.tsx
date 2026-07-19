"use client";

/* eslint-disable @next/next/no-img-element */
// A8 バナーは規約上リサイズ・最適化不可のため next/image を使わず生 <img> をネイティブ寸法で表示する。
// 計測ピクセル(0.gif)を同時に読み込ませてインプレッションを成立させる。
import { useEffect, useRef } from "react";
import { AD_BANNERS } from "@/constants/ads";

// 手動スワイプのまま無限ループさせるため、同一バナー列を3セット複製して中央セットから開始し、
// 端に近づいたら1セット幅ぶん静かにスクロール位置をずらす (内容が同一なので継ぎ目が見えない)。
const SETS = [0, 1, 2];

export const AdBannerCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // 2番目のセットと1番目のセットの左位置の差 = 1セット幅 + 間隔 = 継ぎ目なくループする移動量。
    const loopWidth = () => {
      const c0 = el.children[0] as HTMLElement | undefined;
      const c1 = el.children[1] as HTMLElement | undefined;
      if (!c0 || !c1) return 0;
      return c1.offsetLeft - c0.offsetLeft;
    };

    // 中央セットから開始し、左右どちらにも無限にスクロールできるようにする。
    el.scrollLeft = loopWidth();

    const onScroll = () => {
      const w = loopWidth();
      if (!w) return;
      if (el.scrollLeft < w) el.scrollLeft += w;
      else if (el.scrollLeft >= 2 * w) el.scrollLeft -= w;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (AD_BANNERS.length === 0) return null;

  return (
    <section aria-label="広告" className="mb-6">
      <p className="text-base-content/50 mb-2 text-xs">広告</p>

      <div
        ref={scrollRef}
        className="flex w-full max-w-full gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SETS.map((s) => (
          <div key={s} className="flex shrink-0 gap-4" aria-hidden={s !== 0}>
            {AD_BANNERS.map((banner, i) => (
              <a
                key={`${s}-${i}`}
                href={banner.href}
                target="_blank"
                rel="sponsored nofollow noopener"
                className="shrink-0"
                // 複製セットはスクリーンリーダー・タブ移動の重複を避ける。
                tabIndex={s !== 0 ? -1 : undefined}
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
        ))}
      </div>

      {/* インプレッション計測ピクセル (1セットのみ・複製で二重計測しない) */}
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
