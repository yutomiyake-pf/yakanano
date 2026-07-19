import type { Metadata } from "next";
import {
  SITE_DESCRIPTION_HOME,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/constants/site";
import { PageComponent } from "./_top/_components/PageComponent";

export const metadata: Metadata = {
  description: SITE_DESCRIPTION_HOME,
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION_HOME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION_HOME,
  },
};

export default function Page() {
  return <PageComponent />;
}
