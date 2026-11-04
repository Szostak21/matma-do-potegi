"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type PaymentStatusRefresherProps = {
  /** Gdy false — odświeża stronę, aż webhook/Stripe potwierdzą PAID. */
  isPaid: boolean;
};

/**
 * Stripe czasem wraca na success zanim sesja jest już "paid" po retrieve.
 * Bez odświeżenia PurchaseTracker w ogóle się nie montuje.
 */
export function PaymentStatusRefresher({
  isPaid,
}: PaymentStatusRefresherProps) {
  const router = useRouter();

  useEffect(() => {
    if (isPaid) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 15;

    const intervalId = window.setInterval(() => {
      attempts += 1;
      router.refresh();

      if (attempts >= maxAttempts) {
        window.clearInterval(intervalId);
      }
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPaid, router]);

  return null;
}
