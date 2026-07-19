import type { MetadataRoute } from "next";
import { MAJOR_CITY_SLUGS } from "@/constants/majorCities";
import { SITE_URL } from "@/constants/site";

export default function robots(): MetadataRoute.Robots {
  const allowCities = MAJOR_CITY_SLUGS.map(
    (slug) => `/result/${encodeURIComponent(slug)}`,
  );

  return {
    rules: [
      {
        userAgent: "*",
        // 最長一致で Allow が Disallow に勝つため、主要都市 (pref+name) だけクロール可能になり、
        // 任意入力による無限の /result/* はクロールバジェット保護のため引き続き遮断される。
        allow: ["/", ...allowCities],
        disallow: ["/api/", "/result/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
