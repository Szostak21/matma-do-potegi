"use client";

import { useEffect } from "react";

import {
  trackPurchase,
  waitForTrackingReady,
} from "@/lib/analytics-events";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";

const PURCHASE_TRACKED_PREFIX = "matma_purchase_tracked_";

type PurchaseTrackerProps = {
  token: string;
  amountGrosze: number;
};

/**
 * Po powrocie ze Stripe skrypty GA4/Pixel ładują się asynchronicznie
 * (consent → Script afterInteractive). Bez czekania purchase ginął,
 * a sessionStorage i tak blokował ponowną próbę.
 */
export function PurchaseTracker({ token, amountGrosze }: PurchaseTrackerProps) {
  useEffect(() => {
    const storageKey = `${PURCHASE_TRACKED_PREFIX}${token}`;
    let cancelled = false;

    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    async function sendPurchase() {
      await waitForTrackingReady({ timeoutMs: 12_000 });

      if (cancelled) {
        return;
      }

      // Brak zgody — nie oznaczaj jako wysłane (użytkownik może zmienić preferencje).
      if (!hasAnalyticsConsent()) {
        return;
      }

      const result = trackPurchase({
        value: amountGrosze / 100,
        transactionId: token,
      });

      // Oznacz dopiero po realnym wysłaniu do GA4 i/lub Pixela.
      if (result.ga || result.meta) {
        sessionStorage.setItem(storageKey, "1");
      }
    }

    void sendPurchase();

    return () => {
      cancelled = true;
    };
  }, [token, amountGrosze]);

  return null;
}
