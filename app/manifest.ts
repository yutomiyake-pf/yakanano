import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "../constants/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "ja",
    dir: "ltr",
    categories: ["health", "weather", "lifestyle"],
    background_color: "#ffffff",
    theme_color: "#fb923c",
    icons: [
      { src: "/icon-192x.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512x.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512x.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
