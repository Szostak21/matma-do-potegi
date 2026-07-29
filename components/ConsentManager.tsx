"use client";

import { useEffect } from "react";

import { Analytics } from "@/components/Analytics";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { syncConsentCookieFromStorage } from "@/lib/cookie-consent";

export function ConsentManager() {
  useEffect(() => {
    syncConsentCookieFromStorage();
  }, []);

  return (
    <>
      <Analytics />
      <CookieBanner />
    </>
  );
}
