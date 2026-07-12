"use client";

import { Analytics } from "@/components/Analytics";
import { CookieBanner } from "@/components/ui/CookieBanner";

export function ConsentManager() {
  return (
    <>
      <Analytics />
      <CookieBanner />
    </>
  );
}
