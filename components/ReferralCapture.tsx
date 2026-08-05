"use client";

import { useEffect } from "react";

import { captureFirstTouchRefFromSearch } from "@/lib/referral";

/** First-touch `?ref=` → localStorage (30 dni). Nigdy nie może wywalić layoutu. */
export function ReferralCapture() {
  useEffect(() => {
    try {
      captureFirstTouchRefFromSearch(window.location.search);
    } catch {
      // ignore — landing musi działać bez referral
    }
  }, []);

  return null;
}
