"use client";

import { useEffect, useRef } from "react";

import { trackViewContent } from "@/lib/analytics-events";

type ViewContentTrackerProps = {
  packageName: string;
  value: number;
};

/**
 * Wysyła ViewContent/view_item raz, gdy klient ogląda ofertę na stronie
 * podsumowania rezerwacji (stan "do zapłaty"). Zależności celowo puste —
 * ma wystrzelić raz na montowanie komponentu.
 */
export function ViewContentTracker({
  packageName,
  value,
}: ViewContentTrackerProps) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) {
      return;
    }
    sentRef.current = true;

    trackViewContent({ packageType: packageName, value });
  }, [packageName, value]);

  return null;
}
