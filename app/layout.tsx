import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import {
  GA_MEASUREMENT_ID,
  SITE_COMPANY,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "../constants/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-jp",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  verification: {
    google: "luE1L6y7GS1pc5uGmP9UZ71sKdrlqb6OOVz_TilF8Ok",
  },
  other: {
    "google-adsense-account": "ca-pub-2781765293368238",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-96x.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [{ url: "/icon-180x.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${notoSansJP.variable}`}
      suppressHydrationWarning
    >
      <body className="text-base-content font-sans min-h-screen flex flex-col">
        <main className="container mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="footer footer-center bg-base-100/70 text-base-content/70 border-base-300 border-t px-4 sm:px-6 lg:px-8 py-6">
          <aside className="flex flex-col items-center gap-2">
            <nav className="flex items-center gap-4">
              <Link href="/terms" className="link link-hover">
                利用規約
              </Link>
              <Link href="/privacy" className="link link-hover">
                プライバシーポリシー
              </Link>
            </nav>
            <p className="text-xs">
              地名データ © OpenStreetMap contributors ／ 気象データ Open-Meteo
            </p>
            <p>© 2026 {SITE_NAME}</p>
            <p>Produced by {SITE_COMPANY}</p>
          </aside>
        </footer>
        {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
      </body>
    </html>
  );
}
