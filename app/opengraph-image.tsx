import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/constants/site";
import { OG_BG, OG_CONTENT_TYPE, OG_SIZE, loadOgFont } from "@/lib/og";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const font = await loadOgFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: OG_BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#3d2b0f",
          padding: 80,
          gap: 28,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: -2,
            textAlign: "center",
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            fontSize: 46,
            color: "#7c4a03",
            textAlign: "center",
          }}
        >
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans JP", data: font, style: "normal", weight: 700 },
      ],
    },
  );
}
