"use client";

import { useEffect } from "react";

import { captureFirstTouchUtmFromSearch } from "@/lib/utm";

/**
 * First-touch UTM z URL (kampanie Meta) → sessionStorage.
 * Działa na każdej trasie, żeby złapać landing z query params.
 */
export function UtmCapture() {
  useEffect(() => {
    captureFirstTouchUtmFromSearch(window.location.search);
  }, []);

  return null;
}
