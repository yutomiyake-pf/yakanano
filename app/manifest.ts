import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "../constants/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#fb923c",
    icons: [
      { src: "/icon-192x.png", type: "image/png", sizes: "192x192" },
      { src: "/icon-512x.png", type: "image/png", sizes: "512x512" },
    ],
  };
}
