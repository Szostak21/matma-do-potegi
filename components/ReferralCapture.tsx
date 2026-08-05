"use client";

import { useEffect } from "react";

import { captureFirstTouchRefFromSearch } from "@/lib/referral";

/** First-touch `?ref=` → localStorage (30 dni). */
export function ReferralCapture() {
  useEffect(() => {
    captureFirstTouchRefFromSearch(window.location.search);
  }, []);

  return null;
}
