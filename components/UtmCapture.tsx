"use client";

import { useEffect } from "react";

import { captureFirstTouchUtmFromSearch } from "@/lib/utm";

/**
 * First-touch UTM / kliknięcia Ads z URL → sessionStorage.
 * Działa na każdej trasie, żeby złapać landing z query params.
 */
export function UtmCapture() {
  useEffect(() => {
    captureFirstTouchUtmFromSearch(window.location.search);
  }, []);

  return null;
}
