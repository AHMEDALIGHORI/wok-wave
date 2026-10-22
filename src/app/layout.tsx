import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, Caveat_Brush } from "next/font/google";
import localFont from "next/font/local";
import { site } from "@/site.config";
import "./globals.css";
import manifest from "../../public/frames/manifest.json";
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: "800",
  variable: "--font-display",
  display: "swap",
});
const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const hand = Caveat_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-hand",
  display: "swap",
  preload: true,
});
// Google Fonts text= subset, self-hosted through next/font; regenerate after changing Chinese copy.
const chinese = localFont({
  src: "./fonts/noto-sc-subset.woff2",
  weight: "900",
  variable: "--font-chinese",
  display: "swap",
  preload: false,
});
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    images: [
      {
        url: `/posters/${site.dishes[0].id}.webp`,
        width: manifest[site.dishes[0].id as keyof typeof manifest].desktop.w,
        height: manifest[site.dishes[0].id as keyof typeof manifest].desktop.h,
        alt: site.dishes[0].name,
      },
    ],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const colors = Object.fromEntries(
    Object.entries(site.colors).map(([key, value]) => [
      `--brand-${key}`,
      value,
    ]),
  );
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${hand.variable} ${chinese.variable}`}
      style={colors as React.CSSProperties}
    >
      <body>
        <a className="skip-link" href="#main">
          {site.ui.skip}
        </a>
        {children}
      </body>
    </html>
  );
}
