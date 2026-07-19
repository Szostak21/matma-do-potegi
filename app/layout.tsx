import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";

import { ConsentManager } from "@/components/ConsentManager";

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
  title: "Matma do potęgi | Korepetycje z matematyki Kraków",
  description:
    "Zapisy otwarte. Matura z matematyki bez stresu. Otwieramy drzwi na wymarzone studia. Skuteczna nauka w małych grupach w Krakowie.",
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
        <ConsentManager />
      </body>
    </html>
  );
}
