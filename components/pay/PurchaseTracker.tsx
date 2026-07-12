"use client";

import { useEffect } from "react";

import { trackPurchase } from "@/lib/analytics-events";

const PURCHASE_TRACKED_PREFIX = "matma_purchase_tracked_";

type PurchaseTrackerProps = {
  token: string;
  amountGrosze: number;
};

export function PurchaseTracker({ token, amountGrosze }: PurchaseTrackerProps) {
  useEffect(() => {
    const storageKey = `${PURCHASE_TRACKED_PREFIX}${token}`;

    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    trackPurchase({
      value: amountGrosze / 100,
      transactionId: token,
    });

    sessionStorage.setItem(storageKey, "1");
  }, [token, amountGrosze]);

  return null;
}
