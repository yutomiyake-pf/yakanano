import type { MetadataRoute } from "next";
import { MAJOR_CITY_SLUGS } from "@/constants/majorCities";
import { SITE_URL } from "@/constants/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const cities: MetadataRoute.Sitemap = MAJOR_CITY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/result/${encodeURIComponent(slug)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...cities,
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
