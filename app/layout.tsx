import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";

import { ConsentManager } from "@/components/ConsentManager";
import { ReferralCapture } from "@/components/ReferralCapture";
import { UtmCapture } from "@/components/UtmCapture";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Matma do potęgi | Korepetycje z matematyki Kraków",
  description:
    "Zapisy otwarte. Matura z matematyki bez stresu. Otwieramy drzwi na wymarzone studia. Skuteczna nauka w małych grupach w Krakowie.",
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: SITE_NAME,
    title: "Matma do potęgi | Korepetycje z matematyki Kraków",
    description:
      "Zapisy otwarte. Matura z matematyki bez stresu. Otwieramy drzwi na wymarzone studia. Skuteczna nauka w małych grupach w Krakowie.",
    url: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  verification: {
    google: "TAfdQHcV6g-t2XfRCeecJVbLgmOt2pAEuEQBf_ObK5U",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${instrumentSerif.variable} ${inter.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <UtmCapture />
        <ReferralCapture />
        <ConsentManager />
      </body>
    </html>
  );
}
